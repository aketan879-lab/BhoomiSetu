# BhoomiSetu  Web Admin Portal
# 🌐 BhumiSetu Web Admin Portal
### भूमिसेतु वेब एडमिन पोर्टल

**Next.js 14 · React · Tailwind CSS · Leaflet · GIS · TypeScript**

---

## 📌 Portal Overview

The **BhumiSetu Web Admin Portal** is a web-based administration system engineered for **Revenue Admin Officers (Tehsildars & Patwaris)**.

The portal provides revenue officers with real-time tools to:

- 🏛️ Manage district land record databases
- 📋 Review pending mutation applications
- 📜 Audit administrative decision histories
- 🤖 Extract document parameters using AI SmartScan OCR
- 🗺️ Resolve geospatial boundary overlaps using interactive GIS maps

---

# ✨ Key Portal Modules & Features

## 📊 1. Streamlined Operational Dashboard

**Route:** `/dashboard`

### 📈 Operational KPI Cards

- 🟠 **Current Requests Remained to Attend**
  - Displays the pending mutation review count.
  - Clicking the card directly opens the pending requests queue.

- 🟢 **Approved Requests**
  - Displays the live count of validated land records.

- 🔵 **Total Digitised Records**
  - Displays the total number of synced database records.

### 📋 Recent Applications Table

Allows officers to inspect incoming applications with quick action controls:

- 👁️ **View Details**
  - Opens the comprehensive record inspection page.

- ✔️ **Approve & Solve**
  - Validates the mutation request.
  - Updates the citizen application.

- ✖️ **Reject**
  - Rejects the application.
  - Records the rejection reason for administrative logging.

---

## 🏛️ 2. District Land Records Repository

**Route:** `/validation`

### 🏢 Revenue Jurisdiction View

Manages all land records under the administrator's jurisdiction:

- **District:** Lucknow
- **Tehsil:** Sadar

### 📑 Status Filter Tabs

- ⏳ **Pending Requests to Attend**
  - Route: `/validation?status=PENDING`
  - Pre-filters the queue to unresolved mutation requests.

- 🟢 **Approved Records**
  - Displays validated land titles.

- 🔴 **Rejected Applications**
  - Displays rejected mutation requests.

- 📋 **All District Land Records**
  - Displays the complete regional land database.

- 📜 **Admin Action History**
  - Displays the administrative decision log.

---

## 📜 3. Tehsildar Admin Decision Audit History

**Route:** `/validation`

### 🕒 Chronological Decision Timeline

Records administrative actions performed by revenue officers, including:

- ✔️ Approval timestamps
- ✖️ Rejection timestamps
- 👮 Dispute officer assignments
- 🏞️ Ground survey resolutions
- 🤖 SmartScan OCR document parsing history

### 🔍 Audit Details

Each administrative action records:

- 🆔 Log ID
- 📅 Date and time
- 🏷️ Action badge
- 🗂️ Target record ID
- 👤 Applicant name
- 📝 Action summary
- 🔐 Official identifier

**Official Identifier:**

`Tehsildar Admin USR-PATWARI-01`

---

## 🗺️ 4. GIS Mapping & Boundary Dispute Solver

**Route:** `/disputes`

### 🗺️ Interactive GIS Map

Uses **Leaflet/PostGIS** to provide real-time visualization of:

- 📍 Geospatial boundary overlaps
- ⚠️ Land title conflicts
- 🔗 Chain gaps
- 🗺️ Regional land boundaries

### 🪟 Front-Layered Modal Interface

Dispute resolution and officer assignment dialogs use a high z-index:

```text
z-[99999]
