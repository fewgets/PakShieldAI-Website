"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background/80">
      <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground">
        <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Uraan Defence AI. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="opacity-80">System: Online</span>
            <span className="opacity-80">Latency: 120ms</span>
            <span className="opacity-80">Environment: Demo</span>
            <Link href="/settings" className="hover:text-foreground">
              Settings
            </Link>
            <Link href="/users" className="hover:text-foreground">
              Users
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
