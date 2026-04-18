'use client'

import { useState } from 'react'
import { AppShell } from '@/src/components/layout/app-shell'
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Buildings,
  Users,
  CaretRight,
  CheckCircle,
} from '@phosphor-icons/react'

const TABS = [
  { id: 'profile',       label: 'Profile',      icon: User       },
  { id: 'security',      label: 'Security',     icon: Lock       },
  { id: 'notifications', label: 'Notifications', icon: Bell      },
  { id: 'billing',       label: 'Billing',       icon: CreditCard },
  { id: 'organization',  label: 'Organization',  icon: Buildings  },
  { id: 'team',          label: 'Team',          icon: Users      },
]

function ProfileSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground/90">Profile</h2>
        <p className="mt-1 text-xs text-muted-foreground/70">Manage your account details and preferences.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 rounded-2xl border border-border bg-card/40 p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-xl font-bold text-white shadow-[0_0_16px_rgba(99,102,241,0.3)]">
          JL
        </div>
        <div>
          <p className="text-sm font-medium text-foreground/90">Jaime Luna</p>
          <p className="text-xs text-muted-foreground/70">theluna@gmail.com</p>
          <button className="mt-2 text-xs font-medium text-primary hover:text-primary/80">
            Change avatar
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="rounded-2xl border border-border bg-card/40 divide-y divide-border overflow-hidden">
        {[
          { label: 'Full Name',  value: 'Jaime Luna',           type: 'text'  },
          { label: 'Email',      value: 'theluna@gmail.com',    type: 'email' },
          { label: 'Phone',      value: '(512) 555-0100',       type: 'tel'   },
          { label: 'Time Zone',  value: 'America/Chicago (CST)', type: 'text' },
        ].map((f) => (
          <div key={f.label} className="flex items-center justify-between px-5 py-4">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-muted-foreground/70">{f.label}</p>
              <p className="mt-0.5 text-xs text-foreground/90">{f.value}</p>
            </div>
            <button className="shrink-0 text-[11px] font-medium text-primary hover:text-primary/80">
              Edit
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90">
          Save Changes
        </button>
      </div>
    </div>
  )
}

function NotificationsSection() {
  const groups = [
    {
      label: 'Payments',
      items: [
        { key: 'rent_received',  label: 'Rent received',     sub: 'When a tenant pays rent',       email: true,  push: true  },
        { key: 'payment_late',   label: 'Payment overdue',   sub: 'When a payment is past due',    email: true,  push: true  },
        { key: 'deposit_refund', label: 'Deposit processed', sub: 'When a deposit is returned',    email: true,  push: false },
      ],
    },
    {
      label: 'Maintenance',
      items: [
        { key: 'req_new',      label: 'New request',      sub: 'When a tenant opens a request', email: true,  push: true  },
        { key: 'req_update',   label: 'Request updated',  sub: 'Status changes on requests',    email: false, push: true  },
        { key: 'req_resolved', label: 'Request resolved', sub: 'When a request is closed',      email: true,  push: false },
      ],
    },
    {
      label: 'Leases',
      items: [
        { key: 'lease_expiry',  label: 'Lease expiring soon', sub: '60 days before expiration',      email: true,  push: true  },
        { key: 'lease_signed',  label: 'Lease signed',        sub: 'When a new lease is executed',   email: true,  push: false },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground/90">Notifications</h2>
        <p className="mt-1 text-xs text-muted-foreground/70">Choose which events trigger emails or push notifications.</p>
      </div>
      {groups.map((g) => (
        <div key={g.label} className="rounded-2xl border border-border bg-card/40 overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <p className="text-xs font-semibold text-foreground/75">{g.label}</p>
          </div>
          <div className="divide-y divide-border">
            {g.items.map((item) => (
              <div key={item.key} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/90">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground/70">{item.sub}</p>
                </div>
                <div className="flex items-center gap-4">
                  {[{ label: 'Email', val: item.email }, { label: 'Push', val: item.push }].map((t) => (
                    <label key={t.label} className="flex cursor-pointer items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground/70">{t.label}</span>
                      <div className={`h-4 w-7 rounded-full transition-colors ${t.val ? 'bg-primary' : 'bg-muted'}`}>
                        <div className={`mt-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${t.val ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground/90">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/20 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 mb-4">
          <CheckCircle weight="duotone" className="h-6 w-6 text-muted-foreground/70" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title} settings</p>
        <p className="mt-1 text-xs text-muted-foreground/50">This section is coming soon.</p>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const renderContent = () => {
    if (activeTab === 'profile') return <ProfileSection />
    if (activeTab === 'notifications') return <NotificationsSection />
    return (
      <PlaceholderSection
        title={TABS.find(t => t.id === activeTab)?.label ?? ''}
        description="Configure this section to match your preferences."
      />
    )
  }

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
          <p className="mt-1 text-xs text-muted-foreground/70">Manage your account, notifications, and organization.</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar nav */}
          <nav className="flex flex-row flex-wrap gap-1 lg:w-48 lg:flex-col lg:shrink-0">
            {TABS.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    active
                      ? 'bg-primary/[0.12] text-primary ring-1 ring-inset ring-primary/[0.18]'
                      : 'text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <tab.icon
                    weight={active ? 'fill' : 'regular'}
                    className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground/50'}`}
                  />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {active && <CaretRight weight="bold" className="h-3 w-3 text-primary/60" />}
                </button>
              )
            })}
          </nav>

          {/* Content */}
          <div className="min-w-0 flex-1">{renderContent()}</div>
        </div>
      </div>
    </AppShell>
  )
}
