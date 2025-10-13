export type DomainKey = "threat-intelligence" | "video-analytics" | "border-security"

export type ModuleItem = {
  slug: string
  title: string
  description: string
  endpointKey: string // maps to config.json endpoints keys
  icon?: string
}

export const DOMAIN_TITLES: Record<DomainKey, string> = {
  "threat-intelligence": "Threat Intelligence AI",
  "video-analytics": "Video Surveillance Analytics",
  "border-security": "Border Anomaly Detection",
}

export const DOMAIN_SUMMARIES: Record<DomainKey, string> = {
  "threat-intelligence":
    "Automated threat intel across communication channels, social platforms, and dark web surface.",
  "video-analytics": "Real-time vision analytics for restricted zones, anomaly detection, weapons, and crowd dynamics.",
  "border-security":
    "Persistent border monitoring including drones, vehicles (ANPR), night thermal detection and anomalies.",
}

export const MODULES: Record<DomainKey, ModuleItem[]> = {
  "threat-intelligence": [
    {
      slug: "email-protection",
      title: "Email Protection",
      description: "Detect phishing, malware payloads and spoofed senders.",
      endpointKey: "threat.emailProtection",
      icon: "mail",
    },
    {
      slug: "intrusion-detection",
      title: "Intrusion Detection",
      description: "Network IDS patterns, signatures, and anomaly alerts.",
      endpointKey: "threat.intrusionDetection",
      icon: "shield",
    },
    {
      slug: "discord-detection",
      title: "Discord Detection",
      description: "Monitor Discord channels for malicious links and C2.",
      endpointKey: "threat.discordDetection",
      icon: "hash",
    },
    {
      slug: "telegram-analysis",
      title: "Telegram Analysis",
      description: "Analyze Telegram groups for threat chatter and drops.",
      endpointKey: "threat.telegramAnalysis",
      icon: "send",
    },
    {
      slug: "dark-web-monitoring",
      title: "Dark Web Monitoring",
      description: "Track dumps, leaks, and sale of credentials.",
      endpointKey: "threat.darkWebMonitoring",
      icon: "moon",
    },
    {
      slug: "social-media-analysis",
      title: "Social Media Analysis",
      description: "Sentiment and threat narratives across platforms.",
      endpointKey: "threat.socialMediaAnalysis",
      icon: "globe",
    },
    // additional module of choice
    {
      slug: "malware-ioc-correlation",
      title: "Malware IOCs Correlation",
      description: "Link IOCs across sources to uncover campaigns.",
      endpointKey: "threat.malwareIocCorrelation",
      icon: "link",
    },
  ],
  "video-analytics": [
    {
      slug: "face-recognition",
      title: "Face Recognition",
      description: "Identify persons in restricted zones with watchlists.",
      endpointKey: "video.faceRecognition",
      icon: "user",
    },
    {
      slug: "anomaly-detection",
      title: "Anomaly Detection",
      description: "Detect unusual motion or behavior in live feeds.",
      endpointKey: "video.anomalyDetection",
      icon: "activity",
    },
    {
      slug: "weapon-detection",
      title: "Weapon Detection",
      description: "Identify firearms and sharp objects in frames.",
      endpointKey: "video.weaponDetection",
      icon: "crosshair",
    },
    {
      slug: "crowd-analysis",
      title: "Crowd Analysis",
      description: "Density, flow, and congestion hotspots.",
      endpointKey: "video.crowdAnalysis",
      icon: "users",
    },
    {
      slug: "suspicious-activity",
      title: "Suspicious Activity Detection",
      description: "Loitering, tailgating, and unusual paths.",
      endpointKey: "video.suspiciousActivity",
      icon: "alert-triangle",
    },
    // additional module of choice
    {
      slug: "perimeter-breach",
      title: "Perimeter Breach Alerts",
      description: "Virtual tripwires and off-hours movement.",
      endpointKey: "video.perimeterBreach",
      icon: "wall",
    },
  ],
  "border-security": [
    {
      slug: "drone-detection",
      title: "Drone Detection",
      description: "RF and visual detection for unauthorized drones.",
      endpointKey: "border.droneDetection",
      icon: "radio",
    },
    {
      slug: "suspicious-activity",
      title: "Suspicious Activity Detection",
      description: "Pattern-of-life deviations near border.",
      endpointKey: "border.suspiciousActivity",
      icon: "search",
    },
    {
      slug: "vehicle-anpr",
      title: "Vehicle Detection & ANPR",
      description: "Detect vehicles and read number plates.",
      endpointKey: "border.vehicleAnpr",
      icon: "car",
    },
    {
      slug: "night-thermal-person",
      title: "Night/Thermal Person Detection",
      description: "Low-light and thermal detection of persons.",
      endpointKey: "border.nightThermalPerson",
      icon: "moon-star",
    },
    // additional module of choice
    {
      slug: "smuggling-route-patterns",
      title: "Smuggling Route Patterns",
      description: "Temporal and geospatial route anomalies.",
      endpointKey: "border.smugglingRoutes",
      icon: "map",
    },
  ],
}

export function getModule(domain: DomainKey, slug: string) {
  return MODULES[domain].find((m) => m.slug === slug)
}
