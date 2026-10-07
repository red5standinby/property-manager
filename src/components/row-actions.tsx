'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

// ─── Row action menu ──────────────────────────────────────────────
//
// Self-contained (own portal + styling) so row actions never depend on
// ghost theme tokens that may be missing. One compact "⋯" trigger that
// exposes primary actions inline — this is the fix for "landlords hate
// 4-screen late-fee edits": the whole edit is a menu item away.

export const RowActions = DropdownMenuPrimitive.Root
export const RowActionsTrigger = DropdownMenuPrimitive.Trigger

export function RowActionsContent({
  children,
  align = 'end',
  className,
}: {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align={align}
        sideOffset={6}
        collisionPadding={8}
        className={cn(
          'z-[60] min-w-[11rem] overflow-hidden rounded-xl border border-border bg-card p-1 text-foreground shadow-2xl',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          className,
        )}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}

export function RowActionItem({
  children,
  icon,
  onSelect,
  tone = 'default',
  disabled,
  className,
}: {
  children: React.ReactNode
  icon?: React.ReactNode
  onSelect?: () => void
  tone?: 'default' | 'danger' | 'success' | 'primary'
  disabled?: boolean
  className?: string
}) {
  const toneClass =
    tone === 'danger'  ? 'text-danger focus:bg-danger/10 focus:text-danger'
    : tone === 'success' ? 'text-success focus:bg-success/10 focus:text-success'
    : tone === 'primary' ? 'text-primary focus:bg-primary/10 focus:text-primary'
    : 'text-foreground/85 focus:bg-muted focus:text-foreground'

  return (
    <DropdownMenuPrimitive.Item
      disabled={disabled}
      onSelect={() => onSelect?.()}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium outline-none transition-colors',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        toneClass,
        className,
      )}
    >
      {icon && <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">{icon}</span>}
      <span className="flex-1">{children}</span>
    </DropdownMenuPrimitive.Item>
  )
}

export function RowActionsSeparator() {
  return <DropdownMenuPrimitive.Separator className="my-1 h-px bg-border" />
}

export function RowActionsLabel({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenuPrimitive.Label className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
      {children}
    </DropdownMenuPrimitive.Label>
  )
}
