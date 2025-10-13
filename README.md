# 🛡️ PakShield Defence AI - Frontend

<div align="center">

![PakShield Defence AI](https://img.shields.io/badge/PakShield-Defence%20AI-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.9-38B2AC?style=for-the-badge&logo=tailwind-css)

**An Advanced AI-Powered Defence Intelligence Platform for Pakistan**

[Features](#-features) • [Installation](#-installation) • [Configuration](#-configuration) • [Deployment](#-deployment) • [API Integration](#-api-integration)

</div>

---

## 📋 Overview

PakShield Defence AI is a cutting-edge **Next.js 15** application that provides a comprehensive dashboard for national security operations. The platform integrates multiple AI-powered modules for threat intelligence, border security, and surveillance systems.

### 🎯 Key Modules

| Module | Description | Status |
|--------|-------------|--------|
| 🔍 **Threat Intelligence** | Email phishing detection, network intrusion detection, dark web monitoring | ✅ Active |
| 🛡️ **Border Security** | Drone detection, suspicious activity tracking, thermal imaging | ✅ Active |
| 📹 **AI Surveillance** | Face recognition, weapon detection, anomaly detection | ✅ Active |

---

## ✨ Features

### 🎨 Modern UI/UX
- **Dark/Light Theme** with system preference detection
- **Responsive Design** optimized for all devices
- **Smooth Animations** powered by Framer Motion
- **Accessible Components** using Radix UI primitives
- **Real-time Updates** with SWR data fetching

### 🔐 Security Features
- **Real-time Threat Monitoring**
- **AI-Powered Analytics**
- **Secure Authentication** (Auth module ready)
- **End-to-end Encrypted Communications**

### 📊 Advanced Analytics
- **Interactive Charts** with Recharts
- **Live Data Visualization**
- **Historical Trend Analysis**
- **Customizable Dashboards**

### 🚀 Performance
- **Server-Side Rendering (SSR)**
- **Static Site Generation (SSG)**
- **Optimized Image Loading**
- **Code Splitting & Lazy Loading**
- **Edge Runtime Support**

---

## 🛠️ Technology Stack

### Core Framework
```
Next.js 15.2.4    - React framework with App Router
React 19          - UI library
TypeScript 5      - Type-safe development
```

### Styling & UI
```
Tailwind CSS 4.1.9        - Utility-first CSS framework
Radix UI                  - Accessible component primitives
shadcn/ui                 - Beautiful component library
Framer Motion             - Animation library
Lucide React              - Icon library
```

### Data & State Management
```
SWR                       - Data fetching & caching
React Hook Form           - Form handling
Zod                       - Schema validation
```

### Additional Tools
```
Geist Font                - Modern typography
Vercel Analytics          - Performance monitoring
Next Themes               - Theme management
```

---

## 📦 Installation

### Prerequisites
- **Node.js** 18.x or higher
- **pnpm** (recommended) or npm
- **Git**

### Step 1: Clone the Repository
```bash
git clone https://github.com/21Afnan/PakShield_Defence_AI.git
cd PakShield_Defence_AI/Frontend
```

### Step 2: Install Dependencies
```bash
pnpm install
# or
npm install
```

### Step 3: Configure Environment
Create a `.env.local` file in the Frontend directory:

```env
# Application
NEXT_PUBLIC_APP_NAME="PakShield Defence AI"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-ngrok-url.ngrok-free.app

# Analytics (Optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### Step 4: Start Development Server
```bash
pnpm dev
# or
npm run dev
```

Visit **http://localhost:3000** to see the application.

---

## ⚙️ Configuration

### API Configuration
The API endpoints are configured in `/public/config/config.json`:

```json
{
  "apiBase": "https://your-backend-url.ngrok-free.app",
  "endpoints": {
    "threat.emailProtection": "/email-classify",
    "threat.intrusionDetection": "/ids-predict",
    "border.droneDetection": "/border/drones/detect",
    "border.suspiciousActivity": "/border/suspicious/detect",
    "video.faceRecognition": "/surveillance/face/recognize",
    "video.weaponDetection": "/surveillance/weapon/detect",
    "video.anomalyDetection": "/surveillance/anomaly/detect"
  }
}
```

### Theme Configuration
Customize colors and themes in `/tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: "hsl(var(--primary))",
      secondary: "hsl(var(--secondary))",
      // Add your custom colors
    }
  }
}
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

#### Option 1: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

#### Option 2: Using Git Integration
1. Push your code to GitHub
2. Import repository on [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy automatically

### Environment Variables on Vercel
Add these in your Vercel project settings:

```
NEXT_PUBLIC_API_BASE_URL = https://your-backend-url.ngrok-free.app
```

### Build for Production
```bash
pnpm build
pnpm start
```

---

## 🔌 API Integration

### Using the API Config Hook
```typescript
import { useAppConfig, resolveEndpoint } from "@/lib/config"

export default function MyComponent() {
  const { config, isLoading, error } = useAppConfig()
  
  const handleDetection = async (file: File) => {
    const endpoint = resolveEndpoint(config, "border.droneDetection")
    
    const formData = new FormData()
    formData.append("file", file)
    
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    })
    
    return response.json()
  }
}
```

### Available API Endpoints

#### Threat Intelligence
- `GET /email-classify` - Email phishing detection
- `POST /ids-predict` - Network intrusion detection

#### Border Security
- `POST /border/drones/detect` - Drone detection from images
- `POST /border/humans/detect` - Night thermal person detection
- `POST /border/suspicious/detect` - Suspicious activity detection

#### AI Surveillance
- `POST /surveillance/face/recognize` - Face recognition
- `POST /surveillance/weapon/detect` - Weapon detection
- `POST /surveillance/anomaly/detect` - Anomaly detection

---

## 📁 Project Structure

```
Frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── (dashboard)/              # Dashboard pages
│   │   ├── threat-intelligence/  # Threat Intel module
│   │   ├── border-security/      # Border Security module
│   │   └── ai-surveillance/      # Surveillance module
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── auth/                     # Authentication components
│   ├── cards/                    # Card components
│   ├── modules/                  # Module-specific components
│   └── layout/                   # Layout components
│
├── lib/                          # Utility functions
│   ├── config.ts                 # API configuration
│   ├── utils.ts                  # Helper functions
│   └── modules.ts                # Module definitions
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts             # Mobile detection
│   └── use-toast.ts              # Toast notifications
│
├── public/                       # Static assets
│   ├── config/                   # Configuration files
│   └── images/                   # Image assets
│
├── styles/                       # Additional styles
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## 🎨 Component Library

This project uses **shadcn/ui** components. To add new components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### Available Components
- ✅ Accordion, Alert Dialog, Avatar
- ✅ Button, Card, Checkbox, Collapsible
- ✅ Dialog, Dropdown Menu, Forms
- ✅ Navigation Menu, Popover, Progress
- ✅ Select, Separator, Slider, Switch
- ✅ Tabs, Toast, Tooltip, Toggle

---

## 🧪 Development

### Available Scripts

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

### Code Quality
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting (recommended)

---

## 🔧 Troubleshooting

### API Connection Issues
1. Verify backend is running
2. Check ngrok tunnel is active
3. Update `apiBase` in `/public/config/config.json`
4. Check CORS settings on backend

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
pnpm install
pnpm build
```

### Type Errors
```bash
# Regenerate types
pnpm type-check
```

---

## 📊 Performance Optimization

### Implemented Optimizations
- ✅ Image optimization with Next.js Image
- ✅ Font optimization with Geist
- ✅ Code splitting and lazy loading
- ✅ SWR for data caching
- ✅ Vercel Analytics integration

### Performance Metrics
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Lighthouse Score**: 95+

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is part of the PakShield Defence AI initiative.

---

## 👥 Team

**Project**: PakShield Defence AI  
**Repository**: [github.com/21Afnan/PakShield_Defence_AI](https://github.com/21Afnan/PakShield_Defence_AI)  
**Owner**: 21Afnan

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact the development team

---

<div align="center">

**Built with ❤️ for Pakistan's Defence**

![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-black?style=flat-square&logo=next.js)
![Powered by AI](https://img.shields.io/badge/Powered%20by-AI-blue?style=flat-square)
![Secure](https://img.shields.io/badge/Security-First-green?style=flat-square&logo=shield)

</div>
