"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Shield,
  Video,
  Radar,
  Settings,
  UsersIcon,
  ChevronLeft,
  ChevronRight,
  PanelLeftIcon,
  MessageSquare,
} from "lucide-react"

const mainNav = [
  { href: "/", label: "Overview", Icon: LayoutDashboard },
  { href: "/threat-intelligence", label: "Threat Intelligence", Icon: Shield },
  { href: "/video-analytics", label: "Video Analytics", Icon: Video },
  { href: "/border-security", label: "Border Security", Icon: Radar },
]
const bottomNav = [
  { href: "/chat", label: "Chatbot", Icon: MessageSquare },
  { href: "/settings", label: "Settings", Icon: Settings },
  { href: "/users", label: "Users", Icon: UsersIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("sidebar.collapsed")
    if (stored) setCollapsed(stored === "1")
  }, [])
  useEffect(() => {
    localStorage.setItem("sidebar.collapsed", collapsed ? "1" : "0")
  }, [collapsed])

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 h-svh shrink-0 border-r bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-12 items-center justify-between gap-2 px-3">
        <div className="flex items-center gap-2">
          <PanelLeftIcon className="size-5 opacity-70" aria-hidden />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="text-sm font-semibold"
              >
                Uraan Defence AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          className="rounded-md p-1 text-muted-foreground ring-1 ring-transparent transition hover:text-foreground hover:ring-primary/30"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {/* scrollable nav with bottom section */}
      <div className="flex h-[calc(100svh-3rem)] flex-col overflow-y-auto px-2 pb-3 scroll-smooth">
        <nav className="flex flex-col gap-1">
          {mainNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
            const Ico = item.Icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                  active ? "text-sidebar-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                title={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-md bg-sidebar-primary/12"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  <Ico className="size-4" aria-hidden />
                </span>
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      className="relative z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-2">
          <div className="mb-2 h-px w-full bg-sidebar-border/60" />
          <nav className="flex flex-col gap-1">
            {bottomNav.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
              const Ico = item.Icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                    active ? "text-sidebar-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="activeNavBottom"
                      className="absolute inset-0 rounded-md bg-sidebar-primary/12"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    <Ico className="size-4" aria-hidden />
                  </span>
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        className="relative z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}
