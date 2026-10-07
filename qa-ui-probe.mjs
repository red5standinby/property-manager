// VestaOS UI probe — headless Chrome via CDP.
// Seeds demo data into localStorage, loads each page at 390px, and checks:
//   - page renders without crash
//   - horizontal overflow (scrollWidth vs clientWidth)
//   - status badges actually have a non-transparent color
const CDP_PORT = Number((process.argv.find(a => a.startsWith('--port')) || '').split('=')[1] || process.argv[process.argv.indexOf('--port') + 1]) || 9333
const BASE = 'http://localhost:8199/property-manager'

const today = new Date()
const iso = (d) => d.toISOString().slice(0, 10)
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d) }

// Demo world with real entities: delinquent, expiring, open maint, renewals
const demoState = {
  role: 'admin',
  properties: [
    { id: 'p1', name: 'Maple Court', address: '12 Maple St', units: 4, occupied: 3, monthlyRevenue: 5400, status: 'active', createdAt: iso(today), updatedAt: iso(today) },
    { id: 'p2', name: 'Birch Flats', address: '9 Birch Ave', units: 2, occupied: 2, monthlyRevenue: 3100, status: 'active', createdAt: iso(today), updatedAt: iso(today) },
  ],
  tenants: [
    { id: 't1', name: 'Dana Reyes', email: 'dana@example.com', phone: '555-0101', unit: '1A', propertyId: 'p1', status: 'late', since: '2023-01-01', createdAt: iso(today), updatedAt: iso(today) },
    { id: 't2', name: 'Marcus Lee', email: 'marcus@example.com', phone: '555-0102', unit: '2B', propertyId: 'p1', status: 'current', since: '2022-06-01', createdAt: iso(today), updatedAt: iso(today) },
    { id: 't3', name: 'Priya Nair', email: 'priya@example.com', phone: '555-0103', unit: '1', propertyId: 'p2', status: 'current', since: '2024-02-01', createdAt: iso(today), updatedAt: iso(today) },
  ],
  leases: [
    { id: 'l1', propertyId: 'p1', unit: '1A', tenantIds: ['t1'], startDate: '2024-01-01', endDate: addDays(18), rent: 1800, term: '12-month', status: 'expiring', createdAt: iso(today), updatedAt: iso(today) },
    { id: 'l2', propertyId: 'p1', unit: '2B', tenantIds: ['t2'], startDate: '2024-03-01', endDate: addDays(240), rent: 1900, term: '12-month', status: 'active', createdAt: iso(today), updatedAt: iso(today) },
    { id: 'l3', propertyId: 'p2', unit: '1', tenantIds: ['t3'], startDate: '2024-02-01', endDate: addDays(120), rent: 1550, term: '12-month', status: 'review', createdAt: iso(today), updatedAt: iso(today) },
  ],
  payments: [
    { id: 'pay1', leaseId: 'l1', tenantId: 't1', propertyId: 'p1', periodStart: iso(today), periodEnd: addDays(30), amount: 1800, lateFee: 75, lateFeeWaived: false, type: 'rent', method: 'ach', status: 'overdue', paidAt: '', note: '', createdAt: iso(today), updatedAt: iso(today) },
    { id: 'pay2', leaseId: 'l2', tenantId: 't2', propertyId: 'p1', periodStart: iso(today), periodEnd: addDays(30), amount: 1900, lateFee: 0, lateFeeWaived: false, type: 'rent', method: 'card', status: 'partial', paidAt: '', note: '', createdAt: iso(today), updatedAt: iso(today) },
    { id: 'pay3', leaseId: 'l3', tenantId: 't3', propertyId: 'p2', periodStart: iso(today), periodEnd: addDays(30), amount: 1550, lateFee: 0, lateFeeWaived: false, type: 'rent', method: 'ach', status: 'paid', paidAt: iso(today), note: '', createdAt: iso(today), updatedAt: iso(today) },
  ],
  maintenanceRequests: [
    { id: 'm1', title: 'Leaking bathroom sink', description: 'Water pooling under the cabinet.', unit: '1A', tenantId: 't1', propertyId: 'p1', priority: 'urgent', status: 'open', category: 'Plumbing', submitted: addDays(-3), statusHistory: [{ status: 'open', at: addDays(-3), note: 'Request created' }], cost: 0, resolvedAt: '', createdAt: iso(today), updatedAt: iso(today) },
    { id: 'm2', title: 'HVAC not cooling', description: 'Blows warm air.', unit: '2B', tenantId: 't2', propertyId: 'p1', priority: 'high', status: 'in-progress', category: 'HVAC', submitted: addDays(-6), statusHistory: [{ status: 'open', at: addDays(-6), note: 'Request created' }, { status: 'in-progress', at: addDays(-2), note: 'Tech scheduled' }], cost: 0, resolvedAt: '', createdAt: iso(today), updatedAt: iso(today) },
  ],
}

async function main() {
  const http = await import('node:http')
  const get = (path) => new Promise((res, rej) => {
    http.default.get({ host: '127.0.0.1', port: CDP_PORT, path }, (r) => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)))
    }).on('error', rej)
  })
  const list = (await get('/json/list'))
  const targets = list.find(t => t.type === 'page') || list[0]
  const WebSocket = (await import('/tmp/vesta-probe/node_modules/ws/index.js')).default
  const ws = new WebSocket(targets.webSocketDebuggerUrl, { perMessageDeflate: false, maxPayload: 256 * 1024 * 1024 })
  let id = 0
  const pending = new Map()
  ws.on('message', (m) => {
    const msg = JSON.parse(m)
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) }
  })
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
  await new Promise(r => ws.on('open', r))

  await send('Runtime.enable')
  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })

  // Navigate to origin so we can set localStorage
  await send('Page.navigate', { url: BASE + '/ops.html' })
  await new Promise(r => setTimeout(r, 1500))
  await send('Runtime.evaluate', { expression: `localStorage.setItem('vestaos-state', ${JSON.stringify(JSON.stringify(demoState))})` })
  // Also try common keys
  await send('Runtime.evaluate', { expression: `try { for (const k of Object.keys(localStorage)) { if (k.toLowerCase().includes('vesta') || k.toLowerCase().includes('state')) localStorage.setItem(k, ${JSON.stringify(JSON.stringify(demoState))}) } } catch(e){}` })

  const pages = ['ops', 'payments', 'leases', 'maintenance', 'properties', 'tenants', 'dashboard', 'reports', 'settings']
  const results = []
  for (const p of pages) {
    await send('Page.navigate', { url: `${BASE}/${p}.html` })
    await new Promise(r => setTimeout(r, 1800))
    const probe = await send('Runtime.evaluate', {
      returnByValue: true,
      awaitPromise: false,
      expression: `(() => {
        const de = document.documentElement
        const overflow = de.scrollWidth - de.clientWidth
        let worst = null
        document.querySelectorAll('*').forEach(el => {
          const r = el.getBoundingClientRect()
          if (r.right > de.clientWidth + 1 && r.width > 0) {
            if (!worst || r.right > worst.right) worst = { right: Math.round(r.right), tag: el.tagName, cls: (el.className||'').toString().slice(0,60) }
          }
        })
        const body = document.body.innerText || ''
        const badges = [...document.querySelectorAll('span')].filter(s => /^(paid|pending|partial|overdue|active|expiring|review|ended|open|in-progress|resolved|current|late|urgent|high|medium|low)$/i.test(s.textContent.trim()))
        let colorless = 0
        badges.slice(0,6).forEach(b => {
          const cs = getComputedStyle(b)
          const hasColor = cs.color && cs.color !== 'rgba(0, 0, 0, 0)' && cs.color !== 'rgb(0, 0, 0)'
          const hasBg = cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)'
          if (!hasColor && !hasBg) colorless++
        })
        return { overflow, worst, h1: (document.querySelector('h1')||{}).textContent || '', textLen: body.length, badgeCount: badges.length, colorless, sample: badges.slice(0,3).map(b => getComputedStyle(b).color) }
      })()`
    })
    if (probe.result && probe.result.exceptionDetails) results.push({ page: p, error: JSON.stringify(probe.result.exceptionDetails).slice(0, 200) })
    else results.push({ page: p, ...(probe.result.result.value || {}) })
  }

  console.log(JSON.stringify(results, null, 2))
  ws.close()
  process.exit(0)
}
main().catch(e => { console.error('PROBE ERROR', e); process.exit(1) })
