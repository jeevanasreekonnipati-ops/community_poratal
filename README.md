# 🏛️ Sachivalayam & Community Resource Portal (CRP)

An intelligent, multi-tier civic management platform connecting **Citizens**, **Village Secretaries (Admins)**, **MRO / Optimizers**, and **State Higher Authorities** with real-time mapping, governance tracking, and grievance redressal.

---

## 🌟 Key Features

### 1. 🌍 Citizen Dashboard
- **📍 Live Geospatial Map:** Interactive Leaflet / OpenStreetMap interface displaying all approved community amenities (Schools, Hospitals, Water, Sanitation, Transport, Parks).
- **📝 Real-Time Resource Surveying:** Report infrastructure needs with auto-detected GPS coordinates or pin-on-map selection.
- **🏛️ Elected Officials Mapping:** Dynamic lookup of representatives (Prime Minister, Chief Minister, Member of Parliament [MP], Member of Legislative Assembly [MLA]) auto-detected from user's current GPS location via reverse-geocoding.
- **📜 Government Support Schemes:** Searchable, categorized catalogue of major central & state welfare schemes (PM Awas Yojana, Jal Jeevan Mission, PM Surya Ghar, Ayushman Bharat, etc.) with eligibility criteria and direct application links.

### 2. 🛡️ Secretary (Admin) Dashboard
- **⏳ Real-Time Moderation:** Instant live stream of incoming citizen surveys from Firebase Firestore with one-click **Approve** / **Reject** workflows.
- **👥 User Role Management:** Live administrative panel to promote/assign roles (`citizen`, `admin`, `optimizer`, `authority`) to registered users.
- **📄 Report Generation (PDF):** One-click generation and download of formatted governance status reports using `jsPDF` and `jspdf-autotable`.
- **📊 CSV Export:** Direct export of verified location and infrastructure datasets for offline analysis and auditing.
- **📋 Real-Time Audit Logs:** Complete traceability with timestamped system logs for every administrative decision.

### 3. 🔭 Optimizer (MRO) Dashboard
- **📊 Village-Level Analytics:** Aggregated statistics of reported vs. resolved infrastructure needs across mandals and districts.
- **⚡ Resource Balancing:** Identification of high-stress zones and automated resource allocation recommendations.

### 4. 🏛️ Higher Authority Dashboard
- **📈 State Supervision:** Macro-level monitoring of statewide schemes, budget allocations, and performance metrics across departments.

---

## 🛠️ Technology Stack

- **Frontend & Routing:** [Next.js 16 (Turbopack)](https://nextjs.org/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database:** [Firebase Firestore](https://firebase.google.com/) (Real-time NoSQL Data) + [Firebase Authentication](https://firebase.google.com/products/auth)
- **Mapping & Geolocation:** [React-Leaflet](https://react-leaflet.js.org/) + [OpenStreetMap](https://www.openstreetmap.org/) + [Nominatim Reverse Geocoding API](https://nominatim.org/)
- **Reporting & Exporting:** [jsPDF](https://github.com/parallax/jsPDF) + [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **UI / UX:** Clean GeeksForGeeks-inspired light interface, responsive navigation sidebar, floating India Map watermark, and custom CSS variables.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn
- A Firebase project with Firestore and Auth enabled

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jeevanasreekonnipati-ops/community_poratal.git
   cd community_poratal
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── auth/                 # Sign In / Registration with Firebase Auth
│   │   ├── dashboards/
│   │   │   ├── layout.tsx        # Persistent GFG-style Sidebar Layout
│   │   │   ├── admin/            # Moderation, Roles, PDF/CSV Exports, Logs
│   │   │   ├── authority/        # State-level governance & scheme overview
│   │   │   ├── citizen/          # Survey submission, Live Map, Officials & Schemes
│   │   │   └── optimizer/        # Resource distribution & village analytics
│   │   ├── globals.css           # Design tokens, theme variables, reset
│   │   ├── layout.tsx            # Root Navbar, Watermark & Theme controls
│   │   └── page.tsx              # Landing Page with pastel feature cards
│   ├── components/
│   │   ├── GovtSupportPanel.tsx  # Central & State welfare schemes explorer
│   │   ├── Map.tsx               # Leaflet map container with custom pins & GPS
│   │   ├── RepresentativesPanel.tsx # Geolocation-based MP/MLA/CM/PM lookup
│   │   └── ThemeControls.tsx     # Color switcher & constant India Map watermark
│   └── lib/
│       ├── firebase.ts           # Firebase App, Auth & Firestore initialization
│       ├── representatives.ts    # AP Lok Sabha & Assembly constituency mappings
│       └── useResources.ts       # Real-time Firestore hooks for resource CRUD
├── public/                       # Static assets & icons
├── package.json
└── README.md
```

---

## 🔒 Security & Privacy

- Client coordinates are processed strictly via standard client-side browser geolocation and OpenStreetMap Nominatim for public constituency lookup.
- Firebase credentials are encapsulated via environment configurations.

---

## 📜 License

This project is developed for civic governance and community empowerment.
