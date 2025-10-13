"use client"

import useSWR from "swr"

export type AppConfig = {
  apiBase: string
  endpoints: Record<string, string>
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useAppConfig() {
  const { data, error, isLoading } = useSWR<AppConfig>("/config/config.json", fetcher, {
    revalidateOnFocus: false,
  })
  return {
    config: data,
    isLoading,
    error,
  }
}

export function resolveEndpoint(cfg: AppConfig | undefined, key: string) {
  if (!cfg) return "#"
  const base = cfg.apiBase?.replace(/\/$/, "")
  const path = cfg.endpoints?.[key] || ""
  return `${base}${path}`
}
