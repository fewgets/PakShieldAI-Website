"use client"

import AnimatedBackground from "@/components/effects/animated-background"
import { useState, useTransition } from "react"

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <main className="relative min-h-dvh flex items-center justify-center">
      {/* fixed background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <AnimatedBackground />
      </div>

      <div className="mx-4 w-full max-w-md rounded-xl border bg-card/80 backdrop-blur-sm glow-border p-6">
        <header className="mb-6 text-center">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">Defense AI Command</h1>
          <p className="mt-1 text-sm text-muted-foreground">Secure access to your cyber operations.</p>
        </header>

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            try {
              localStorage.setItem("ps_token", "demo-token")
              localStorage.setItem("ps_user", JSON.stringify({ email }))
            } catch {}
            startTransition(() => {
              const el = document.getElementById("login-card")
              el?.classList.add("animate-pulse-glow")
              setTimeout(() => {
                el?.classList.remove("animate-pulse-glow")
                window.location.href = "/"
              }, 650)
            })
          }}
        >
          <div id="login-card" className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2"
              placeholder="you@domain.com"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-cyber cursor-cyber mt-2 inline-flex h-10 items-center justify-center rounded-md bg-primary/15 px-4 text-sm font-semibold hover:bg-primary/20"
          >
            {isPending ? "Signing in..." : "Login"}
          </button>
        </form>

        <footer className="mt-6 flex items-center justify-end text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Defence AI</span>
        </footer>
      </div>
    </main>
  )
}
