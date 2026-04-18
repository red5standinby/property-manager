'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import {
  Bell,
  Buildings,
  CaretRight,
  ChartBar,
  CurrencyDollar,
  FileText,
  Gear,
  House,
  List,
  MagnifyingGlass,
  Users,
  Wrench,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',   icon: House          },
  { href: '/properties',  label: 'Properties',  icon: Buildings      },
  { href: '/tenants',     label: 'Tenants',     icon: Users          },
  { href: '/leases',      label: 'Leases',      icon: FileText       },
  { href: '/payments',    label: 'Payments',    icon: CurrencyDollar },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench         },
  { href: '/reports',     label: 'Reports',     icon: ChartBar       },
] as const

const BOTTOM_NAV = [
  { href: '/settings', label: 'Settings', icon: Gear },
] as const

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-brand-glow-sm">
        <div className="h-3 w-3 rotate-45 rounded-sm bg-white/90" />
      </div>
      <span className="text-sm font-semibold tracking-tight text-foreground">
        Vesta
        <span className="ml-px text-primary">OS</span>
      </span>
    </div>
  )
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150',
        active
          ? 'bg-primary/[0.12] text-primary ring-1 ring-inset ring-primary/[0.18]'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <Icon
        weight={active ? 'fill' : 'regular'}
        className={cn('h-4 w-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-muted-foreground')}
      />
      <span className="flex-1">{label}</span>
      {active && (
        <CaretRight weight="bold" className="h-3 w-3 text-primary/60" />
      )}
    </Link>
  )
}

function SidebarContent({
  pathname,
  onNavClick,
}: {
  pathname: string
  onNavClick?: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-border px-4">
        <BrandMark />
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
            onClick={onNavClick}
          />
        ))}

        <div className="mt-auto pt-4">
          <Separator className="mb-4 bg-border" />
          {BOTTOM_NAV.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
              onClick={onNavClick}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/40">
          <Avatar size="sm">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-600 text-[10px] font-bold text-white">
              JL
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-medium text-foreground/90">Jaime Luna</span>
            <span className="truncate text-[10px] text-muted-foreground/70">Administrator</span>
          </div>
          <CaretRight weight="bold" className="h-3 w-3 shrink-0 text-muted-foreground/50" />
        </div>
      </div>
    </div>
  )
}

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground hover:text-foreground lg:hidden"
        onClick={onMenuClick}
      >
        <List className="h-4 w-4" />
      </Button>

      <div className="relative flex-1 max-w-sm">
        <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
        <input
          type="search"
          placeholder="Search properties, tenants..."
          className="h-8 w-full rounded-lg border border-border bg-card/60 pl-8 pr-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 flex h-1.5 w-1.5 rounded-full bg-primary shadow-brand-glow-xs" />
        </Button>

        <div className="ml-1 h-4 w-px bg-border" />

        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60">
          <Avatar size="sm">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-600 text-[10px] font-bold text-white">
              JL
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-xs font-medium text-foreground/75 sm:block">Jaime</span>
          <CaretRight weight="bold" className="h-3 w-3 rotate-90 text-muted-foreground/70" />
        </button>
      </div>
    </header>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="left"
          className="w-60 border-border bg-card p-0"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent
            pathname={pathname}
            onNavClick={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSheetOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
