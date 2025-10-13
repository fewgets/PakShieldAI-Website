"use client"

import { useEffect } from "react"

export default function AuthGate() {
  useEffect(() => {
    // Prefer instant client-side redirect for Next.js preview
    try {
      const token = localStorage.getItem("ps_token")
      if (!token && window.location.pathname !== "/login") {
        window.location.replace("/login")
      }
    } catch {
      // In restricted environments, safely no-op
    }
  }, [])
  return null
}
