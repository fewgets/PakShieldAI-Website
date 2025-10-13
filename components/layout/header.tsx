"use client"

import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "./theme-toggle"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/", label: "Overview" },
  { href: "/threat-intelligence", label: "Threat Intelligence" },
  { href: "/video-analytics", label: "Video Analytics" },
  { href: "/border-security", label: "Border Security" },
]

export function Header() {
  const pathname = usePathname()
  return (
    <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="flex items-center gap-3"
        >
          <Image
            src="/images/pakshield-logo.jpg"
            alt="PakShield Defence AI"
            width={28}
            height={28}
            className="opacity-90 drop-shadow"
          />
          <div className="leading-tight">
            <div className="font-semibold">PakShield Defence AI</div>
            <div className="text-xs text-muted-foreground">Cyber Operations Dashboard</div>
          </div>
        </motion.div>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "relative rounded-md px-3 py-2 text-sm transition-colors",
                    "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span className="relative z-10">{item.label}</span>
                  {/* subtle hover glow */}
                  <span className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-transparent transition-all hover:ring-primary/30" />
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
