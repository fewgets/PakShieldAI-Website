"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [animations, setAnimations] = useState(true)
  const [refresh, setRefresh] = useState(30)
  const [hideSensitive, setHideSensitive] = useState(false)
  const [useSystem, setUseSystem] = useState(false)

  useEffect(() => {
    setAnimations(localStorage.getItem("pref.animations") !== "0")
    const r = Number(localStorage.getItem("pref.refresh") || 30)
    setRefresh(Number.isFinite(r) ? r : 30)
    setHideSensitive(localStorage.getItem("pref.hideSensitive") === "1")
    setUseSystem(localStorage.getItem("pref.themeSystem") === "1" || theme === "system")
  }, [])

  useEffect(() => {
    localStorage.setItem("pref.animations", animations ? "1" : "0")
    document.documentElement.dataset.animations = animations ? "on" : "off"
  }, [animations])

  useEffect(() => {
    localStorage.setItem("pref.refresh", String(refresh))
  }, [refresh])

  useEffect(() => {
    localStorage.setItem("pref.hideSensitive", hideSensitive ? "1" : "0")
  }, [hideSensitive])

  useEffect(() => {
    localStorage.setItem("pref.themeSystem", useSystem ? "1" : "0")
    if (useSystem) setTheme("system")
  }, [useSystem, setTheme])

  const isDark = (theme || resolvedTheme) === "dark"

  const resetDefaults = () => {
    localStorage.removeItem("pref.animations")
    localStorage.removeItem("pref.refresh")
    localStorage.removeItem("pref.hideSensitive")
    localStorage.removeItem("pref.themeSystem")
    setAnimations(true)
    setRefresh(30)
    setHideSensitive(false)
    setUseSystem(false)
    setTheme("dark")
    document.documentElement.dataset.animations = "on"
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm">Use System Theme</span>
            <Switch checked={useSystem} onCheckedChange={setUseSystem} />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm">Theme</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              Light
              <Switch
                checked={(theme || resolvedTheme) === "dark"}
                onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
                disabled={useSystem}
              />
              Dark
            </div>
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm">Animations</span>
            <Switch checked={animations} onCheckedChange={setAnimations} />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm">API Refresh (seconds)</span>
            <input
              className="w-28 rounded-md border bg-background px-3 py-2 text-sm"
              type="number"
              min={5}
              value={refresh}
              onChange={(e) => setRefresh(Number(e.target.value))}
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm">Hide Sensitive Data</span>
            <Switch checked={hideSensitive} onCheckedChange={setHideSensitive} />
          </label>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Preferences are stored locally and ready to integrate with FastAPI.
        </p>
        <Button variant="outline" onClick={resetDefaults} className="hover-glow bg-transparent">
          Reset to defaults
        </Button>
      </div>
    </div>
  )
}
