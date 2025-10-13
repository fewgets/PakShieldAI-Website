"use client"

import { useEffect, useState } from "react"
import { Plus, MessageSquare, Trash2, Pencil, Send } from "lucide-react"

type Conv = { id: string; title: string; messages: { role: "user" | "assistant"; text: string }[] }
const STORE = "ps_full_chat"

export default function ChatPage() {
  const [list, setList] = useState<Conv[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [input, setInput] = useState("")

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORE)
      if (cached) {
        const parsed: Conv[] = JSON.parse(cached)
        setList(parsed)
        setActive(parsed[0]?.id ?? null)
      } else {
        const id = crypto.randomUUID()
        const init: Conv = { id, title: "New chat", messages: [] }
        setList([init])
        setActive(id)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(list))
    } catch {}
  }, [list])

  const current = list.find((c) => c.id === active) || null

  function newChat() {
    const id = crypto.randomUUID()
    const next: Conv = { id, title: "New chat", messages: [] }
    setList((l) => [next, ...l])
    setActive(id)
  }
  function delChat(id: string) {
    setList((l) => l.filter((c) => c.id !== id))
    setActive((a) => (a === id ? null : a))
  }
  function renameChat(id: string) {
    const title = prompt("Rename chat")?.trim()
    if (!title) return
    setList((l) => l.map((c) => (c.id === id ? { ...c, title } : c)))
  }
  function send() {
    if (!current || !input.trim()) return
    const user = { role: "user" as const, text: input.trim() }
    const bot = {
      role: "assistant" as const,
      text: "Demo response. Configure Chatbot provider and keys in Settings.",
    }
    setList((l) => l.map((c) => (c.id === current.id ? { ...c, messages: [...c.messages, user, bot] } : c)))
    setInput("")
  }

  return (
    <main className="grid h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] grid-cols-1 md:grid-cols-[280px_1fr] bg-background">
      <aside className="border-r glow-border bg-card/95 supports-[backdrop-filter]:bg-card/90 backdrop-blur">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Chatbot
          </h2>
          <button className="btn-cyber cursor-pointer h-8 px-2" onClick={newChat}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-2 space-y-1">
          {list.map((c) => (
            <div
              key={c.id}
              className={[
                "group flex items-center justify-between rounded-md px-2 py-2 text-sm cursor-pointer",
                c.id === active ? "bg-primary/10" : "hover:bg-muted",
              ].join(" ")}
              onClick={() => setActive(c.id)}
            >
              <span className="truncate">{c.title}</span>
              <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  className="p-1 hover:opacity-80 cursor-pointer"
                  onClick={(e) => (e.stopPropagation(), renameChat(c.id))}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  className="p-1 hover:opacity-80 cursor-pointer"
                  onClick={(e) => (e.stopPropagation(), delChat(c.id))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            </div>
          ))}
        </div>
      </aside>

      <section className="relative glow-border bg-card/95 supports-[backdrop-filter]:bg-card/90 backdrop-blur">
        <div className="absolute inset-0 -z-10 opacity-70">{/* Keeps global animated bg vibe if present behind */}</div>
        <div className="h-full grid grid-rows-[1fr_auto]">
          <div className="overflow-y-auto p-4 space-y-2">
            {current?.messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
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
          </div>
          <form
            className="flex items-center gap-2 p-3 border-t"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about surveillance, threats, borders…"
              className="h-10 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2"
            />
            <button type="submit" className="btn-cyber cursor-pointer h-10 px-4 inline-flex items-center gap-1">
              <Send className="h-4 w-4" /> Send
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
