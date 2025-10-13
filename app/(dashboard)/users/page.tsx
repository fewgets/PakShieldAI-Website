"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"

export default function UsersPage() {
  const rows = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `Analyst ${i + 1}`,
    role: i % 2 ? "Admin" : "Viewer",
    last: `${(i + 1) * 7}m ago`,
  }))

  const [query, setQuery] = useState("")
  const [role, setRole] = useState<"All" | "Admin" | "Viewer">("All")

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const roleOk = role === "All" || r.role === role
      const q = query.trim().toLowerCase()
      const searchOk = !q || r.name.toLowerCase().includes(q)
      return roleOk && searchOk
    })
  }, [rows, role, query])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Users</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">User Activity</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search analysts…"
              className="h-8 w-52"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center gap-2 text-xs">
              <button
                className={`rounded px-2 py-1 ${role === "All" ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"}`}
                onClick={() => setRole("All")}
              >
                All
              </button>
              <button
                className={`rounded px-2 py-1 ${role === "Admin" ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"}`}
                onClick={() => setRole("Admin")}
              >
                Admin
              </button>
              <button
                className={`rounded px-2 py-1 ${role === "Viewer" ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"}`}
                onClick={() => setRole("Viewer")}
              >
                Viewer
              </button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 pr-4">{r.id}</td>
                  <td className="py-2 pr-4">{r.name}</td>
                  <td className="py-2 pr-4">{r.role}</td>
                  <td className="py-2 pr-4">{r.last}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr className="border-t">
                  <td colSpan={4} className="py-6 text-center text-xs text-muted-foreground">
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
