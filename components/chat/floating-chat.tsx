"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, Send, X, Bot, Loader2 } from "lucide-react"

type Msg = { id: string; role: "user" | "assistant"; text: string }

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])

  const panelRef = useRef<HTMLDivElement>(null)
  const storageKey = "ps_floating_chat"

  useEffect(() => {
    try {
      const cached = localStorage.getItem(storageKey)
      if (cached) setMessages(JSON.parse(cached))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch {}
  }, [messages])

  function send() {
    if (!input.trim()) return
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: input.trim() }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setLoading(true)
    setTimeout(() => {
      const botText = "Demo assistant response. Connect FastAPI later via config to stream model outputs."
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", text: botText }])
      setLoading(false)
      panelRef.current?.scrollTo({ top: 10_000, behavior: "smooth" })
    }, 700)
  }

  return (
    <>
      <button
        aria-label="Open Chatbot"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full btn-cyber cursor-pointer shadow-lg animate-pulse-glow"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      <div
        className={[
          "fixed bottom-20 right-4 z-50 w-[min(92vw,380px)] rounded-xl border glow-border shadow-xl transition-all",
          "bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90",
          open ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4",
        ].join(" ")}
      >
        <header className="flex items-center justify-between px-3 py-2 border-b">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <p className="text-sm font-medium">PakShield Assistant</p>
          </div>
          <button aria-label="Close" className="p-1 hover:opacity-80 cursor-pointer" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </header>

        <div ref={panelRef} className="max-h-80 overflow-y-auto px-3 py-2 space-y-2">
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
              <span
                className={[
                  "inline-block rounded-md px-3 py-1.5 text-sm",
                  m.role === "user" ? "bg-primary/15" : "bg-muted",
                ].join(" ")}
              >
                {m.text}
              </span>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Assistant typing…</span>
            </div>
          )}
        </div>

        <form
          className="flex items-center gap-2 p-3"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about threats…"
            className="h-9 flex-1 rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-2"
          />
          <button
            type="submit"
            className="btn-cyber cursor-pointer inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </>
  )
}
