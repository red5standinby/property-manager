'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type {
  LeaseStatus, MaintenanceRequest, PaymentStatus, PropertyStatus,
  ReqPriority, ReqStatus, TenantStatus,
} from '@/src/lib/types'

// ─── Single source of truth for status colors ─────────────────────
//
// Every page previously re-declared its own color maps (statusStyles /
// badgeStyles / priorityMeta) with near-identical classes. These are
// hoisted here so a "late" payment and a "late" tenant and an "overdue"
// payment always read the same. Utilities resolve against the semantic
// colors defined in globals.css (success / warning / danger).

export type Tone = 'success' | 'warning' | 'danger' | 'primary' | 'violet' | 'muted'

const TONE_PILL: Record<Tone, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger:  'bg-danger/10 text-danger border-danger/25',
  primary: 'bg-primary/10 text-primary border-primary/20',
  violet:  'bg-violet-500/10 text-violet-400 border-violet-500/20',
  muted:   'bg-muted/60 text-muted-foreground border-border',
}

const TONE_DOT: Record<Tone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger:  'bg-danger',
  primary: 'bg-primary',
  violet:  'bg-violet-400',
  muted:   'bg-muted-foreground',
}

export const STATUS_TONE: Record<string, Tone> = {
  // lease statuses
  active: 'success', expiring: 'warning', review: 'primary', ended: 'muted',
  // payment statuses
  paid: 'success', pending: 'warning', partial: 'primary', overdue: 'danger',
  // tenant statuses
  current: 'success', late: 'danger',
  // maintenance statuses
  open: 'primary', 'in-progress': 'warning', resolved: 'success',
  // property statuses (renovation=warning, pending=muted)
  renovation: 'warning',
}

export const PRIORITY_TONE: Record<ReqPriority, Tone> = {
  urgent: 'danger', high: 'warning', medium: 'warning', low: 'muted',
}

export function toneFor(status: string): Tone {
  return STATUS_TONE[status] ?? 'muted'
}

/** Capitalize a kebab/space status for display, e.g. in-progress → In Progress. */
export function statusLabel(status: string): string {
  return status
    .split(/[-_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const ICON_CLASS = 'h-3 w-3'

interface StatusBadgeProps {
  status: string
  /** Override the auto-detected tone. */
  tone?: Tone
  /** Render a small leading dot in addition to / instead of text. */
  dot?: boolean
  /** Optional leading icon. */
  icon?: ReactNode
  /** Override the visible label (defaults to a title-cased status). */
  label?: string
  /** Uppercase micro-badge styling (used for maintenance priority). */
  micro?: boolean
  className?: string
}

/** The canonical status pill. Use this everywhere a status is shown so
 *  payments / leases / maintenance / tenants stay visually consistent. */
export function StatusBadge({
  status, tone, dot = true, icon, label, micro = false, className,
}: StatusBadgeProps) {
  const t = tone ?? toneFor(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border font-medium whitespace-nowrap',
        micro
          ? 'px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide'
          : 'px-2 py-0.5 text-[10px]',
        TONE_PILL[t],
        className,
      )}
    >
      {icon ? <span className={ICON_CLASS}>{icon}</span> : dot && <span className={cn('h-1.5 w-1.5 rounded-full', TONE_DOT[t])} />}
      {label ?? statusLabel(status)}
    </span>
  )
}

export const priorityTone = (p: ReqPriority): Tone => PRIORITY_TONE[p] ?? 'muted'
export const maintenanceTone = (r: Pick<MaintenanceRequest, 'priority'>) => priorityTone(r.priority)
export const reqStatusTone = (s: ReqStatus): Tone => toneFor(s)
export const leaseTone = (s: LeaseStatus): Tone => toneFor(s)
export const paymentTone = (s: PaymentStatus): Tone => toneFor(s)
export const tenantTone = (s: TenantStatus): Tone => toneFor(s)
export const propertyTone = (s: PropertyStatus): Tone => toneFor(s)
