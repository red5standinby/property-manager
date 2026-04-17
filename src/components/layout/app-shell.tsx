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
      <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_12px_rgba(59,130,246,0.4)]">
        <div className="h-3 w-3 rotate-45 rounded-sm bg-white/90" />
      </div>
      <span className="text-sm font-semibold tracking-tight text-zinc-100">
        Vesta
        <span className="ml-px text-blue-400">OS</span>
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
          ? 'bg-blue-500/[0.12] text-blue-300 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.18)]'
          : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100',
      )}
    >
      <Icon
        weight={active ? 'fill' : 'regular'}
        className={cn('h-4 w-4 shrink-0', active ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300')}
      />
      <span className="flex-1">{label}</span>
      {active && (
        <CaretRight weight="bold" className="h-3 w-3 text-blue-400/60" />
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
      <div className="flex h-14 items-center border-b border-zinc-800/60 px-4">
        <BrandMark />
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
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
          <Separator className="mb-4 bg-zinc-800/60" />
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

      <div className="border-t border-zinc-800/60 px-3 py-3">
        <div className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-zinc-800/40">
          <Avatar size="sm">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-600 text-[10px] font-bold text-white">
              JL
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-medium text-zinc-200">Jaime Luna</span>
            <span className="truncate text-[10px] text-zinc-500">Administrator</span>
          </div>
          <CaretRight weight="bold" className="h-3 w-3 shrink-0 text-zinc-600" />
        </div>
      </div>
    </div>
  )
}

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-800/60 bg-zinc-950/80 px-4 backdrop-blur-sm lg:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-zinc-400 hover:text-zinc-100 lg:hidden"
        onClick={onMenuClick}
      >
        <List className="h-4 w-4" />
      </Button>

      <div className="relative flex-1 max-w-sm">
        <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          placeholder="Search properties, tenants..."
          className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 pl-8 pr-3 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-zinc-400 hover:text-zinc-100"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 flex h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.8)]" />
        </Button>

        <div className="ml-1 h-4 w-px bg-zinc-800" />

        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-800/60">
          <Avatar size="sm">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-600 text-[10px] font-bold text-white">
              JL
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-xs font-medium text-zinc-300 sm:block">Jaime</span>
          <CaretRight weight="bold" className="h-3 w-3 rotate-90 text-zinc-500" />
        </button>
      </div>
    </header>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="dark flex h-screen overflow-hidden bg-zinc-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-900/40 lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="left"
          className="w-60 border-zinc-800/60 bg-zinc-900 p-0"
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
