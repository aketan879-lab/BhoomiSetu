# BhoomiSetu  Web Admin Portal

🌐 BhumiSetu Web Admin Portal (भूमिसेतु वेब एडमिन पोर्टल)
Next.jsReactTailwind CSSLeaflet GISTypeScriptLicense

📌 Portal Overview
The BhumiSetu Web Admin Portal is an web-based administration system engineered for Revenue Admin Officers (Tehsildars & Patwaris).

The portal provides revenue officers with real-time tools to manage district land record databases, review pending mutation applications, audit administrative decision histories, extract document parameters via AI SmartScan OCR, and resolve geospatial boundary overlaps on interactive GIS maps.

✨ Key Portal Modules & Features
📊 1. Streamlined Operational Dashboard (/dashboard)
Operational KPI Cards:
🟠 Current Requests Remained to Attend: Displays pending mutation review count (clicks directly to pending requests queue).
🟢 Approved Requests: Live count of validated land records.
🔵 Total Digitised Records: Synced database total.
Recent Applications Table: Inspect incoming applications with quick officer action controls:
👁️ View Details: Opens comprehensive record inspection page.
✔️ Approve & Solve: Validates mutation and updates citizen app.
✖️ Reject: Rejects application with reason logging.
🏛️ 2. District Land Records Repository (/validation)
Revenue Jurisdiction View: Manages all land records under the admin's jurisdiction (District Lucknow / Tehsil Sadar).
Status Filter Tabs:
⏳ Pending Requests to Attend (/validation?status=PENDING): Pre-filters queue to unresolved requests.
🟢 Approved Records: Validated land titles.
🔴 Rejected Applications: Rejected mutation requests.
📋 All District Land Records: Complete regional database.
📜 Admin Action History: Administrative decision log.
📜 3. Tehsildar Admin Decision Audit History (/validation)
Chronological Decision Timeline: Logs every administrative action performed by revenue officers:
Approval (✔️) & Rejection (✖️) timestamps.
Dispute officer assignments & ground survey resolutions.
SmartScan OCR document parsing history.
Audit Details: Records log ID, date/time, action badge, target record ID, applicant name, action summary, and official identifier (Tehsildar Admin USR-PATWARI-01).
🗺️ 4. GIS Mapping & Boundary Dispute Solver (/disputes)
Interactive Leaflet/PostGIS Map: Real-time visualization of geospatial boundary overlaps, title conflicts, and chain gaps.
Front-Layered Modal Interface: Z-indexed dialogs (z-[99999]) ensure dispute resolution and officer assignment modals open in front of map controls.
⏳ Pending Cases GIS Filter: One-click tab filtering map markers specifically for pending dispute cases across the region.
🔲 5. SmartScan AI OCR & ULPIN QR Portal (/scan)
Document OCR Extractor: Drag & drop zone supporting Khasra, Khatauni, Sale Deed, 7/12, Patta, and RTC document images (JPG, PNG, PDF).
📷 Live Web Camera Scanner: Camera viewfinder with target box alignment for scanning physical land certificate QR codes using jsQR.
Strict QR Validation: Validates 14-digit ULPIN codes (UP-09-4512-8821), displaying warning alerts for invalid or fake QR codes.
⚡ One-Click Test Sample: Built-in test button to verify authentic ULPIN QR code sample data instantly.
🛠️ Technology Stack
Technology	Purpose
Next.js 14 (App Router)	Full-stack React framework with server/client components
TypeScript	Strict type safety across components & data models
Tailwind CSS	Custom responsive UI styling & design system
Leaflet / React-Leaflet	Interactive geospatial GIS mapping engine
jsQR	In-browser client-side QR code pixel decoder
Lucide React	Icons for UI components & status badges
Recharts	Data visualization charts
📂 Web Repository Structure


web/
├── public/                  # Static assets & sample QR codes (valid_land_qr.png)
├── src/
│   ├── app/
│   │   ├── dashboard/       # Dashboard KPI page (page.tsx)
│   │   ├── validation/      # District Land Repository & Admin Audit History (page.tsx)
│   │   ├── disputes/        # GIS Mapping & Dispute Solver (page.tsx)
│   │   ├── scan/            # SmartScan OCR & Live Camera QR Scanner (page.tsx)
│   │   ├── layout.tsx       # Root Layout & Navigation Sidebar
│   │   └── page.tsx         # Portal Landing & Language Selector
│   ├── components/          # Reusable UI components & Leaflet Map (DisputeMap.tsx)
│   ├── context/             # Web Language Context Provider
│   └── lib/                 # Mock data (mockData.ts) & type definitions (types.ts)
├── package.json             # Web dependencies
└── tailwind.config.js       # Tailwind CSS configuration
🚀 How to Run the Web Admin Portal Locally
1. Install Dependencies
bash


# Navigate to web directory
cd web
# Install Node modules
npm install
2. Run the Next.js Development Server
bash


npm run dev
Open your browser and navigate to:

🌐 Web Portal: http://localhost:3000
📊 Dashboard: http://localhost:3000/dashboard
🏛️ Land Records Repository: http://localhost:3000/validation
🗺️ GIS Dispute Solver: http://localhost:3000/disputes
🔲 SmartScan OCR: http://localhost:3000/scan

3. Backend API Connectivity
Ensure the Python FastAPI backend server is running on http://localhost:8000:

bash


python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
