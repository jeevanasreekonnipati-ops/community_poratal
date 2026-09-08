# 🏛️ Sachivalayam & Community Resource Portal (CRP)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.9-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-ffca28?style=flat&logo=firebase)](https://firebase.google.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-OpenStreetMap-199900?style=flat&logo=leaflet)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent, multi-tier civic governance platform connecting **Citizens**, **Village Secretaries (Admins)**, **MRO / MPDO Optimizers**, and **State Higher Authorities** with real-time mapping, SLA grievance tracking, AI-powered welfare navigation, emergency response, and development grant fund allocation.

---

## 🌐 Live Application
- **Production URL:** [https://community-poratal.vercel.app](https://community-poratal.vercel.app)
- **GitHub Repository:** [https://github.com/jeevanasreekonnipati-ops/community_poratal](https://github.com/jeevanasreekonnipati-ops/community_poratal)

---

## 🌟 Comprehensive Feature Suite

### 1. 🧑‍🌾 Citizen Dashboard (`/dashboards/citizen`)
- **📢 Real-Time Village Notice Board:** Live marquee and ticker displaying urgent village advisories, free health camps, water pipeline maintenance, and agricultural subsidies.
- **🤖 AI Scheme Navigator & Grievance Assistant:**
  - *Scheme Finder:* Filters government welfare schemes (Aarogyasri, Rythu Bharosa, Amma Vodi, Vidya Deevena, Jal Jeevan) by beneficiary category, age, and income.
  - *AI Grievance Formalizer:* Converts conversational complaints into formal government petitions with SLA urgency tags and auto-fills the reporting form with 1 click.
- **🚨 1-Tap Emergency SOS Directory:** Quick dialers for **112** (National Emergency), **108** (Ambulance), **104** (Telemedicine), **1902** (CM Spandana Grievance), **181** (Women Safety), **1930** (Cyber Fraud), and **14400** (ACB).
- **🗺️ Interactive Geospatial Map:** Click-to-pin and 1-tap GPS geolocation detection displaying all approved community amenities (Schools, Hospitals, Water Plants, Sanitation, Transport, Parks, Government Support).
- **🏛️ Elected Officials Mapping:** Dynamic lookup of representatives (Prime Minister, Chief Minister, MP, MLA) auto-detected from user coordinates.
- **📋 100% Private Issue History Tracker:** Strictly isolated per account with submission timestamp, live status badges (*Approved*, *Pending*, *Rejected*), days-elapsed counter, and live approval celebration banners 🎉.

---

### 2. 🧑‍💼 Secretary (Admin) Dashboard (`/dashboards/admin`)
- **⏱️ 48-Hour SLA Countdown Clock:** Real-time countdown clock tracking compliance with Citizen Charter SLAs and flagging overdue breaches.
- **🏷️ AI Urgency Priority Scoring:** Automatic categorization into `🔴 CRITICAL` (Drinking water, hospitals), `🟠 HIGH` (Schools, welfare support), and `🟢 NORMAL`.
- **💬 Citizen SMS / WhatsApp Dispatcher:** Pre-formatted official approval/resolution notification templates with 1-click clipboard copy.
- **📢 Live Notice Broadcaster:** Tool for Secretaries to publish urgent advisories directly to all citizen dashboards in real time.
- **📄 PDF & CSV Report Generators:** One-click generation of formatted governance survey reports and CSV exports for offline auditing.
- **👥 User Role Management & Audit Logs:** Live panel to update user roles (`citizen`, `admin`, `optimizer`, `authority`) with timestamped action logs.

---

### 3. 🔭 Optimizer (MRO / MPDO) Dashboard (`/dashboards/optimizer`)
- **📊 Welfare Scheme Gap Analysis:** Tracks unserved populations across major central and state schemes (Jal Jeevan, Rythu Bharosa, PMAY, Cheyutha).
- **🏆 Village Performance Rankings:** Automatic grading of mandal villages by resolution speed and responsiveness.
- **💰 Mandal Development Grants & Fund Tracker:** Monitors state-sanctioned infrastructure project funds and local expenditure.
- **📋 Comprehensive Reports Directory:** Filterable by village and resolution status with Secretary response inspection.
- **📨 1-Click Monthly Escalation to Higher Authority:** Compiles mandal metrics and transmits official monthly reports directly to the District Collector.
- **🗺️ Problem Hotspot Map:** Visual geographical distribution of unresolved issues across the mandal.

---

### 4. 🏛️ Higher Authority (Collector & State Oversight) Dashboard (`/dashboards/authority`)
- **📈 State Executive Summary:** Statewide resolution metrics, overall performance index (`84% Excellent`), and critical low-performing district alerts.
- **💰 Special Development Grant Allocator & Budget Ledger:**
  - *Live State Budget Pool:* Real-time ledger displaying Total Discretionary Pool (**₹50,00,000**), Total Sanctioned, and Remaining Available Pool.
  - *Grant Sanction Form:* Authorize accelerated development grants (e.g., ₹5,00,000 for RO water purification, ₹8,50,000 for road works) with instant ledger updates.
- **📨 MRO Reports (Direct Inbox):** Centralized repository of monthly escalation reports submitted by mandal MROs.
- **📍 Statewide Heatmap:** Macro-level geographic visualization of pending vs. resolved civic infrastructure needs.

---

## ⚡ Role Switching & Security Passcodes

Users can switch between all 4 dashboards instantly using the **`⚡ Switch Role with Passcode`** modal in the left sidebar:

| Role | Dashboard URL | Passcode |
| :--- | :--- | :--- |
| **🧑‍🌾 Citizen** | `/dashboards/citizen` | *No passcode required* |
| **🧑‍💼 Secretary (Admin)** | `/dashboards/admin` | `admin123` |
| **🔭 MRO / MPDO (Optimizer)** | `/dashboards/optimizer` | `optimizer123` |
| **🏛️ Higher Authority (Collector)** | `/dashboards/authority` | `authority123` |

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework & Engine** | [Next.js 16 (App Router + Turbopack)](https://nextjs.org/) + [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Cloud Database & Auth** | [Firebase Firestore](https://firebase.google.com/) + [Firebase Authentication](https://firebase.google.com/products/auth) |
| **Geospatial & Mapping** | [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/) + [OpenStreetMap](https://www.openstreetmap.org/) *(100% Free - No API Key Required)* |
| **Reporting & Exporting** | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| **Styling & Design** | GeeksForGeeks-inspired clean UI, Glassmorphism panels, India Watermark background, CSS Modules |

---

## 🚀 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/jeevanasreekonnipati-ops/community_poratal.git
cd community_poratal
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory (refer to `.env.example`):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAosZ0fHjUFgfFY-UyKL-czl5wY-lnxme8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=csp-project-c312a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=csp-project-c312a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=csp-project-c312a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=977575288645
NEXT_PUBLIC_FIREBASE_APP_ID=1:977575288645:web:79dc6e71227d6e1995a82c
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Repository Structure

```
├── src/
│   ├── app/
│   │   ├── auth/                    # Authentication (Email/Password & Google OAuth)
│   │   ├── dashboards/
│   │   │   ├── layout.tsx           # GFG-style Sidebar & Passcode Role Switcher
│   │   │   ├── citizen/page.tsx     # Citizen Portal (Map, AI Assistant, SOS, Private History)
│   │   │   ├── admin/page.tsx       # Secretary Admin (SLA Timers, Notice Broadcaster, SMS)
│   │   │   ├── optimizer/page.tsx   # MRO Optimizer (Scheme Gaps, Funds, Monthly Escalation)
│   │   │   └── authority/page.tsx   # Higher Authority (State Budget Ledger & Grant Sanctions)
│   │   ├── globals.css              # Theme tokens, Glassmorphism styling, India Map watermark
│   │   └── page.tsx                 # Landing Page with feature cards & role entry points
│   ├── components/
│   │   ├── AIAssistantModal.tsx     # Smart Welfare Scheme Navigator & AI Grievance Formalizer
│   │   ├── AuthGuard.tsx            # RBAC Role Guard with inline passcode unlocker
│   │   ├── EmergencyDirectoryModal.tsx # 1-Tap SOS Emergency Helpline Directory
│   │   ├── GovtSupportPanel.tsx     # Government support schemes explorer
│   │   ├── Map.tsx                  # Interactive Leaflet Map with GPS & click-to-pin
│   │   ├── Navbar.tsx               # Reactive Navbar with user session & role badges
│   │   ├── NoticeBoardBanner.tsx    # Live rotating village announcement ticker
│   │   └── RepresentativesPanel.tsx # Geolocation-based MP/MLA/CM/PM lookup
│   └── lib/
│       ├── firebase.ts              # Firebase initialization & SDK exports
│       ├── funds.ts                 # Development Grant allocations & Budget Ledger store
│       ├── noticeBoard.ts           # Village notice board store & Firestore sync
│       ├── performanceScoring.ts    # Performance scoring algorithms & tier grading
│       ├── representatives.ts       # Central & Andhra Pradesh elected officials data
│       ├── schemes.ts               # Welfare schemes database & eligibility criteria
│       ├── useResources.ts          # Real-time reactive resource survey hook
│       └── userProfile.ts           # User profiles, submissions & monthly report store
├── public/                          # Static icons, banners & assets
├── .env.example                     # Reference environment variables
├── package.json
└── README.md
```

---

## 🔒 Security & Privacy

- **Account Isolation:** Citizen issue history is strictly scoped to the authenticated user's `uid` and verified `email`.
- **Zero Data Leakage:** Stale profile and session caches are automatically purged upon logout.
- **Open Geospatial Standards:** Uses open-source OpenStreetMap tiles with no third-party tracking or paid map dependencies.
- **Resilient Fallback:** Offline `localStorage` caching ensures uninterrupted operation during intermittent network connectivity.

---

## 📜 License
This project is licensed under the MIT License — open for community governance and civic empowerment.
