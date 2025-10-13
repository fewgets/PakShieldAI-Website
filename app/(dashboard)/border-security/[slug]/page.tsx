"use client"

import { notFound, useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { ResponsiveContainer, CartesianGrid, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { MapGrid } from "@/components/widgets/map-grid"
import { ActivityLog } from "@/components/widgets/activity-log"
import { useAppConfig, resolveEndpoint } from "@/lib/config"
import { getModule } from "@/lib/modules"
import type { DomainKey } from "@/lib/modules"

const domain: DomainKey = "border-security"

type ResultCount = {
  label: string
  value: number | null
  highlight?: boolean
}

type ResultSummary = {
  description: string
  counts: ResultCount[]
  status?: "detected" | "clear"
}

type HistoryEntry = {
  id: string
  module: string
  timestamp: string
  summary: ResultSummary
  countsMap: Record<string, number | null>
}

type MetricCard = {
  label: string
  value: string
  accent?: "success" | "danger"
}

type MetricsOverview = {
  cards: MetricCard[]
  note?: string
}

type DroneMetrics = {
  detectionsCount: number | null
  eventsCount: number | null
  labels: string[]
}

type SuspiciousMetrics = {
  detectionsCount: number | null
  alertsCount: number | null
  framesProcessed: number | null
  suspiciousPercentage: number | null
  labels: string[]
}

function mockBorder(n = 30) {
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    risk: Math.max(0, Math.round(15 + Math.sin(i / 4) * 8 + Math.random() * 5 - 2)),
  }))
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : null
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

function extractDroneMetrics(payload: Record<string, unknown> | null): DroneMetrics | null {
  if (!payload) return null
  const summary = toRecord(payload.summary) ?? payload
  if (!summary) return null

  const detectionsCount =
    toNumber(summary["detections_count"]) ??
    toNumber(summary["detections_total"]) ??
    toNumber(summary["drones_detected"]) ??
    toNumber(payload["detections_count"]) ??
    toNumber(payload["detections_total"])
  const eventsCount =
    toNumber(summary["alert_events"]) ??
    toNumber(summary["restricted_event_count"]) ??
    toNumber(payload["alert_events"]) ??
    toNumber(payload["restricted_event_count"])

  const labels = new Set<string>()
  const detections = Array.isArray(summary["detections"])
    ? (summary["detections"] as unknown[])
    : Array.isArray(payload["detections"])
      ? (payload["detections"] as unknown[])
      : []
  detections.forEach((item) => {
    const rec = toRecord(item)
    if (rec && typeof rec.label === "string") labels.add(rec.label)
  })
  const labelList = Array.isArray(payload["labels"]) ? (payload["labels"] as unknown[]) : []
  labelList.forEach((value) => {
    if (typeof value === "string") labels.add(value)
  })

  return {
    detectionsCount,
    eventsCount,
    labels: Array.from(labels).slice(0, 12),
  }
}

function extractSuspiciousMetrics(payload: Record<string, unknown> | null): SuspiciousMetrics | null {
  if (!payload) return null
  const summary = toRecord(payload.summary) ?? payload
  if (!summary) return null

  const detectionsCount =
    toNumber(summary["detections_total"]) ??
    toNumber(summary["detections_count"]) ??
    toNumber(payload["detections_total"]) ??
    toNumber(payload["detections_count"])
  const alertsCount =
    toNumber(summary["alert_events"]) ??
    toNumber(summary["restricted_event_total"]) ??
    toNumber(payload["alert_events"]) ??
    toNumber(payload["restricted_event_total"])
  const framesProcessed =
    toNumber(summary["frames_processed"]) ??
    toNumber(payload["frames_processed"])

  const labels = new Set<string>()
  const detections = Array.isArray(summary["detections"])
    ? (summary["detections"] as unknown[])
    : Array.isArray(payload["detections"])
      ? (payload["detections"] as unknown[])
      : []
  detections.forEach((item) => {
    const rec = toRecord(item)
    if (rec && typeof rec.label === "string") labels.add(rec.label)
  })
  const labelList = Array.isArray(payload["labels"]) ? (payload["labels"] as unknown[]) : []
  labelList.forEach((value) => {
    if (typeof value === "string") labels.add(value)
  })

  const suspiciousPercentage =
    toNumber(summary["suspicious_percentage"]) ??
    toNumber(payload["suspicious_percentage"])

  return {
    detectionsCount,
    alertsCount,
    framesProcessed,
    suspiciousPercentage,
    labels: Array.from(labels).slice(0, 12),
  }
}

function buildSummaryFromPayload(
  slug: string,
  payload: Record<string, unknown> | null,
  options: {
    droneMetrics?: DroneMetrics | null
    suspiciousMetrics?: SuspiciousMetrics | null
  } = {},
): ResultSummary | null {
  if (!payload) return null
  const summary = toRecord(payload.summary)

  if (slug === "drone-detection") {
    const metrics = options.droneMetrics ?? extractDroneMetrics(payload)
    if (!metrics) return null
    return {
      description: (metrics.eventsCount ?? 0) > 0 ? "Drone threat detected" : "No drone threats detected",
      counts: [
        { label: "Detections", value: metrics.detectionsCount },
        { label: "Alert Events", value: metrics.eventsCount, highlight: true },
      ],
      status: (metrics.eventsCount ?? 0) > 0 ? "detected" : "clear",
    }
  }

  if (slug === "suspicious-activity") {
    const metrics = options.suspiciousMetrics ?? extractSuspiciousMetrics(payload)
    if (!metrics) return null
    return {
      description: (metrics.alertsCount ?? 0) > 0 ? "Suspicious behaviour detected" : "Area clear",
      counts: [
        { label: "Detections", value: metrics.detectionsCount },
        { label: "Alerts", value: metrics.alertsCount, highlight: true },
        { label: "Suspicious %", value: metrics.suspiciousPercentage },
      ],
      status: (metrics.alertsCount ?? 0) > 0 ? "detected" : "clear",
    }
  }

  if (summary) {
    const counts = Object.entries(summary)
      .filter(([key, value]) => key.endsWith("count") && typeof value === "number")
      .slice(0, 3)
      .map(([key, value]) => {
        const labelText = key.replace(/_/g, " ").replace(/\b\w/g, (chunk: string) => chunk.toUpperCase())
        return { label: labelText, value: value as number }
      })

    if (counts.length) {
      return {
        description: summary.description && typeof summary.description === "string" ? summary.description : "Upload processed",
        counts,
      }
    }
  }

  return null
}

export default function BorderModulePage() {
  const params = useParams<{ slug?: string | string[] }>()
  const slug = useMemo(() => {
    const value = params?.slug
    if (Array.isArray(value)) return value[0]
    return value ?? null
  }, [params])

  if (!slug) notFound()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadResponse, setUploadResponse] = useState<Record<string, unknown> | null>(null)
  const [currentSummary, setCurrentSummary] = useState<ResultSummary | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const { config } = useAppConfig()
  const mod = getModule(domain, slug)
  useEffect(() => {
    if (!mod) notFound()
  }, [mod])
  if (!mod) return null

  const endpoint = resolveEndpoint(config, mod.endpointKey)
  const sourceLabel =
    slug === "drone-detection"
      ? "Drone Detection"
      : slug === "suspicious-activity"
        ? "Suspicious Activity"
        : undefined

  const data = mockBorder()
  const uploadAbortRef = useRef<AbortController | null>(null)
  const apiBase = useMemo(() => (config?.apiBase ? config.apiBase.replace(/\/$/, "") : ""), [config])
  const moduleHistory = useMemo(
    () => history.filter((entry) => entry.module === slug),
    [history, slug],
  )

  const processedMedia = useMemo(() => {
    if (!uploadResponse || typeof uploadResponse !== "object") {
      console.log("[BorderModule] processedMedia: uploadResponse is null or not object")
      return null
    }
    const rawOutput = (uploadResponse as Record<string, unknown>).output_url
    console.log("[BorderModule] processedMedia: rawOutput =", rawOutput)
    if (typeof rawOutput !== "string" || rawOutput.length === 0) {
      console.log("[BorderModule] processedMedia: rawOutput is not valid string")
      return null
    }
    const absoluteUrl = rawOutput.startsWith("http") ? rawOutput : `${apiBase}${rawOutput}`
    const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(rawOutput)
    console.log("[BorderModule] processedMedia: final URL =", absoluteUrl, "type =", isVideo ? "video" : "image")
    return { url: absoluteUrl, type: isVideo ? "video" : "image" }
  }, [apiBase, uploadResponse])

  const comparisonMedia = useMemo(() => {
    if (!uploadResponse || typeof uploadResponse !== "object") return null
    const rawValue = (uploadResponse as Record<string, unknown>).comparison_url
    if (typeof rawValue !== "string" || rawValue.length === 0) return null
    return rawValue.startsWith("http") ? rawValue : `${apiBase}${rawValue}`
  }, [apiBase, uploadResponse])

  const logUrl = useMemo(() => {
    if (!uploadResponse || typeof uploadResponse !== "object") return null
    const rawValue = (uploadResponse as Record<string, unknown>).log_url
    if (typeof rawValue !== "string" || rawValue.length === 0) return null
    return rawValue.startsWith("http") ? rawValue : `${apiBase}${rawValue}`
  }, [apiBase, uploadResponse])

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        for (const track of (videoRef.current.srcObject as MediaStream).getTracks()) track.stop()
      }
      uploadAbortRef.current?.abort()
      if (uploadUrl) URL.revokeObjectURL(uploadUrl)
    }
  }, [uploadUrl])

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setStreaming(true)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      for (const track of (videoRef.current.srcObject as MediaStream).getTracks()) track.stop()
    }
    setStreaming(false)
  }

  useEffect(() => {
    if (!streaming) return
    const drawOverlay = () => {
      const ctx = canvasRef.current?.getContext("2d")
      const video = videoRef.current
      if (!ctx || !video) return
      canvasRef.current!.width = video.videoWidth
      canvasRef.current!.height = video.videoHeight
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
      ctx.strokeStyle = "var(--color-chart-5)"
      ctx.lineWidth = 3
      ctx.strokeRect(40, 40, (canvasRef.current!.width / 3) | 0, (canvasRef.current!.height / 3) | 0)
      requestAnimationFrame(drawOverlay)
    }
    requestAnimationFrame(drawOverlay)
  }, [streaming])

  const isDroneModule = slug === "drone-detection"
  const isSuspiciousModule = slug === "suspicious-activity"

  const droneMetrics = useMemo(() => (isDroneModule ? extractDroneMetrics(uploadResponse) : null), [isDroneModule, uploadResponse])
  const suspiciousMetrics = useMemo(
    () => (slug === "suspicious-activity" ? extractSuspiciousMetrics(uploadResponse) : null),
    [slug, uploadResponse],
  )

  const summaryToDisplay = currentSummary ?? buildSummaryFromPayload(slug, uploadResponse, { droneMetrics, suspiciousMetrics })

  console.log("[BorderModule] uploadResponse", uploadResponse)
  console.log("[BorderModule] processedMedia", processedMedia)

  const summaryCard = !isUploading && !uploadError && summaryToDisplay ? (
    <div className="rounded-md border bg-muted/30 px-3 py-3 text-sm">
      <p className="font-medium">{summaryToDisplay.description}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {summaryToDisplay.counts.map((item) => (
          <div
            key={item.label}
            className={`rounded border px-3 py-2 text-xs ${
              item.highlight ? "border-primary text-primary" : "border-muted-foreground/20"
            }`}
          >
            <p className="uppercase text-muted-foreground">{item.label}</p>
            <p className="text-base font-semibold">{typeof item.value === "number" ? item.value : "-"}</p>
          </div>
        ))}
      </div>
    </div>
  ) : null

  const moduleMetrics = useMemo<MetricsOverview | null>(() => {
    if (!moduleHistory.length) return null

    const getNumberValues = (key: string) =>
      moduleHistory
        .map((entry) => entry.countsMap?.[key])
        .filter((value): value is number => typeof value === "number")

    const sumValues = (values: number[]) => values.reduce((acc, value) => acc + value, 0)
    const avgValues = (values: number[]) => (values.length ? sumValues(values) / values.length : null)
    const lastTimestamp = moduleHistory[0]?.timestamp ?? "—"

    if (isDroneModule) {
      const alerts = moduleHistory.filter((entry) => entry.summary.status === "detected").length
      const detections = getNumberValues("Detections")
      const events = getNumberValues("Alert Events")
      return {
        cards: [
          { label: "Total Sessions", value: String(moduleHistory.length) },
          { label: "Threat Alerts", value: String(alerts), accent: alerts ? "danger" : undefined },
          { label: "Detections Logged", value: String(sumValues(detections)) },
          { label: "Alert Events", value: String(sumValues(events)) },
          { label: "Avg Alerts", value: avgValues(events)?.toFixed(1) ?? "-" },
          { label: "Last Run", value: lastTimestamp },
        ],
        note: "Drone metrics are derived from uploads in this session.",
      }
    }

    return {
      cards: [
        { label: "Total Sessions", value: String(moduleHistory.length) },
        { label: "Last Run", value: lastTimestamp },
      ],
    }
  }, [isDroneModule, moduleHistory])

  const handleUpload = async (file: File) => {
    if (!config || !endpoint || endpoint === "#") {
      setUploadError("API configuration not ready. Please try again in a moment.")
      return
    }

    uploadAbortRef.current?.abort()
    const controller = new AbortController()
    uploadAbortRef.current = controller

    setUploadError(null)
    setUploadResponse(null)
  setCurrentSummary(null)
  setIsUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Upload failed"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.detail || errorMessage
        } catch {
          // Ignore JSON parsing errors
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const resolvedData = toRecord(data) ?? { data: data as unknown }
      
      console.log("[BorderModule] API Response:", resolvedData)
      console.log("[BorderModule] output_url:", (resolvedData as Record<string, unknown>)?.output_url)
      console.log("[BorderModule] video_url:", (resolvedData as Record<string, unknown>)?.video_url)
      
      const nextDroneMetrics = isDroneModule ? extractDroneMetrics(resolvedData) : null
      const nextSuspiciousMetrics = slug === "suspicious-activity" ? extractSuspiciousMetrics(resolvedData) : null
      const generatedSummary = buildSummaryFromPayload(slug, resolvedData, {
        droneMetrics: nextDroneMetrics,
        suspiciousMetrics: nextSuspiciousMetrics,
      })

      setUploadResponse(resolvedData)
      setCurrentSummary(generatedSummary)

      if (generatedSummary) {
        const entry: HistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          module: slug,
          timestamp: new Date().toLocaleString(),
          summary: generatedSummary,
          countsMap: Object.fromEntries(
            generatedSummary.counts.map((item) => [item.label, typeof item.value === "number" ? item.value : null]),
          ),
        }
        setHistory((prev) => [entry, ...prev].slice(0, 20))
      }

      if (resolvedData && typeof resolvedData === "object") {
        // handled via memoized selectors
      }
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") return
      const message = error instanceof Error ? error.message : "Unexpected error during upload"
      setUploadError(message)
    } finally {
      setIsUploading(false)
    }
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setUploadUrl((prev) => {
      if (prev && prev !== url) URL.revokeObjectURL(prev)
      return url
    })
    setUploadType(f.type.startsWith("video/") ? "video" : "image")
    handleUpload(f).catch((err) => {
      console.error("Upload failed", err)
    })
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-lg border p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,_color-mix(in_oklch,var(--color-primary)_8%,transparent)_0%,_transparent_70%)]" />
        <div className="relative">
          <h2 className="text-2xl font-semibold">{mod.title}</h2>
          <p className="text-sm text-muted-foreground">{mod.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">Endpoint: {endpoint}</p>
        </div>
      </section>

      <Tabs defaultValue="analytics">
        <TabsList className="mb-2">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="live">Live Test</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Border Risk Index</CardTitle>
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
                      dataKey="risk"
                      stroke="var(--color-chart-5)"
                      fill="var(--color-chart-5)"
                      fillOpacity={0.25}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <MapGrid />
          </section>
        </TabsContent>

        <TabsContent value="live">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Live Testing</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Button className="btn-cyber hover-glow" onClick={startCamera} disabled={streaming}>
                Start Live
              </Button>
              <Button variant="outline" className="btn-cyber bg-transparent" onClick={stopCamera} disabled={!streaming}>
                Stop
              </Button>
              <p className="text-xs text-muted-foreground">Simulated; wire to FastAPI stream.</p>
            </CardContent>
            {streaming ? (
              <CardContent>
                <div className="relative">
                  <video ref={videoRef} autoPlay muted playsInline className="w-full rounded" />
                  <canvas ref={canvasRef} className="absolute inset-0" />
                </div>
              </CardContent>
            ) : null}
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload Image/Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                type="file"
                accept="image/*,video/*"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                onChange={onFileChange}
              />
              {comparisonMedia ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Original &amp; Bounding Boxes</p>
                  <img src={comparisonMedia} alt="Original and detection preview" className="w-full max-w-2xl rounded-md border object-contain" />
                </div>
              ) : processedMedia ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Detection Result</p>
                  {processedMedia.type === "image" ? (
                    <img
                      src={processedMedia.url}
                      alt="Annotated detection"
                      className="w-full max-w-2xl rounded-md border object-contain"
                    />
                  ) : (
                    <video src={processedMedia.url} controls className="w-full max-w-2xl rounded-md border object-contain" />
                  )}
                </div>
              ) : isUploading && uploadType === "video" ? (
                <div className="mt-4 space-y-4">
                  <div className="flex min-h-[400px] w-full items-center justify-center rounded-md border border-primary/30 bg-primary/5">
                    <div className="flex flex-col items-center space-y-4 p-8 text-center">
                      <Spinner className="size-12 text-primary" />
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-primary">Processing Video</p>
                        <p className="text-sm text-muted-foreground">
                          Analyzing all frames for suspicious activity...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          This may take several minutes depending on video length
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : uploadUrl ? (
                <div className="mt-3">
                  {uploadType === "video" ? (
                    <div className="space-y-2">
                      <video src={uploadUrl} controls className="w-full rounded-md border object-contain" />
                      <p className="text-xs text-muted-foreground">Preview shown locally. Click upload to process.</p>
                    </div>
                  ) : (
                    <img
                      src={uploadUrl || "/placeholder.svg"}
                      alt="Uploaded preview"
                      className="w-full rounded-md border object-cover"
                    />
                  )}
                </div>
              ) : null}
              {isDroneModule && !isUploading && droneMetrics ? (
                <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-3 text-sm">
                  <p className="font-medium">Total Detections: {typeof droneMetrics.detectionsCount === "number" ? droneMetrics.detectionsCount : 0}</p>
                  {droneMetrics.labels.length ? (
                    <p className="mt-1 text-xs text-muted-foreground">Detected objects: {droneMetrics.labels.join(", ")}</p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">No objects detected in this upload.</p>
                  )}
                </div>
              ) : null}
              {isSuspiciousModule && !isUploading && suspiciousMetrics ? (
                <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-3 text-sm">
                  <p className="font-medium">
                    Suspicious Percentage: {typeof suspiciousMetrics.suspiciousPercentage === "number"
                      ? `${suspiciousMetrics.suspiciousPercentage.toFixed(2)}%`
                      : "0%"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Frames flagged: {typeof suspiciousMetrics.alertsCount === "number" ? suspiciousMetrics.alertsCount : 0} /{' '}
                    {typeof suspiciousMetrics.framesProcessed === "number" ? suspiciousMetrics.framesProcessed : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Detections total: {typeof suspiciousMetrics.detectionsCount === "number" ? suspiciousMetrics.detectionsCount : 0}
                  </p>
                  {suspiciousMetrics.labels.length ? (
                    <p className="mt-1 text-xs text-muted-foreground">Detected classes: {suspiciousMetrics.labels.join(", ")}</p>
                  ) : null}
                </div>
              ) : null}
              {isUploading && (
                <Alert className="border-primary/40 bg-primary/5">
                  <Spinner className="size-4 text-primary" />
                  <AlertTitle>
                    {isSuspiciousModule && uploadType === "video" 
                      ? "Processing Video Frames…" 
                      : "Analyzing upload…"}
                  </AlertTitle>
                  <AlertDescription>
                    <p>
                      {isSuspiciousModule && uploadType === "video"
                        ? "Running frame-by-frame analysis for suspicious activity detection. This may take several minutes."
                        : "Dispatching to the border-security API. This may take a moment."}
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              {uploadError && (
                <Alert variant="destructive">
                  <AlertTitle>Upload failed</AlertTitle>
                  <AlertDescription>
                    <p>{uploadError}</p>
                  </AlertDescription>
                </Alert>
              )}
              {!isUploading && !uploadError && summaryCard}
              {logUrl && (
                <div className="space-y-2">
                  <a
                    href={logUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md border border-primary/50 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                  >
                    View Detection Summary
                  </a>
                </div>
              )}
              {droneMetrics?.labels.length ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Detected Objects</p>
                  <div className="flex flex-wrap gap-2">
                    {droneMetrics.labels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {isSuspiciousModule && suspiciousMetrics?.labels.length ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Detected Classes</p>
                  <div className="flex flex-wrap gap-2">
                    {suspiciousMetrics.labels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Summary Metrics</CardTitle>
                <p className="text-xs text-muted-foreground">Aggregated insights based on your recent uploads.</p>
              </CardHeader>
              <CardContent>
                {moduleMetrics ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {moduleMetrics.cards.map((card) => (
                        <div
                          key={card.label}
                          className={`rounded-md border px-3 py-3 text-sm ${
                            card.accent === "success"
                              ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-600"
                              : card.accent === "danger"
                                ? "border-red-400/60 bg-red-500/10 text-red-600"
                                : "bg-muted/40"
                          }`}
                        >
                          <p className="text-xs uppercase text-muted-foreground/80">{card.label}</p>
                          <p className="mt-1 text-lg font-semibold">{card.value}</p>
                        </div>
                      ))}
                    </div>
                    {moduleMetrics.note && <p className="text-xs text-muted-foreground">{moduleMetrics.note}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Run an upload to populate module metrics.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Activity Stream</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityLog sources={sourceLabel ? [sourceLabel] : []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">History</CardTitle>
              <p className="text-xs text-muted-foreground">Recent uploads for this module (local session)</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {moduleHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No uploads recorded yet.</p>
              ) : (
                moduleHistory.map((entry) => (
                  <div key={entry.id} className="rounded-md border px-3 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{entry.summary.description}</p>
                      <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {entry.summary.counts.map((item) => (
                        <div
                          key={item.label}
                          className={`rounded border px-3 py-2 text-xs ${
                            item.highlight ? "border-primary text-primary" : "border-muted-foreground/20"
                          }`}
                        >
                          <p className="uppercase text-muted-foreground">{item.label}</p>
                          <p className="text-base font-semibold">{typeof item.value === "number" ? item.value : "-"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
