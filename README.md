# 🏛️ Sachivalayam Community Portal

A full-stack **4-tier civic engagement platform** built with **Next.js 14**, **Firebase Firestore**, and **React-Leaflet** — designed for Andhra Pradesh citizens to report local resource issues and track government response in real time.

---

## 🌐 Live Features

### 👤 Citizen Dashboard
- **📍 GPS-based Location Detection** — detects your exact coordinates
- **🗺️ Interactive Live Map** — view all community-reported resources on an OpenStreetMap map with colour-coded markers
- **📝 Submit Resource Surveys** — report issues: Schools, Hospitals, Transport, Sanitation, Parks
- **🏛️ Your Elected Officials Panel** — automatically shows your PM, CM, MP & MLA based on your GPS location (reverse geocoded via Nominatim)
- **💼 Government Support Schemes** — searchable list of 8+ active central government schemes (PM Awas Yojana, Jal Jeevan Mission, Ayushman Bharat, etc.)

### 🛡️ Admin (Secretary) Dashboard
- **⏳ Live Pending Approvals** — review citizen-submitted surveys in real time
- **✅ One-Click Approve / Reject** — updates Firestore instantly
- **👥 Manage User Roles** — view all registered users and change their role (citizen / admin / optimizer / authority)
- **📄 Generate PDF Report** — download a full colour-coded report of all surveys
- **📊 Export CSV** — export all survey data as a spreadsheet
- **📋 View System Logs** — see every approve/reject action with timestamp

### 🔭 Optimizer (MRO) Dashboard
- Monthly trends, village-level analytics, resource type breakdown
- Pattern detection and insights for efficient resource allocation

### 🏛️ Authority Dashboard
- Scheme monitoring across Central / State / District levels
- Escalation tracking and high-level summary statistics

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, TypeScript |
| **Styling** | CSS Modules + Custom CSS Variables (Dynamic Theming) |
| **Database** | Firebase Firestore (real-time) |
| **Auth** | Firebase Authentication (Google + Email) |
| **Maps** | React-Leaflet + OpenStreetMap + Nominatim reverse geocoding |
| **PDF** | jsPDF + jspdf-autotable |
| **Deployment** | Vercel (recommended) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── auth/                       # Login / Register page
│   └── dashboards/
│       ├── layout.tsx              # Sidebar layout (GFG style)
│       ├── citizen/                # Citizen Dashboard
│       ├── admin/                  # Admin / Secretary Dashboard
│       ├── optimizer/              # MRO / Optimizer Dashboard
│       └── authority/              # Higher Authority Dashboard
├── components/
│   ├── Map.tsx                     # Interactive Leaflet map
│   ├── RepresentativesPanel.tsx    # Shows PM/CM/MP/MLA by GPS
│   ├── GovtSupportPanel.tsx        # Government schemes list
│   └── ThemeControls.tsx           # Color theme switcher + India Map watermark
└── lib/
    ├── firebase.ts                 # Firebase config
    ├── useResources.ts             # Real-time Firestore hook
    └── representatives.ts          # AP MP/MLA/CM database
```

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/jeevanasreekonnipati-ops/community_poratal.git
cd community_poratal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Firebase
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎨 UI Design

- Inspired by **GeeksForGeeks** layout: left sidebar navigation + main content area
- **Pure white background** with **GFG Green** (`#2e8b57`) accent color
- **Pastel feature cards** (peach, yellow, teal, green) matching the reference design
- **Dynamic theme switcher** (🎨 button, bottom-right) — change accent color across the entire app
- **India Map watermark** — always visible, adapts to theme color

---

## 🏗️ 4-Tier System Architecture

```
Citizen → submits report
    ↓
Admin (Secretary) → approves / rejects
    ↓
Optimizer (MRO) → monitors trends & patterns
    ↓
Higher Authority → views state-level summary & schemes
```

---

## 📊 Firestore Collections

| Collection | Purpose |
|---|---|
| `resources` | Citizen-submitted survey data |
| `users` | User profiles with roles |
| `system_logs` | Admin action logs (approve/reject) |

---

## 👨‍💻 Author

**Jeevana Sreekonnipati**  
[GitHub](https://github.com/jeevanasreekonnipati-ops)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
