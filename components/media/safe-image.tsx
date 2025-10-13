"use client"

import React from "react"

type SafeImageProps = {
  src?: string | null
  alt: string
  width: number
  height: number
  className?: string
  placeholderQuery?: string
  sizes?: string
  fetchPriority?: "high" | "low" | "auto"
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  placeholderQuery = "cyber defense module", // hard-coded placeholder query per guidelines
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fetchPriority = "low",
}: SafeImageProps) {
  const makePlaceholder = React.useCallback(() => {
    const q = encodeURIComponent(placeholderQuery)
    return `/placeholder.svg?height=${height}&width=${width}&query=${q}`
  }, [height, width, placeholderQuery])

  const [currentSrc, setCurrentSrc] = React.useState<string>(() => {
    return src && src.trim().length > 0 ? src : makePlaceholder()
  })

  const triedFallbackRef = React.useRef(false)

  const handleError = React.useCallback(() => {
    if (triedFallbackRef.current) return
    triedFallbackRef.current = true
    setCurrentSrc(makePlaceholder())
  }, [makePlaceholder])

  return (
    <img
      src={currentSrc || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={sizes}
      className={className}
      onError={handleError}
      // Reserve space to prevent CLS
      style={{ aspectRatio: `${width} / ${height}` }}
    />
  )
}
