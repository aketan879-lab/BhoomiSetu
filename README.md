# BhoomiSetu

📱 BhumiSetu Mobile App (भूमिसेतु मोबाइल ऐप)
React NativeExpoTypeScriptFastAPI SyncLicense

📌 Application Overview
BhumiSetu Mobile App is a cross-platform mobile application built using Expo and React Native, designed for Citizen Farmers, Land Owners, and Field Revenue Officers (Patwaris).

The application streamlines land record submissions, OCR document scanning, live ULPIN (Unique Land Parcel Identification Number) QR code verification, and real-time mutation status tracking directly from mobile devices—eliminating physical paperwork and office queues.

✨ Key App Features
📷 1. Smart Camera Document Scanner
Live Optical Framing: Uses camera viewfinders with target boundary lines to capture clear land documents.
Document Support: Scans Khasra, Khatauni, Sale Deed, 7/12 extract, Patta certificates, and RTC forms.
Instant Backend Upload: Direct multipart upload to the FastAPI SmartScan AI engine for field extraction.
🔲 2. Live ULPIN QR Code Reader
Camera QR Scanner: Point the camera at any official BhumiSetu or DILRMP land certificate QR code.
Instant ULPIN Verification: Decodes the 14-digit ULPIN pin (UP-09-4512-8821), verifying owner name, survey/plot number, and blockchain hash.
Fraud Warning System: Rejects invalid or non-land record QR codes with clear security alert banners.
🌐 3. Multi-Lingual Regional Support
Instant one-tap language switching designed for rural usability across India:
🇬🇧 English
🇮🇳 Hindi (हिंदी)
🇮🇳 Tamil (தமிழ்)
🇮🇳 Telugu (తెలుగు)
🇮🇳 Marathi (मराठी)
🔄 4. Real-Time Mutation Tracking
Application Status Dashboard: Track submitted land mutation requests with live status badges:
🕐 Pending Review
🟢 Approved & Solved ✅
🔴 Rejected ❌
Instant Sync: Decision updates made by Revenue Admin Tehsildars on the Web Admin portal sync instantly to the citizen's mobile app.
🛠️ Technical Stack
Framework: Expo SDK (React Native)
Language: TypeScript / JavaScript
Icons: Lucide React Native (lucide-react-native)
Camera Module: expo-camera / React Native CameraView
Network Client: REST API integration with FastAPI (http://localhost:8000/api/v1)
State & Storage: React Hooks & Async Storage
📂 Mobile App Structure


mobile/
├── App.js                   # Main Expo App entry & navigation
├── app.json                 # Expo configuration & camera permissions
├── package.json             # Mobile app dependencies
├── src/
│   ├── components/          # Reusable UI components & badges
│   ├── screens/             # App screens (Home, Camera Scan, QR Reader, Track)
│   ├── services/            # API communication services
│   └── context/             # Multi-lingual context provider
🚀 How to Run the App Locally
Prerequisites
Node.js: v18.x or higher
Expo Go App (on iOS or Android device) OR an Android/iOS Emulator
1. Install Mobile Dependencies
bash


# Navigate to mobile directory
cd mobile
# Install npm packages
npm install
2. Start the Expo Development Server
bash


# Start Expo server in offline/web mode
npx expo start --web
Or run directly for iOS / Android:

bash


# For Android Emulator:
npx expo start --android
# For iOS Simulator (macOS only):
npx expo start --ios
3. Connect to FastAPI Backend
Ensure the FastAPI backend server is running on http://localhost:8000:

bash


# From project root
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
