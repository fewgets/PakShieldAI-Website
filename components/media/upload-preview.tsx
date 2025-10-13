"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"

type Props = {
  accept?: string
  onFiles?: (files: File[]) => void
}

export default function UploadPreview({ accept = "image/*,video/*", onFiles }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])

  useEffect(() => {
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [urls])

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files || [])
    setFiles(list)
    onFiles?.(list)
  }

  return (
    <div className="space-y-2">
      <input type="file" accept={accept} multiple onChange={onChange} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {files.map((f, i) => {
          const url = urls[i]
          if (f.type.startsWith("video/")) {
            return <video key={i} src={url} controls className="w-full rounded-md border border-[hsl(var(--border))]" />
          }
          return (
            <img
              key={i}
              src={url || "/placeholder.svg"}
              alt="upload preview"
              loading="lazy"
              decoding="async"
              className="w-full rounded-md border border-[hsl(var(--border))]"
            />
          )
        })}
      </div>
    </div>
  )
}
