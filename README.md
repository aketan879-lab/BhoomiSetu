# BhoomiSetu  Web Admin Portal
# 🏛️ BhumiSetu — Intelligent Land Record Digitization & Validation Platform

> **Problem Statement ID**: IH26018 | **Ministry**: Ministry of Rural Development
> **Theme**: Software | **Category**: Smart India Hackathon

---

## 📋 Overview

**BhumiSetu** (भूमिसेतु — "Bridge to Land") is an AI-powered platform for intelligently digitizing and validating land records across both urban and rural India. It combines advanced OCR, multi-layer validation, regional language AI, offline-first architecture, and military-grade security to solve India's fragmented land record problem.

### Key Problems Solved
- 📜 **Paper records** in 12+ regional scripts → Digital, structured, searchable records
- ❌ **No validation** of accuracy/authenticity → **5-layer intelligent validation pipeline**
- 🗣️ **Language barrier** for farmers → **BhashaAI** voice assistant in 12+ Indian languages
- 📵 **No internet in rural areas** → **Offline-first** with adaptive connectivity sync
- 🔓 **Fraud & tampering** → **Blockchain audit trail** + AES-256 encryption + RBAC
- 🏙️🌾 **Urban ≠ Rural** → **Dual-mode** system with context-aware processing

---

## ✨ Features

### 🔍 SmartScan Engine — Intelligent Digitization
- Multi-script OCR (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu)
- Handwriting recognition for patwari records
- Auto document classification (Khasra, Khatauni, Sale Deed, 7/12, Patta, RTC, Jamabandi)
- State-specific field extraction (UP, MH, TN, WB, KA, RJ)
- Handles damaged, faded, crumpled documents (OpenCV preprocessing)

### ✅ 5-Layer Validation Engine
| Layer | What It Validates |
|---|---|
| **1. Format & Completeness** | All mandatory fields present, valid ranges, state-specific rules |
| **2. Cross-Database** | Matches against Bhulekh, Sub-Registrar, DILRMP records |
| **3. Spatial/GIS** | Area matches GIS measurement, no boundary overlaps, land type correct |
| **4. Chain-of-Title** | Ownership chain complete, no gaps, no circular transfers |
| **5. ML Anomaly Detection** | Rapid transfers, undervalued stamp duty, bulk modifications, benami patterns |

### 🗣️ BhashaAI — Regional Language AI Assistant
- Voice commands in 12 Indian languages
- AI-guided app navigation for illiterate/semi-literate farmers
- Explains validation results in simple regional language
- Auto-fills forms from voice input

### 📴 Offline-First Architecture
- Full functionality without internet
- Adaptive sync: 2G → text only, 3G → compressed, 4G/WiFi → full quality
- CRDT-based conflict resolution
- On-device OCR for offline scanning

### 🔐 Zero-Trust Security
- Aadhaar eKYC + OTP + Biometric authentication
- AES-256-GCM encryption (at rest and in transit)
- Role-Based Access Control (Farmer, Patwari, Tehsildar, District Collector, Admin, Auditor)
- Blockchain-backed immutable audit trail (Hyperledger Fabric)
- OWASP Top 10 protection + intrusion detection + geo-fencing
- DPDP Act 2023 compliance

### 🔗 Government System Integration
DILRMP • Bhulekh • Bhu-Naksha • RERA • Sub-Registrar • Revenue Courts • SVAMITVA • ULPIN

### 🏙️🌾 Urban-Rural Dual Mode
Auto-detects urban/rural context and adapts document types, validation rules, area units, fraud detection patterns, and GIS sources accordingly.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Layer                                │
│          📱 React Native Mobile  |  🌐 Next.js Web Portal        │
├─────────────────────────────────────────────────────────────────┤
│                        AI Layer                                  │
│  🔍 SmartScan (OCR)  |  🗣️ BhashaAI (NLP)  |  🤖 Agent Mode    │
├─────────────────────────────────────────────────────────────────┤
│                      Core Engine                                 │
│  ✅ 5-Layer Validation  |  🔗 Govt APIs  |  ⚖️ Disputes/Mutation │
├─────────────────────────────────────────────────────────────────┤
│                     Backend (FastAPI)                             │
│         ⚡ API Gateway  |  📦 Sync Engine  |  🔐 Security        │
├─────────────────────────────────────────────────────────────────┤
│                       Data Layer                                 │
│   🗄️ PostgreSQL+PostGIS  |  ☁️ MinIO/S3  |  🔗 Hyperledger      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy 2.0, Celery |
| **Database** | PostgreSQL 15 + PostGIS |
| **Cache/Queue** | Redis 7 |
| **Object Storage** | MinIO (S3-compatible) |
| **OCR** | PaddleOCR (multi-script) |
| **NLP** | IndicWhisper, IndicBERT, IndicTTS (AI4Bharat) |
| **Security** | AES-256-GCM, JWT, RBAC, Blockchain Audit |
| **Blockchain** | Hyperledger Fabric |
| **Containerization** | Docker, Docker Compose |
| **Mobile** | React Native (offline-first) |
| **Web** | Next.js 14 |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+ (for frontend)

### 1. Clone & Configure
```bash
git clone <repo-url>
cd bhumi-setu
cp backend/.env.example backend/.env
# Edit .env with your configuration
```

### 2. Start Infrastructure (Database, Redis, MinIO)
```bash
docker-compose up -d postgres redis minio
```

### 3. Run Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access API Documentation
Open [http://localhost:8000/docs](http://localhost:8000/docs) for interactive Swagger UI.

---

## 📁 Project Structure

```
bhumi-setu/
├── backend/
│   ├── main.py                          # FastAPI app entry point
│   ├── config/                          # Settings & database config
│   ├── models/                          # SQLAlchemy + Pydantic models
│   ├── api/                             # REST API routes
│   │   ├── records.py                   # Land record CRUD
│   │   ├── scan.py                      # Document scanning endpoints
│   │   ├── validate.py                  # Validation pipeline endpoints
│   │   ├── disputes.py                  # Dispute management
│   │   ├── auth.py                      # Authentication
│   │   └── sync.py                      # Offline sync
│   ├── services/
│   │   ├── smartscan/                   # 🔍 OCR & digitization
│   │   ├── validation/                  # ✅ 5-layer validation engine
│   │   ├── govt_integration/            # 🔗 Government API connectors
│   │   ├── urban_rural/                 # 🏙️🌾 Dual-mode adapter
│   │   ├── disputes/                    # ⚖️ Dispute detection & workflow
│   │   ├── bhasha_ai/                   # 🗣️ Regional language AI
│   │   └── sync/                        # 📦 Offline sync server
│   └── security/                        # 🔐 Auth, encryption, audit
├── mobile/                              # React Native app (TODO)
├── web/                                 # Next.js admin portal (TODO)
├── blockchain/                          # Hyperledger chaincode (TODO)
├── docker-compose.yml
└── README.md
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/scan/upload` | Upload & digitize document |
| `POST` | `/api/v1/validate/{id}` | Run 5-layer validation |
| `GET` | `/api/v1/records/` | List land records |
| `GET` | `/api/v1/records/{id}` | Get record details |
| `GET` | `/api/v1/validate/report/{id}` | Get validation report |
| `GET` | `/api/v1/disputes/` | List disputes |
| `POST` | `/api/v1/auth/login` | Authenticate |
| `POST` | `/api/v1/sync/push` | Push offline changes |

---

## 🧪 Testing

```bash
cd backend
pytest tests/ -v
```

---

## 👥 Team

| Name | Role |
|---|---|
| *Your Name* | Team Lead & Full Stack Developer |
| — | — |

---

## 📄 License

This project is built for the Smart India Hackathon 2026 (Problem Statement IH26018).
