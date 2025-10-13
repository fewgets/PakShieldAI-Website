"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Packet {
  id: string
  x: number
  y: number
  isAttack: boolean
  isClean: boolean
}

interface PacketAnimationProps {
  isRunning: boolean
  onPacketProcessed?: (packet: Packet) => void
}

export function PacketAnimation({ isRunning, onPacketProcessed }: PacketAnimationProps) {
  const [packets, setPackets] = useState<Packet[]>([])

  useEffect(() => {
    if (!isRunning) {
      setPackets([])
      return
    }

    const interval = setInterval(() => {
      const newPacket: Packet = {
        id: `packet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        x: 0,
        y: Math.random() * 200 + 50, // Random y position between 50-250
        isAttack: Math.random() < 0.3, // 30% chance of attack
        isClean: false,
      }

      setPackets(prev => [...prev, newPacket])

      // Simulate packet processing after 2 seconds
      setTimeout(() => {
        setPackets(prev => 
          prev.map(p => 
            p.id === newPacket.id 
              ? { ...p, isClean: !p.isAttack } 
              : p
          )
        )
        onPacketProcessed?.(newPacket)
      }, 2000)

      // Remove packet after animation completes
      setTimeout(() => {
        setPackets(prev => prev.filter(p => p.id !== newPacket.id))
      }, 4000)
    }, 800)

    return () => clearInterval(interval)
  }, [isRunning, onPacketProcessed])

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-md border bg-slate-950/50">
      {/* Network path visualization */}
      <div className="absolute left-4 top-1/2 h-1 w-full -translate-y-1/2 bg-gradient-to-r from-blue-500/30 to-green-500/30" />
      
      {/* Source node */}
      <div className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-blue-500 shadow-lg">
        <div className="absolute -inset-1 animate-ping rounded-full bg-blue-500/50" />
      </div>
      
      {/* Destination node */}
      <div className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-green-500 shadow-lg">
        <div className="absolute -inset-1 animate-ping rounded-full bg-green-500/50" />
      </div>

      {/* Packets */}
      <AnimatePresence>
        {packets.map((packet) => (
          <motion.div
            key={packet.id}
            initial={{ x: 20, scale: 0.8, opacity: 0 }}
            animate={
              packet.isAttack && packet.isClean === false
                ? {
                    x: [20, 150, 150],
                    y: [packet.y, packet.y, packet.y + 100],
                    scale: [0.8, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 0, 180],
                  }
                : {
                    x: [20, "calc(100% - 40px)"],
                    scale: [0.8, 1],
                    opacity: [0, 1],
                  }
            }
            exit={{
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: packet.isAttack && packet.isClean === false ? 2.5 : 3.5,
              ease: "linear",
            }}
            className={`absolute h-3 w-6 rounded-sm ${
              packet.isAttack
                ? packet.isClean
                  ? "bg-yellow-500"
                  : "bg-red-500"
                : "bg-blue-400"
            } shadow-lg`}
            style={{ y: packet.y }}
          >
            {/* Packet indicator */}
            <div className={`h-full w-full rounded-sm ${
              packet.isAttack
                ? packet.isClean
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500 animate-pulse"
                : "bg-blue-400"
            }`} />
            
            {/* Attack warning */}
            {packet.isAttack && !packet.isClean && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-600"
              >
                <div className="absolute -inset-0.5 animate-ping rounded-full bg-red-600/70" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-2 w-3 rounded-sm bg-blue-400" />
          <span className="text-blue-300">Clean</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-3 rounded-sm bg-red-500" />
          <span className="text-red-300">Attack</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-3 rounded-sm bg-yellow-500" />
          <span className="text-yellow-300">Filtered</span>
        </div>
      </div>

      {/* Stats overlay */}
      {isRunning && (
        <div className="absolute top-2 right-2 rounded-md bg-black/50 p-2 text-xs">
          <div className="text-green-400">IDS Active</div>
          <div className="text-blue-300">Monitoring Traffic</div>
        </div>
      )}
    </div>
  )
}