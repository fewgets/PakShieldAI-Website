"use client"

import { notFound } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { ActivityLog } from "@/components/widgets/activity-log"
import { useAppConfig, resolveEndpoint } from "@/lib/config"
import { getModule } from "@/lib/modules"
import type { DomainKey } from "@/lib/modules"

const domain: DomainKey = "video-analytics"

type ResultCount = {
  label: string
  value: number | null
  highlight?: boolean
}

type ResultSummary = {
  description: string
  counts: ResultCount[]
  status?: "granted" | "denied" | "restricted" | "clear" | "weapons-detected" | "no-weapons"
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

function mockMotion(n = 36) {
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    motion: Math.max(0, Math.round(40 + Math.sin(i / 3) * 15 + Math.random() * 10 - 5)),
  }))
}

export default function VideoModulePage({ params }: { params: { slug: string } }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadResponse, setUploadResponse] = useState<Record<string, unknown> | null>(null)
  const [processedMedia, setProcessedMedia] = useState<{ url: string; type: "image" | "video" } | null>(null)
  const [currentSummary, setCurrentSummary] = useState<ResultSummary | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const { config } = useAppConfig()
  const mod = getModule(domain, params.slug)
  const endpoint = resolveEndpoint(config, mod.endpointKey)
  const data = mockMotion()
  const uploadAbortRef = useRef<AbortController | null>(null)
  const isFaceModule = params.slug === "face-recognition"
  const isAnomalyModule = params.slug === "anomaly-detection"
  const isWeaponModule = params.slug === "weapon-detection"
  const apiBase = useMemo(() => (config?.apiBase ? config.apiBase.replace(/\/$/, "") : ""), [config])
  const sourceLabel =
    params.slug === "weapon-detection"
      ? "Weapon Detection"
      : params.slug === "crowd-analysis"
        ? "Crowd Analysis"
        : params.slug === "anomaly-detection"
          ? "Video Anomaly"
          : undefined

  useEffect(() => {
    return () => {
      // stop camera when leaving
      if (videoRef.current?.srcObject) {
        for (const track of (videoRef.current.srcObject as MediaStream).getTracks()) track.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (!mod) return notFound()
  }, [mod])

  useEffect(() => {
    return () => {
      uploadAbortRef.current?.abort()
    }
  }, [])

  const startCamera = async () => {
    const ms = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    if (videoRef.current) {
      videoRef.current.srcObject = ms
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

  const drawOverlay = () => {
    const ctx = canvasRef.current?.getContext("2d")
    const v = videoRef.current
    if (!ctx || !v) return
    canvasRef.current!.width = v.videoWidth
    canvasRef.current!.height = v.videoHeight
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
    // simulated detection box
    ctx.strokeStyle = "var(--color-chart-4)"
    ctx.lineWidth = 3
    ctx.strokeRect(40, 40, (canvasRef.current!.width / 3) | 0, (canvasRef.current!.height / 3) | 0)
    requestAnimationFrame(drawOverlay)
  }

  useEffect(() => {
    if (streaming) requestAnimationFrame(drawOverlay)
  }, [streaming])

  useEffect(() => {
    return () => {
      if (uploadUrl) URL.revokeObjectURL(uploadUrl)
    }
  }, [uploadUrl])

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value)

  const extractAnomalyMetrics = (data: Record<string, unknown> | null) => {
    if (!data) return null
    const summary = isRecord(data.summary) ? (data.summary as Record<string, unknown>) : null
    if (!summary) return null

    const numberOrNull = (value: unknown) => (typeof value === "number" ? value : null)

    const detectionsCount =
      numberOrNull(summary.detections_count) ?? numberOrNull(summary.detections_total) ?? null
    const restrictedCount =
      numberOrNull(summary.restricted_event_count) ?? numberOrNull(summary.restricted_event_total) ?? null
    const framesProcessed = numberOrNull(summary.frames_processed) ?? null

    const restrictedEventsRaw = Array.isArray(summary.restricted_events) ? summary.restricted_events : []
    const restrictedEvents = restrictedEventsRaw
      .filter((item) => isRecord(item))
      .slice(0, 5) as Record<string, unknown>[]

    const sampleDetectionsRaw = Array.isArray(summary.sample_detections) ? summary.sample_detections : []
    const sampleDetections = sampleDetectionsRaw
      .filter((item) => isRecord(item))
      .slice(0, 5) as Record<string, unknown>[]

    const labelsSet = new Set<string>()
    const pushLabel = (value: unknown) => {
      if (typeof value === "string" && value.trim()) labelsSet.add(value.trim())
    }

    if (Array.isArray(summary.detections)) {
      summary.detections.forEach((item) => {
        if (isRecord(item)) pushLabel(item.label)
      })
    }

    restrictedEvents.forEach((event) => pushLabel(event.label))

    sampleDetections.forEach((entry) => {
      const items = Array.isArray(entry.items) ? entry.items : []
      items.forEach((det) => {
        if (isRecord(det)) pushLabel(det.label)
      })
    })

    return {
      detectionsCount,
      restrictedCount,
      framesProcessed,
      restrictedEvents,
      sampleDetections,
      labels: Array.from(labelsSet).slice(0, 12),
    }
  }

  const extractWeaponMetrics = (data: Record<string, unknown> | null) => {
    if (!data) return null
    const summary = isRecord(data.summary) ? (data.summary as Record<string, unknown>) : null
    if (!summary) return null

    const numberOrNull = (value: unknown) => (typeof value === "number" ? value : null)
    const detectionsCount =
      numberOrNull(summary.detections_count) ?? numberOrNull(summary.detections_total) ?? null
    const weaponsFound = numberOrNull(summary.weapons_detected) ?? numberOrNull(summary.authorized_count) ?? null
    const framesProcessed = numberOrNull(summary.frames_processed) ?? null

    const labelsSet = new Set<string>()
    const pushLabel = (value: unknown) => {
      if (typeof value === "string" && value.trim()) labelsSet.add(value.trim())
    }

    const flattenDetections = (items: unknown) => {
      const arr = Array.isArray(items) ? items : []
      arr.forEach((item) => {
        if (isRecord(item)) pushLabel(item.label)
      })
    }

    flattenDetections(summary.detections)
    flattenDetections(summary.weapon_detections)

    const eventsRaw = Array.isArray(summary.sample_detections) ? summary.sample_detections : []
    const sampleEvents = eventsRaw.filter((item) => isRecord(item)).slice(0, 5) as Record<string, unknown>[]
    sampleEvents.forEach((item) => {
      const sub = Array.isArray(item.items) ? item.items : []
      sub.forEach((entry) => {
        if (isRecord(entry)) pushLabel(entry.label)
      })
    })

    return {
      detectionsCount,
      weaponsFound,
      framesProcessed,
      labels: Array.from(labelsSet).slice(0, 12),
      sampleEvents,
    }
  }

  const evaluateAuthorization = (payload: Record<string, unknown> | null) => {
    if (!payload) return { found: false, granted: false }

    let found = false
    let granted = false

    const considerBoolean = (value: unknown) => {
      if (typeof value === "boolean") {
        found = true
        if (value) granted = true
      }
    }

    const considerCount = (value: unknown) => {
      if (typeof value === "number") {
        found = true
        if (value > 0) granted = true
      }
    }

    considerBoolean(payload.authorized)
    considerBoolean(payload.accessGranted)
    considerBoolean(payload.grant_access)

    const summary = isRecord(payload.summary) ? (payload.summary as Record<string, unknown>) : undefined

    if (summary) {
      considerBoolean(summary.authorized)
      considerCount(summary.authorized_count)
      considerCount(summary.known_faces)
      considerCount(summary.authorized_events_total)

      const detections = summary.detections
      if (Array.isArray(detections)) {
        let detectionFound = false
        for (const det of detections) {
          if (isRecord(det) && typeof det.authorized === "boolean") {
            detectionFound = true
            if (det.authorized) granted = true
          }
        }
        if (detectionFound) found = true
      }

      const events = summary.authorized_events
      if (Array.isArray(events)) {
        let eventFound = false
        for (const evt of events) {
          if (isRecord(evt)) {
            if (typeof evt.authorized === "boolean") {
              eventFound = true
              if (evt.authorized) granted = true
            } else {
              eventFound = true
              // Authorized events in backend imply success unless explicitly false
              granted = true
            }
          }
        }
        if (eventFound) found = true
      }
    }

    return { found, granted }
  }

  const authorization = useMemo(() => evaluateAuthorization(uploadResponse), [uploadResponse])

  const moduleHistory = useMemo(
    () => history.filter((entry) => entry.module === params.slug),
    [history, params.slug],
  )

  const anomalyDetails = useMemo(
    () => (isAnomalyModule ? extractAnomalyMetrics(uploadResponse) : null),
    [isAnomalyModule, uploadResponse],
  )

  const weaponDetails = useMemo(
    () => (isWeaponModule ? extractWeaponMetrics(uploadResponse) : null),
    [isWeaponModule, uploadResponse],
  )

  const moduleMetrics = useMemo<MetricsOverview | null>(() => {
    if (!moduleHistory.length) return null

    const getNumberValues = (key: string) =>
      moduleHistory
        .map((entry) => entry.countsMap?.[key])
        .filter((value): value is number => typeof value === "number")

    const sumValues = (values: number[]) => values.reduce((acc, value) => acc + value, 0)
    const avgValues = (values: number[]) => (values.length ? sumValues(values) / values.length : null)

    if (params.slug === "face-recognition") {
      const total = moduleHistory.length
      const granted = moduleHistory.filter((entry) => entry.summary.status === "granted").length
      const denied = total - granted
      const knownValues = getNumberValues("Known Faces")
      const unknownValues = getNumberValues("Unknown Faces")
      const avgKnown = avgValues(knownValues)
      const avgUnknown = avgValues(unknownValues)
      const lastTimestamp = moduleHistory[0]?.timestamp ?? "—"

      return {
        cards: [
          { label: "Total Sessions", value: String(total) },
          { label: "Access Granted", value: String(granted), accent: "success" },
          { label: "Access Denied", value: String(denied), accent: denied > 0 ? "danger" : undefined },
          { label: "Avg Known Faces", value: avgKnown !== null ? avgKnown.toFixed(1) : "-" },
          { label: "Avg Unknown Faces", value: avgUnknown !== null ? avgUnknown.toFixed(1) : "-" },
          { label: "Last Run", value: lastTimestamp },
        ],
        note: "Metrics calculated from local session history.",
      }
    }

    if (params.slug === "anomaly-detection") {
      const total = moduleHistory.length
      const restrictedSessions = moduleHistory.filter((entry) => entry.summary.status === "restricted").length
      const restrictedValues = getNumberValues("Restricted Events")
      const detectionValues = getNumberValues("Total Detections")
      const restrictedSum = sumValues(restrictedValues)
      const detectionsSum = sumValues(detectionValues)
      const avgRestricted = avgValues(restrictedValues)
      const lastTimestamp = moduleHistory[0]?.timestamp ?? "—"

      return {
        cards: [
          { label: "Total Sessions", value: String(total) },
          { label: "Sessions with Alerts", value: String(restrictedSessions), accent: restrictedSessions ? "danger" : undefined },
          { label: "Restricted Events", value: String(restrictedSum) },
          { label: "Total Detections", value: String(detectionsSum) },
          { label: "Avg Restricted Events", value: avgRestricted !== null ? avgRestricted.toFixed(1) : "-" },
          { label: "Last Run", value: lastTimestamp },
        ],
        note: "Alert counts reflect uploads from this browser session only.",
      }
    }

    if (params.slug === "weapon-detection") {
      const total = moduleHistory.length
      const weaponSessions = moduleHistory.filter((entry) => entry.summary.status === "weapons-detected").length
      const weaponsValues = getNumberValues("Weapons Found")
      const detectionValues = getNumberValues("Detections")
      const weaponsSum = sumValues(weaponsValues)
      const detectionsSum = sumValues(detectionValues)
      const avgWeapons = avgValues(weaponsValues)
      const lastTimestamp = moduleHistory[0]?.timestamp ?? "—"

      return {
        cards: [
          { label: "Total Sessions", value: String(total) },
          { label: "Weapon Alerts", value: String(weaponSessions), accent: weaponSessions ? "danger" : undefined },
          { label: "Weapons Found", value: String(weaponsSum), accent: weaponsSum ? "danger" : undefined },
          { label: "Total Detections", value: String(detectionsSum) },
          { label: "Avg Weapons / Session", value: avgWeapons !== null ? avgWeapons.toFixed(1) : "-" },
          { label: "Last Run", value: lastTimestamp },
        ],
        note: "Weapon statistics are aggregated from this session's uploads.",
      }
    }

    return {
      cards: [
        { label: "Total Sessions", value: String(moduleHistory.length) },
        { label: "Last Run", value: moduleHistory[0]?.timestamp ?? "—" },
      ],
    }
  }, [moduleHistory, params.slug])

  const buildSummaryForModule = (
    module: string,
    data: Record<string, unknown> | null,
    faceAuth: { found: boolean; granted: boolean },
  ): ResultSummary | null => {
    if (!data) return null

    const summaryRecord = isRecord(data.summary) ? (data.summary as Record<string, unknown>) : null

    if (module === "face-recognition" && summaryRecord) {
      const toNumber = (value: unknown) => (typeof value === "number" ? value : null)
      const detections = toNumber(summaryRecord.detections_count) ?? toNumber(summaryRecord.faces_detected) ?? null
      const known = toNumber(summaryRecord.authorized_count) ?? toNumber(summaryRecord.known_faces) ?? null
      const unknown = toNumber(summaryRecord.unknown_faces) ?? null

      return {
        description: faceAuth.granted ? "Access Granted" : "Access Denied",
        counts: [
          { label: "Faces Detected", value: detections },
          { label: "Known Faces", value: known, highlight: true },
          { label: "Unknown Faces", value: unknown },
        ],
        status: faceAuth.granted ? "granted" : "denied",
      }
    }

    if (module === "anomaly-detection") {
      const metrics = extractAnomalyMetrics(data)
      if (!metrics) return null
      return {
        description: metrics.restrictedCount && metrics.restrictedCount > 0
          ? "Restricted activity detected"
          : "No restricted movement detected",
        counts: [
          { label: "Total Detections", value: metrics.detectionsCount },
          { label: "Restricted Events", value: metrics.restrictedCount, highlight: true },
          { label: "Frames Processed", value: metrics.framesProcessed },
        ],
        status: metrics.restrictedCount && metrics.restrictedCount > 0 ? "restricted" : "clear",
      }
    }

    if (module === "weapon-detection") {
      const metrics = extractWeaponMetrics(data)
      if (!metrics) return null
      return {
        description: metrics.weaponsFound && metrics.weaponsFound > 0
          ? "Weapon activity detected"
          : "No weapons identified",
        counts: [
          { label: "Detections", value: metrics.detectionsCount },
          { label: "Weapons Found", value: metrics.weaponsFound, highlight: true },
          { label: "Frames Processed", value: metrics.framesProcessed },
        ],
        status: metrics.weaponsFound && metrics.weaponsFound > 0 ? "weapons-detected" : "no-weapons",
      }
    }

    return null
  }

  const summaryCard = !isUploading && !uploadError && currentSummary ? (
    <div className="rounded-md border bg-muted/30 px-3 py-3 text-sm">
      <p className="font-medium">{currentSummary.description}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {currentSummary.counts.map((item) => (
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
    setProcessedMedia(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      const raw = await response.text()
      let data: Record<string, unknown> | null = null
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          if (isRecord(parsed)) {
            data = parsed
          } else {
            data = { data: parsed as unknown }
          }
        } catch (parseError) {
          console.error("Failed to parse response JSON", parseError)
          data = { detail: raw }
        }
      }

      if (!response.ok) {
        const detail = data && typeof data.detail === "string" ? data.detail : "Upload failed"
        throw new Error(detail)
      }

      const resolvedData = data ?? { detail: "Empty response" }
      const faceAuth = evaluateAuthorization(resolvedData)
      const summaryForModule = buildSummaryForModule(params.slug, resolvedData, faceAuth)
      if (summaryForModule) {
        setCurrentSummary(summaryForModule)
        const entry: HistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          module: params.slug,
          timestamp: new Date().toLocaleString(),
          summary: summaryForModule,
          countsMap: Object.fromEntries(
            summaryForModule.counts.map((item) => [item.label, typeof item.value === "number" ? item.value : null]),
          ),
        }
        setHistory((prev) => [entry, ...prev].slice(0, 20))
      }

      setUploadResponse(resolvedData)

      if (resolvedData && typeof resolvedData === "object") {
        const rawOutput = (resolvedData as Record<string, unknown>).output_url
        if (typeof rawOutput === "string" && rawOutput.length > 0) {
          const absoluteUrl = rawOutput.startsWith("http") ? rawOutput : `${apiBase}${rawOutput}`
          const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(rawOutput)
          setProcessedMedia({ url: absoluteUrl, type: isVideo ? "video" : "image" })
        }
      }
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") return
      const message = error instanceof Error ? error.message : "Unexpected error during upload"
      setUploadError(message)
    } finally {
      setIsUploading(false)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setUploadUrl((prev) => {
      if (prev && prev !== url) URL.revokeObjectURL(prev)
      return url
    })
    setUploadType(f.type.startsWith("video/") ? "video" : "image")
    setProcessedMedia(null)
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

      <Tabs defaultValue="analysis">
        <TabsList className="mb-2">
          <TabsTrigger value="analysis">Live Analysis</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Camera</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="relative overflow-hidden rounded-md border">
                  <video ref={videoRef} className="block h-72 w-full bg-black/60 object-contain" muted playsInline />
                  <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
                </div>
                <div className="flex gap-2">
                  {!streaming ? (
                    <Button onClick={startCamera} className="btn-cyber hover-glow">
                      Start Camera
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={stopCamera} className="btn-cyber bg-transparent">
                      Stop
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Model Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="motion"
                      stroke="var(--color-chart-4)"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload Image/Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <input
                type="file"
                accept="image/*,video/*"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                onChange={onFileChange}
              />
              {uploadUrl && (
                isFaceModule ? (
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex shrink-0 items-center justify-center rounded-md border bg-muted/30 p-2">
                      {uploadType === "video" ? (
                        <video
                          src={uploadUrl}
                          controls
                          className="h-40 w-28 rounded-sm object-cover"
                        />
                      ) : (
                        <img
                          src={uploadUrl || "/placeholder.svg"}
                          alt="Uploaded preview"
                          className="h-40 w-28 rounded-sm object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Verification result</p>
                      {isUploading && (
                        <Alert className="mt-2 border-primary/40 bg-primary/5">
                          <Spinner className="size-4 text-primary" />
                          <AlertTitle>Analyzing face data…</AlertTitle>
                          <AlertDescription>
                            <p>Sending the uploaded file to the surveillance API. This can take a few seconds.</p>
                          </AlertDescription>
                        </Alert>
                      )}
                      {uploadError && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertTitle>Upload failed</AlertTitle>
                          <AlertDescription>
                            <p>{uploadError}</p>
                          </AlertDescription>
                        </Alert>
                      )}
                      {!isUploading && !uploadError && authorization.found && (
                        <div
                          className={`mt-2 rounded-md border px-4 py-3 text-sm font-medium ${
                            authorization.granted
                              ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-600"
                              : "border-red-400/60 bg-red-500/10 text-red-600"
                          }`}
                        >
                          {authorization.granted ? "Access Granted" : "Access Denied"}
                        </div>
                      )}
                      {!isUploading && !uploadError && !authorization.found && (
                        <p className="mt-2 text-sm text-muted-foreground">Awaiting verification response…</p>
                      )}
                      {summaryCard && <div className="mt-4">{summaryCard}</div>}
                    </div>
                  </div>
                ) : processedMedia && processedMedia.type === "image" && uploadType === "image" ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Original</p>
                      <img
                        src={uploadUrl || "/placeholder.svg"}
                        alt="Uploaded original"
                        className="mt-1 w-full max-w-xs rounded-md border object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Annotated</p>
                      <img
                        src={processedMedia.url}
                        alt="Annotated detection"
                        className="mt-1 w-full max-w-xs rounded-md border object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    {uploadType === "video" ? (
                      <video src={uploadUrl} controls className="w-full rounded-md border object-contain" />
                    ) : (
                      <img
                        src={uploadUrl || "/placeholder.svg"}
                        alt="Uploaded preview"
                        className="w-full rounded-md border object-cover"
                      />
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">Preview shown locally.</p>
                  </div>
                )
              )}
              {!isFaceModule && (
                <div className="space-y-3 pt-1">
                  {isUploading && (
                    <Alert className="border-primary/40 bg-primary/5">
                      <Spinner className="size-4 text-primary" />
                      <AlertTitle>Uploading…</AlertTitle>
                      <AlertDescription>
                        <p>Sending the file to the analysis API.</p>
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
                  {summaryCard}
                  {processedMedia && processedMedia.type === "video" && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Annotated output</p>
                      <video
                        src={processedMedia.url}
                        controls
                        className="w-full rounded-md border object-contain"
                      />
                    </div>
                  )}
                  {(isAnomalyModule || isWeaponModule) && !isUploading && !uploadError && (anomalyDetails || weaponDetails) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {anomalyDetails?.detectionsCount !== null && (
                          <div className="rounded-md border bg-muted/40 px-3 py-3 text-sm">
                            <p className="text-xs uppercase text-muted-foreground">Detections</p>
                            <p className="text-lg font-semibold">{anomalyDetails?.detectionsCount}</p>
                          </div>
                        )}
                        {anomalyDetails?.restrictedCount !== null && (
                          <div className="rounded-md border bg-muted/40 px-3 py-3 text-sm">
                            <p className="text-xs uppercase text-muted-foreground">Restricted Events</p>
                            <p className="text-lg font-semibold text-red-500">
                              {anomalyDetails?.restrictedCount}
                            </p>
                          </div>
                        )}
                        {anomalyDetails?.framesProcessed !== null && (
                          <div className="rounded-md border bg-muted/40 px-3 py-3 text-sm">
                            <p className="text-xs uppercase text-muted-foreground">Frames Processed</p>
                            <p className="text-lg font-semibold">{anomalyDetails?.framesProcessed}</p>
                          </div>
                        )}
                        {weaponDetails?.detectionsCount !== null && (
                          <div className="rounded-md border bg-muted/40 px-3 py-3 text-sm">
                            <p className="text-xs uppercase text-muted-foreground">Detections</p>
                            <p className="text-lg font-semibold">{weaponDetails?.detectionsCount}</p>
                          </div>
                        )}
                        {weaponDetails?.weaponsFound !== null && (
                          <div className="rounded-md border bg-muted/40 px-3 py-3 text-sm">
                            <p className="text-xs uppercase text-muted-foreground">Weapon Hits</p>
                            <p className="text-lg font-semibold text-red-500">
                              {weaponDetails?.weaponsFound}
                            </p>
                          </div>
                        )}
                        {weaponDetails?.framesProcessed !== null && (
                          <div className="rounded-md border bg-muted/40 px-3 py-3 text-sm">
                            <p className="text-xs uppercase text-muted-foreground">Frames Processed</p>
                            <p className="text-lg font-semibold">{weaponDetails?.framesProcessed}</p>
                          </div>
                        )}
                      </div>
                      {anomalyDetails?.restrictedEvents.length ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase text-muted-foreground">Recent Restricted Events</p>
                          <div className="space-y-2">
                            {anomalyDetails?.restrictedEvents.map((event, idx) => (
                              <div key={idx} className="flex items-start justify-between rounded-md border px-3 py-2 text-sm">
                                <div>
                                  <p className="font-medium text-red-600">
                                    {typeof event.label === "string" ? event.label : "Restricted"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {typeof event.timestamp === "string" ? event.timestamp : "Detected"}
                                  </p>
                                </div>
                                {typeof event.confidence === "number" && (
                                  <span className="text-xs text-muted-foreground">
                                    {(event.confidence * 100).toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {anomalyDetails && anomalyDetails.restrictedEvents.length === 0 && anomalyDetails.sampleDetections.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase text-muted-foreground">Sample Detections</p>
                          <div className="space-y-2">
                            {anomalyDetails.sampleDetections.map((item, idx) => (
                              <div key={idx} className="rounded-md border px-3 py-2 text-sm">
                                <p className="font-medium text-slate-700">
                                  Frame {typeof item.frame_index === "number" ? item.frame_index : idx}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {Array.isArray(item.items) ? item.items.length : 0} objects detected
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {weaponDetails?.sampleEvents.length ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase text-muted-foreground">Sample Detections</p>
                          <div className="space-y-2">
                            {weaponDetails.sampleEvents.map((entry, idx) => (
                              <div key={idx} className="rounded-md border px-3 py-2 text-sm">
                                <p className="font-medium text-slate-700">
                                  Frame {typeof entry.frame_index === "number" ? entry.frame_index : idx}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {Array.isArray(entry.items) ? entry.items.length : 0} objects detected
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {(anomalyDetails?.labels.length || weaponDetails?.labels.length) && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase text-muted-foreground">Detected Objects</p>
                          <div className="flex flex-wrap gap-2">
                            {[...(anomalyDetails?.labels ?? []), ...(weaponDetails?.labels ?? [])].map((label) => (
                              <span
                                key={label}
                                className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {isFaceModule && !uploadUrl && (
                <div className="space-y-3 pt-1">
                  {isUploading && (
                    <Alert className="border-primary/40 bg-primary/5">
                      <Spinner className="size-4 text-primary" />
                      <AlertTitle>Analyzing face data…</AlertTitle>
                      <AlertDescription>
                        <p>Sending the uploaded file to the surveillance API. This can take a few seconds.</p>
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
                </div>
              )}
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
                    {moduleMetrics.note && (
                      <p className="text-xs text-muted-foreground">{moduleMetrics.note}</p>
                    )}
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
              {history.filter((item) => item.module === params.slug).length === 0 ? (
                <p className="text-sm text-muted-foreground">No uploads recorded yet.</p>
              ) : (
                history
                  .filter((item) => item.module === params.slug)
                  .map((entry) => (
                    <div key={entry.id} className="rounded-md border px-3 py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{entry.summary.description}</p>
                        <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
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
