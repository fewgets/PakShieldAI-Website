"use client"

import type React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimatedBackground } from "@/components/effects/animated-background"
import AuthGate from "@/components/auth/auth-gate"
import FloatingChat from "@/components/chat/floating-chat"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // animations preference
  useEffect(() => {
    const enabled = localStorage.getItem("pref.animations") !== "0"
    document.documentElement.dataset.animations = enabled ? "on" : "off"
  }, [])

  return (
    <div className="relative flex min-h-svh">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <AnimatedBackground />
      </div>

      <AuthGate />

      <Sidebar />
      <main className="relative z-10 flex-1">
        {/* Global header */}
        <Header />

        <motion.div
          key={pathname} // route-aware animation
          className="mx-auto max-w-7xl p-4 md:p-6"
          initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
        >
          {children}
        </motion.div>

        {/* Global footer */}
        <Footer />
      </main>

      <FloatingChat />
    </div>
  )
}
