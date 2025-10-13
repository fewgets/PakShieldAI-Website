"use client"

import { notFound } from "next/navigation"
import { getModule } from "@/lib/modules"
import type { DomainKey } from "@/lib/modules"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Area, AreaChart } from "recharts"
import { useAppConfig, resolveEndpoint } from "@/lib/config"
import { ActivityLog } from "@/components/widgets/activity-log"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PacketFlow } from "@/components/effects/packet-flow"
import { PacketAnimation } from "@/components/effects/packet-animation"
import { Button } from "@/components/ui/button"
import { use, useMemo, useState, useRef } from "react"

const domain: DomainKey = "threat-intelligence"
type PageParams = { slug: string }
type EmailRun = {
  id: string
  timestamp: Date
  payload: any
}

type IDSRun = {
  id: string
  timestamp: Date
  type: "live" | "upload"
  filename?: string
  payload: any
}

function mockSeries(n = 24) {
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    a: Math.max(0, Math.round(20 + Math.sin(i / 2) * 10 + Math.random() * 6 - 3)),
    b: Math.max(0, Math.round(12 + Math.cos(i / 2) * 6 + Math.random() * 4 - 2)),
  }))
}

export default function ThreatModulePage({ params }: { params: PageParams | Promise<PageParams> }) {
  const resolvedParams =
    typeof (params as Promise<PageParams>)?.then === "function"
      ? use(params as Promise<PageParams>)
      : (params as PageParams)
  const [running, setRunning] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailResult, setEmailResult] = useState<any | null>(null)
  const [emailRuns, setEmailRuns] = useState<EmailRun[]>([])
  const [idsLoading, setIdsLoading] = useState(false)
  const [idsError, setIdsError] = useState<string | null>(null)
  const [idsResult, setIdsResult] = useState<any | null>(null)
  const [idsRuns, setIdsRuns] = useState<IDSRun[]>([])
  const [idsAnimationRunning, setIdsAnimationRunning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { config } = useAppConfig()
  const mod = getModule(domain, resolvedParams.slug)
  if (!mod) return notFound()
  const endpoint = resolveEndpoint(config, mod.endpointKey)
  const data = mockSeries()

  const isEmail = mod.slug === "email-protection"
  const isIds = mod.slug === "intrusion-detection"

  const handleEmailAnalyze = async () => {
    if (!isEmail) return
    if (!endpoint || endpoint === "#") {
      setEmailError("Email endpoint not configured.")
      return
    }
    setEmailLoading(true)
    setEmailError(null)
    try {
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const payload = await response.json()
      setEmailResult(payload)
      setEmailRuns((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date(),
          payload,
        },
        ...prev,
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred"
      setEmailError(message)
    } finally {
      setEmailLoading(false)
    }
  }

  const emailList = Array.isArray(emailResult?.data) ? (emailResult?.data as any[]) : null
  const latestRun = emailRuns[0] ?? null
  const latestPayload = latestRun?.payload ?? null
  const latestEmailList = Array.isArray(latestPayload?.data) ? (latestPayload.data as any[]) : null

  const latestIdsRun = idsRuns[0] ?? null
  const latestIdsPayload = latestIdsRun?.payload ?? null

  const summarizedRuns = useMemo(() => {
    return emailRuns.map((run) => {
      const records = Array.isArray(run.payload?.data) ? (run.payload.data as any[]) : null
      const total = records ? records.length : null
      const positives = records
        ? records.filter((item) => {
            const record = item as Record<string, unknown>
            const verdict = (record.classification ?? record.verdict ?? record.status ?? "") as string
            return typeof verdict === "string" && verdict.toLowerCase().includes("phish")
          }).length
        : null
      return {
        id: run.id,
        timestamp: run.timestamp,
        total,
        positives,
        message: run.payload?.message ?? null,
      }
    })
  }, [emailRuns])

  const summarizedIdsRuns = useMemo(() => {
    return idsRuns.map((run) => {
      const predictions = Array.isArray(run.payload?.predictions) ? run.payload.predictions : []
      const totalPredictions = predictions.length
      const attackCount = predictions.filter((p: any) => p === 1 || p === "attack").length
      
      return {
        id: run.id,
        timestamp: run.timestamp,
        type: run.type,
        filename: run.filename,
        totalPredictions,
        attackCount,
        cleanCount: totalPredictions - attackCount,
        message: run.payload?.message ?? null,
      }
    })
  }, [idsRuns])

  const sourceLabel = isEmail ? "Email Protection" : isIds ? "Intrusion Detection" : mod.title

  const handleLiveAnalyze = async () => {
    if (isEmail) {
      setRunning(true)
      await handleEmailAnalyze()
    } else if (isIds) {
      await handleIdsLiveAnalyze()
    } else {
      setRunning(true)
    }
  }

  const handleStopAnalyze = () => {
    if (isEmail) {
      setEmailLoading(false)
    }
    if (isIds) {
      setIdsAnimationRunning(false)
    }
    setRunning(false)
  }

  const handleIdsLiveAnalyze = async () => {
    if (!isIds) return
    if (!endpoint || endpoint === "#") {
      setIdsError("IDS endpoint not configured.")
      return
    }
    
    setIdsAnimationRunning(true)
    setRunning(true)
    setIdsError(null)
    
    // Simulate live analysis for demo - in real scenario this would be a different endpoint
    setTimeout(async () => {
      try {
        // For now, we'll create a mock result for live analysis
        const mockResult = {
          status: "success",
          message: "Live network analysis completed",
          type: "live",
          packets_analyzed: Math.floor(Math.random() * 1000) + 100,
          threats_detected: Math.floor(Math.random() * 10),
          clean_packets: Math.floor(Math.random() * 900) + 90,
        }
        
        setIdsResult(mockResult)
        setIdsRuns((prev) => [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: new Date(),
            type: "live",
            payload: mockResult,
          },
          ...prev,
        ])
      } catch (err) {
        const message = err instanceof Error ? err.message : "Live analysis failed"
        setIdsError(message)
      }
    }, 5000) // 5 seconds for demo
  }

  const handleIdsFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    if (!file.name.endsWith('.csv')) {
      setIdsError("Only CSV files are allowed")
      return
    }

    if (!endpoint || endpoint === "#") {
      setIdsError("IDS endpoint not configured.")
      return
    }

    setIdsLoading(true)
    setIdsError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const payload = await response.json()
      setIdsResult(payload)
      setIdsRuns((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date(),
          type: "upload",
          filename: file.name,
          payload,
        },
        ...prev,
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload analysis failed"
      setIdsError(message)
    } finally {
      setIdsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-lg border p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,_color-mix(in_oklch,var(--color-primary)_8%,transparent)_0%,_transparent_70%)]" />
        <div className="relative">
          <h2 className="text-2xl font-semibold">{mod.title}</h2>
          <p className="text-sm text-muted-foreground">{mod.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">Endpoint: {endpoint}</p>
        </div>
      </section>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Module Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs text-muted-foreground">Sensitivity</span>
                  <input
                    className="rounded-md border bg-background px-3 py-2"
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={65}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-muted-foreground">Auto-refresh (s)</span>
                  <input
                    className="rounded-md border bg-background px-3 py-2"
                    type="number"
                    defaultValue={30}
                    min={5}
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  className="btn-cyber hover-glow"
                  onClick={() => {
                    void handleLiveAnalyze()
                  }}
                  disabled={(isEmail && emailLoading) || (isIds && idsAnimationRunning)}
                >
                  {isEmail && emailLoading ? "Analyzing…" : isIds && idsAnimationRunning ? "Analyzing…" : "Live Analyze"}
                </Button>
                {isIds && (
                  <>
                    <Button
                      variant="outline"
                      className="btn-cyber bg-transparent"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={idsLoading}
                    >
                      {idsLoading ? "Uploading…" : "Upload CSV"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleIdsFileUpload}
                      className="hidden"
                    />
                  </>
                )}
                <Button
                  variant="outline"
                  className="btn-cyber bg-transparent"
                  onClick={handleStopAnalyze}
                  disabled={(isEmail && emailLoading) || (isIds && idsLoading)}
                >
                  Stop
                </Button>
              </div>
              {isEmail ? (
                running && (
                  <div className="rounded-md border p-3 text-xs">
                    {emailLoading ? (
                      <div className="text-muted-foreground">Request in progress…</div>
                    ) : emailError ? (
                      <div className="text-destructive">{emailError}</div>
                    ) : emailResult ? (
                      <div className="space-y-3">
                        <div className="font-medium text-foreground">{emailResult.message ?? "Email analysis completed."}</div>
                        {emailList && emailList.length > 0 ? (
                          <div className="grid gap-3">
                            {emailList.slice(0, 5).map((item, index) => {
                              const record = item as Record<string, unknown>
                              const key = String(record.id ?? record.messageId ?? index)
                              const subject = record.subject ?? record.title ?? `Email #${index + 1}`
                              const verdict = record.classification ?? record.verdict ?? record.status ?? null
                              const sender = record.sender ?? record.from ?? record.email ?? null
                              return (
                                <div key={key} className="rounded-sm border p-3">
                                  <div className="font-medium text-foreground">{String(subject)}</div>
                                  <div className="mt-1 text-muted-foreground">
                                    {sender && <span>From: {String(sender)}</span>}
                                    {sender && verdict && <span> • </span>}
                                    {verdict && <span>Verdict: {String(verdict)}</span>}
                                  </div>
                                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words">
                                    {JSON.stringify(record, null, 2)}
                                  </pre>
                                </div>
                              )
                            })}
                            {emailList.length > 5 && (
                              <div className="text-muted-foreground">
                                Showing 5 of {emailList.length} emails. Check the Results tab for full output.
                              </div>
                            )}
                          </div>
                        ) : (
                          <pre className="rounded-sm border bg-muted/40 p-3 whitespace-pre-wrap break-words">
                            {JSON.stringify(emailResult, null, 2)}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">Run an analysis to view results.</div>
                    )}
                  </div>
                )
              ) : isIds ? (
                (running || idsLoading || idsError || idsResult) && (
                  <div className="rounded-md border p-3 text-xs space-y-3">
                    {idsAnimationRunning && (
                      <div>
                        <div className="text-muted-foreground mb-2">Live Network Analysis</div>
                        <PacketAnimation isRunning={idsAnimationRunning} />
                      </div>
                    )}
                    {idsLoading && <div className="text-muted-foreground">Processing CSV file…</div>}
                    {idsError && <div className="text-destructive">{idsError}</div>}
                    {idsResult && (
                      <div className="space-y-2">
                        <div className="font-medium text-foreground">
                          {idsResult.message ?? "Analysis completed"}
                        </div>
                        {idsResult.type === "live" ? (
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="rounded-sm border p-2">
                              Packets: <span className="text-primary">{idsResult.packets_analyzed ?? "N/A"}</span>
                            </div>
                            <div className="rounded-sm border p-2">
                              Threats: <span className="text-red-400">{idsResult.threats_detected ?? "N/A"}</span>
                            </div>
                            <div className="rounded-sm border p-2">
                              Clean: <span className="text-green-400">{idsResult.clean_packets ?? "N/A"}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div className="rounded-sm border p-2">
                              Total: <span className="text-primary">{Array.isArray(idsResult.predictions) ? idsResult.predictions.length : "N/A"}</span>
                            </div>
                            <div className="rounded-sm border p-2">
                              Status: <span className="text-primary">{idsResult.status ?? "N/A"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              ) : (
                running && (
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground mb-2">Live output</div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-sm border p-2 text-xs">
                        Status: <span className="text-primary">Analyzing stream…</span>
                      </div>
                      <div className="rounded-sm border p-2 text-xs">
                        Threat score: <span className="text-primary">42</span>
                      </div>
                    </div>
                  </div>
                )
              )}
              {isEmail && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-md border p-3 text-xs">
                    SPF/DKIM/DMARC: <span className="text-primary">OK</span>
                  </div>
                  <div className="rounded-md border p-3 text-xs">
                    Malware Payload: <span className="text-primary">None</span>
                  </div>
                  <div className="rounded-md border p-3 text-xs">
                    Phishing Signals: <span className="text-primary">Low</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Detections Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="a" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="b" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Risk Score Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="a"
                      stroke="var(--color-chart-3)"
                      fill="var(--color-chart-3)"
                      fillOpacity={0.25}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </section>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ActivityLog sources={[sourceLabel]} />
            {isIds ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Network Packet Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <PacketFlow />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Live Intelligence Feed (placeholder)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40 rounded-md border bg-muted/40">
                    <div className="h-full w-full animate-[pulse_3s_ease-in-out_infinite] rounded-md" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Replace with FastAPI stream.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {isEmail ? (
                latestRun ? (
                  <div className="space-y-3 text-xs">
                    <div className="rounded-md border p-3">
                      <div className="font-medium text-foreground">
                        Last run: {latestRun.timestamp.toLocaleString()}
                      </div>
                      {latestPayload?.message && (
                        <div className="mt-1 text-muted-foreground">{latestPayload.message}</div>
                      )}
                      <div className="mt-2 text-muted-foreground">
                        {latestEmailList ? `${latestEmailList.length} emails processed.` : "No email list returned."}
                      </div>
                    </div>
                    {latestEmailList ? (
                      <div className="grid gap-3">
                        {latestEmailList.map((item, index) => {
                          const record = item as Record<string, unknown>
                          const key = String(record.id ?? record.messageId ?? index)
                          const subject = record.subject ?? record.title ?? `Email #${index + 1}`
                          const sender = record.sender ?? record.from ?? record.email ?? null
                          const verdict = record.classification ?? record.verdict ?? record.status ?? null
                          return (
                            <div key={key} className="rounded-md border p-3">
                              <div className="text-xs font-medium text-foreground">{String(subject)}</div>
                              <div className="mt-1 text-[11px] text-muted-foreground">
                                {sender && <span>From: {String(sender)}</span>}
                                {sender && verdict && <span> • </span>}
                                {verdict && <span>Verdict: {String(verdict)}</span>}
                              </div>
                              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words text-[11px]">
                                {JSON.stringify(record, null, 2)}
                              </pre>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="rounded-md border bg-muted/40 p-3 text-[11px]">
                        <pre className="whitespace-pre-wrap break-words">{JSON.stringify(latestPayload, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Trigger a run from the Configuration tab to populate recent results.
                  </p>
                )
              ) : isIds ? (
                latestIdsRun ? (
                  <div className="space-y-3 text-xs">
                    <div className="rounded-md border p-3">
                      <div className="font-medium text-foreground">
                        Last run: {latestIdsRun.timestamp.toLocaleString()}
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        Type: {latestIdsRun.type === "live" ? "Live Analysis" : "CSV Upload"}
                        {latestIdsRun.filename && ` • File: ${latestIdsRun.filename}`}
                      </div>
                      {latestIdsPayload?.message && (
                        <div className="mt-1 text-muted-foreground">{latestIdsPayload.message}</div>
                      )}
                    </div>
                    {latestIdsRun.type === "live" ? (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-md border p-3">
                          <div className="font-medium text-foreground">Packets Analyzed</div>
                          <div className="text-lg text-primary">{latestIdsPayload?.packets_analyzed ?? "N/A"}</div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="font-medium text-foreground">Threats Detected</div>
                          <div className="text-lg text-red-400">{latestIdsPayload?.threats_detected ?? "N/A"}</div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="font-medium text-foreground">Clean Packets</div>
                          <div className="text-lg text-green-400">{latestIdsPayload?.clean_packets ?? "N/A"}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="rounded-md border p-3">
                            <div className="font-medium text-foreground">Total Predictions</div>
                            <div className="text-lg text-primary">
                              {Array.isArray(latestIdsPayload?.predictions) ? latestIdsPayload.predictions.length : "N/A"}
                            </div>
                          </div>
                          <div className="rounded-md border p-3">
                            <div className="font-medium text-foreground">Status</div>
                            <div className="text-lg text-primary">{latestIdsPayload?.status ?? "N/A"}</div>
                          </div>
                        </div>
                        {Array.isArray(latestIdsPayload?.predictions) && (
                          <div className="rounded-md border bg-muted/40 p-3 text-[11px]">
                            <div className="font-medium mb-2">Predictions (first 10):</div>
                            <pre className="whitespace-pre-wrap break-words">
                              {JSON.stringify(latestIdsPayload.predictions.slice(0, 10), null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Trigger a live analysis or upload a CSV file to populate recent results.
                  </p>
                )
              ) : (
                <p className="text-muted-foreground">{running ? "Analyzing… (simulated)" : "No live analysis running."}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {isEmail ? (
                summarizedRuns.length > 0 ? (
                  summarizedRuns.map((run) => (
                    <div key={run.id} className="rounded-md border p-3">
                      <div className="font-medium text-foreground">
                        {run.timestamp.toLocaleString()}
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        {run.message ?? "Analysis completed."}
                      </div>
                      <div className="mt-2 text-muted-foreground">
                        {typeof run.total === "number" ? `${run.total} emails processed` : "Total emails unknown"}
                        {typeof run.positives === "number" && ` • ${run.positives} flagged as suspicious`}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No history yet. Run the analyzer to build a timeline.</p>
                )
              ) : isIds ? (
                summarizedIdsRuns.length > 0 ? (
                  summarizedIdsRuns.map((run) => (
                    <div key={run.id} className="rounded-md border p-3">
                      <div className="font-medium text-foreground">
                        {run.timestamp.toLocaleString()}
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        Type: {run.type === "live" ? "Live Analysis" : "CSV Upload"}
                        {run.filename && ` • File: ${run.filename}`}
                      </div>
                      <div className="mt-2 text-muted-foreground">
                        {run.type === "live" ? (
                          `Analysis completed • ${run.message ?? "Network monitoring session"}`
                        ) : (
                          `${run.totalPredictions} predictions • ${run.attackCount} attacks detected • ${run.cleanCount} clean`
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No history yet. Run live analysis or upload CSV files to build a timeline.</p>
                )
              ) : (
                <p className="text-muted-foreground">
                  Placeholder historical logs. Wire to your FastAPI via config.json endpoints.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
