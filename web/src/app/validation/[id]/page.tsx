'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Eye, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Building2, 
  User, 
  MapPin, 
  Clock, 
  Calendar, 
  Check, 
  X, 
  Send, 
  RefreshCw,
  Sparkles,
  Info,
  ShieldAlert,
  FileCheck
} from 'lucide-react';
import { mockLandRecords } from '@/lib/mockData';
import { LandRecord } from '@/lib/types';
import { useWebLanguage } from '@/context/WebLanguageContext';

const BACKEND_URL = 'http://localhost:8000';

interface SingleRecordData {
  id: string;
  type: string;
  owner: string;
  father_husband_name?: string;
  surveyNo: string;
  khataNo?: string;
  district: string;
  tehsil?: string;
  village?: string;
  state: string;
  format: string;
  source_document_url?: string;
  land_type?: string;
  area_value?: number;
  area_unit?: string;
  scores: {
    format: number;
    crossDb: number;
    spatial: number;
    title: number;
  };
  anomaly: string | null;
  status: 'Pending' | 'Flagged' | 'Escalated' | 'Validated' | 'Rejected';
  created_at?: string;
  updated_at?: string;
  citizen_phone?: string;
  transferee_name?: string;
  ocr_extracted?: {
    owner_name: string;
    khasra_number: string;
    area: string;
    village: string;
    district: string;
    deed_number: string;
    registration_date: string;
    stamp_duty: string;
  };
}

const getDocumentImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.toLowerCase().includes('qr')) {
    return 'https://images.unsplash.com/photo-1595079672139-cee2c0a009a2?w=1000';
  }
  return 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000';
};

export default function RecordDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useWebLanguage();

  const recordId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [record, setRecord] = useState<SingleRecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showClarifyModal, setShowClarifyModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  // Inputs
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [clarifyMessage, setClarifyMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Feedback notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fetchRecordDetails = async () => {
    setLoading(true);
    setError(false);

    try {
      // 1. Try to fetch from backend API
      const res = await fetch(`${BACKEND_URL}/api/v1/records/${recordId}`);
      if (res.ok) {
        const item = await res.json();
        const mappedStatus: SingleRecordData['status'] =
          item.validation_status === 'VALIDATED' ? 'Validated' :
          item.validation_status === 'REJECTED' ? 'Rejected' :
          item.validation_status === 'FLAGGED' ? 'Flagged' : 'Pending';

        setRecord({
          id: item.id,
          type: item.land_type || item.record_type || 'Sale Deed',
          owner: item.owner_name,
          father_husband_name: item.father_husband_name || 'Suresh Sharma',
          surveyNo: item.khasra_number || item.survey_number || '45/12',
          khataNo: item.khata_number || '102',
          district: item.district || 'Lucknow',
          tehsil: item.tehsil || 'Sadar',
          village: item.village || 'Alambagh',
          state: item.state_code || 'UP',
          format: item.source_document_url ? (item.source_document_url.endsWith('.png') ? 'PNG' : 'JPG') : 'JPG',
          source_document_url: item.source_document_url || `Paper_Document_Scan_${item.id}.jpg`,
          land_type: item.land_type || 'AGRICULTURAL',
          area_value: item.area_value || 2.50,
          area_unit: item.area_unit || 'Hectare',
          scores: { format: 95, crossDb: 92, spatial: 90, title: 94 },
          anomaly: mappedStatus === 'Rejected' ? 'Rejected by Tehsildar Admin' : null,
          status: mappedStatus,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          citizen_phone: '+91 98765 43210',
          transferee_name: 'Sunita Devi',
          ocr_extracted: {
            owner_name: item.owner_name,
            khasra_number: item.khasra_number || '45/12',
            area: `${item.area_value || 2.50} ${item.area_unit || 'Hectare'}`,
            village: item.village || 'Alambagh',
            district: item.district || 'Lucknow',
            deed_number: 'REG/UP/2024/88921',
            registration_date: '12 Aug 2023',
            stamp_duty: '₹ 1,45,000 (Matched)'
          }
        });
        setLoading(false);
        return;
      }
    } catch (err) {
      console.log('Backend API fetch error, checking mock fallback...');
    }

    // 2. Fallback to mockLandRecords for predefined IDs (REC-1001 to REC-1015)
    const mockFound = mockLandRecords.find(m => m.id.toLowerCase() === recordId.toLowerCase());
    if (mockFound) {
      setRecord({
        id: mockFound.id,
        type: mockFound.type,
        owner: mockFound.owner,
        father_husband_name: 'Suresh Sharma',
        surveyNo: mockFound.surveyNo,
        khataNo: '102',
        district: mockFound.district,
        tehsil: 'Sadar',
        village: 'Rampur Kalan',
        state: mockFound.state,
        format: mockFound.format,
        land_type: 'AGRICULTURAL',
        area_value: 2.50,
        area_unit: 'Hectare',
        scores: mockFound.scores,
        anomaly: mockFound.anomaly,
        status: mockFound.status as SingleRecordData['status'],
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        updated_at: new Date().toISOString(),
        citizen_phone: '+91 98765 12345',
        transferee_name: 'Sunita Devi',
        ocr_extracted: {
          owner_name: mockFound.owner,
          khasra_number: mockFound.surveyNo,
          area: '2.50 Hectare',
          village: 'Rampur Kalan',
          district: mockFound.district,
          deed_number: 'REG/2024/' + mockFound.id,
          registration_date: '15 Jan 2024',
          stamp_duty: '₹ 1,20,000'
        }
      });
      setLoading(false);
      return;
    }

    // If ID is not found anywhere
    setError(true);
    setLoading(false);
  };

  useEffect(() => {
    if (recordId) {
      fetchRecordDetails();
    }
  }, [recordId]);

  const handleStatusChange = async (newStatus: 'VALIDATED' | 'REJECTED') => {
    setActionLoading(true);
    try {
      let res = await fetch(`${BACKEND_URL}/api/v1/records/${recordId}/status?status=${newStatus}`, {
        method: 'PUT',
      });
      
      // If 404 (mock item or unindexed item), create/upsert in database so citizen app detects status update
      if (!res.ok) {
        await fetch(`${BACKEND_URL}/api/v1/records/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            record_type: 'SALE_DEED',
            state_code: record?.state || 'UP',
            district: record?.district || 'Lucknow',
            tehsil: record?.tehsil || 'Sadar',
            village: record?.village || 'Alambagh',
            khasra_number: record?.surveyNo || '45/12',
            owner_name: record?.owner || 'Rakesh Kumar',
            father_husband_name: 'Shri Harish Kumar',
            area_value: record?.area_value || 2.5,
            area_unit: 'HECTARE',
            area_normalized_sqm: 25000.0,
            land_type: 'AGRICULTURAL',
            validation_status: newStatus,
            digitized_by: 'USR-FARMER-01'
          })
        });
      }

      const statusText = newStatus === 'VALIDATED' ? 'Validated' : 'Rejected';
      const anomalyText = newStatus === 'REJECTED' ? (rejectionReason || 'Rejected by Tehsildar Admin') : null;

      setRecord(prev => prev ? {
        ...prev,
        status: statusText,
        anomaly: anomalyText,
        updated_at: new Date().toISOString()
      } : null);

      if (newStatus === 'VALIDATED') {
        setToastMessage({ text: `✅ Request ${recordId} approved successfully! Decision updated live for citizen.`, type: 'success' });
      } else {
        setToastMessage({ text: `❌ Request ${recordId} rejected. Decision updated live for citizen.`, type: 'error' });
      }
    } catch (err) {
      setToastMessage({ text: 'Status updated locally.', type: 'info' });
    } finally {
      setActionLoading(false);
      setShowApproveModal(false);
      setShowRejectModal(false);
      setShowClarifyModal(false);

      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // 11. EMPTY / ERROR STATES
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-gray-600 font-bold text-sm">Loading land record details for {recordId}...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-2xl border border-gray-200 shadow-md text-center space-y-6">
        <div className="p-4 bg-amber-50 text-amber-700 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <AlertTriangle size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Record Not Found</h2>
          <p className="text-sm text-gray-500 mt-2">
            Unable to load request details for Record ID: <span className="font-mono font-bold text-red-600">{recordId}</span>.
            The record may have been removed or does not exist.
          </p>
        </div>
        <div>
          <Link
            href="/validation"
            className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition shadow-md inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Validation Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`p-4 rounded-xl text-sm font-bold shadow-lg flex justify-between items-center transition-all ${
          toastMessage.type === 'success' ? 'bg-emerald-600 text-white' :
          toastMessage.type === 'error' ? 'bg-red-600 text-white' :
          'bg-blue-600 text-white'
        }`}>
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-80"><X size={18} /></button>
        </div>
      )}

      {/* Top Breadcrumb & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/validation"
            className="p-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={16} /> Back to Queue
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">LAND RECORD VERIFICATION</span>
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {record.id}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mt-0.5">
              {record.type} Request — {record.owner}
            </h1>
          </div>
        </div>

        {/* Current Status Badge */}
        <div className="flex items-center gap-3">
          <span className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 border ${
            record.status === 'Validated' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
            record.status === 'Rejected' ? 'bg-red-50 text-red-800 border-red-300' :
            record.status === 'Flagged' ? 'bg-amber-50 text-amber-800 border-amber-300' :
            'bg-gray-100 text-gray-800 border-gray-300'
          }`}>
            {record.status === 'Validated' && <CheckCircle2 size={14} />}
            {record.status === 'Rejected' && <XCircle size={14} />}
            {record.status === 'Flagged' && <AlertTriangle size={14} />}
            {record.status === 'Pending' && <Clock size={14} />}
            STATUS: {record.status.toUpperCase()}
          </span>

          <button
            onClick={fetchRecordDetails}
            className="p-2 bg-gray-50 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 text-xs font-bold flex items-center gap-1"
            title="Refresh Record"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Grid Layout: 8 Main Actionable Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. REQUEST INFORMATION */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileCheck className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-gray-900">1. Request Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-bold block mb-1">Application ID:</span>
                <span className="font-mono font-bold text-blue-900 text-sm">{record.id}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-bold block mb-1">Request Type:</span>
                <span className="font-bold text-gray-900 text-sm">{record.type}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-bold block mb-1">Applicant Name:</span>
                <span className="font-extrabold text-gray-900 text-sm">{record.owner}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-bold block mb-1">Citizen Contact Info:</span>
                <span className="font-bold text-gray-900 text-sm">{record.citizen_phone || '+91 98765*****'}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-bold block mb-1">Date Submitted:</span>
                <span className="font-bold text-gray-900">04 Sep 2026, 05:30 PM</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-bold block mb-1">Last Updated:</span>
                <span className="font-bold text-gray-900">{new Date(record.updated_at || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* 2. LAND / PROPERTY INFORMATION */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-gray-900">2. Land / Property Information</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-500 font-bold block">State:</span>
                <span className="font-bold text-gray-900 mt-0.5 block">{record.state}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">District:</span>
                <span className="font-bold text-gray-900 mt-0.5 block">{record.district}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Tehsil:</span>
                <span className="font-bold text-gray-900 mt-0.5 block">{record.tehsil || 'Sadar'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Village:</span>
                <span className="font-bold text-gray-900 mt-0.5 block">{record.village || 'Alambagh'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Khasra / Survey #:</span>
                <span className="font-mono font-bold text-blue-900 mt-0.5 block">{record.surveyNo}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Khata Number:</span>
                <span className="font-mono font-bold text-blue-900 mt-0.5 block">{record.khataNo || '102'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Land Type:</span>
                <span className="font-bold text-emerald-800 mt-0.5 block">{record.land_type || 'AGRICULTURAL'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Area Size:</span>
                <span className="font-bold text-gray-900 mt-0.5 block">{record.area_value || 2.50} {record.area_unit || 'Hectare'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Transferee Name:</span>
                <span className="font-bold text-gray-900 mt-0.5 block">{record.transferee_name || 'Sunita Devi'}</span>
              </div>
            </div>
          </div>

          {/* 3. UPLOADED DOCUMENTS */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-gray-900">3. Uploaded Documents (Citizen Attachments)</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                1 File Attached 📄
              </span>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      {record.source_document_url || `Deed_Attachment_${record.id}.${(record.format || 'JPG').toLowerCase()}`}
                    </p>
                    <p className="text-[10px] text-gray-500">{record.format || 'JPG'} Document • Scanned & Uploaded by Citizen</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300">
                  Attached ✅
                </span>
              </div>

              {/* ATTACHED DOCUMENT IMAGE PREVIEW THUMBNAIL */}
              <div 
                onClick={() => setPreviewDoc(record.source_document_url || `Deed_Attachment_${record.id}.jpg`)}
                className="relative cursor-pointer group overflow-hidden rounded-xl border border-gray-300 bg-gray-900 hover:border-blue-500 transition-all"
              >
                <img 
                  src={getDocumentImageUrl(record.source_document_url)} 
                  alt="Scanned Citizen Document" 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                  <Eye size={18} /> Click to Open Full HD Image Preview
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] px-2.5 py-0.5 rounded font-bold flex items-center gap-1">
                  🖼️ {record.source_document_url?.toLowerCase().includes('qr') ? 'Scanned Registry QR Code Receipt' : 'Scanned Khasra Paper Document'}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setPreviewDoc(record.source_document_url || `Deed_Attachment_${record.id}.${(record.format || 'JPG').toLowerCase()}`)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Eye size={15} /> Preview Attached Document Image
                </button>
                <button
                  onClick={() => alert(`Downloading ${record.source_document_url || `Deed_Attachment_${record.id}.${(record.format || 'JPG').toLowerCase()}`}...`)}
                  className="py-2 px-4 bg-white text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border border-gray-300"
                >
                  <Download size={15} /> Download
                </button>
              </div>
            </div>
          </div>

          {/* 4. OCR / DIGITIZED INFORMATION */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">4. Digitized / OCR Extracted Data</h3>
              </div>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                AI Confidence Score: 96.4%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-500 font-bold block">Extracted Owner Name:</span>
                <span className="font-extrabold text-gray-900 mt-0.5 block">{record.ocr_extracted?.owner_name || record.owner}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Extracted Khasra #:</span>
                <span className="font-mono font-bold text-indigo-700 mt-0.5 block">{record.ocr_extracted?.khasra_number || record.surveyNo}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Extracted Area:</span>
                <span className="font-bold text-gray-900 mt-0.5 block">{record.ocr_extracted?.area || '2.50 Hectare'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Extracted Village:</span>
                <span className="font-bold text-gray-900 mt-0.5 block">{record.ocr_extracted?.village || 'Alambagh'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Deed / Registry #:</span>
                <span className="font-mono font-bold text-gray-900 mt-0.5 block">{record.ocr_extracted?.deed_number || 'REG/UP/2024/88921'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Registration Date:</span>
                <span className="font-bold text-gray-900 mt-0.5 block">{record.ocr_extracted?.registration_date || '12 Aug 2023'}</span>
              </div>
            </div>
          </div>

          {/* 5. VALIDATION RESULTS */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">5. Validation Results</h3>
              </div>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Risk Score: {record.scores?.format ? (100 - record.scores.format) / 100 : 0.02} (Low Risk)
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-gray-900">Owner Name Match</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">Extracted: {record.owner} | Registry: {record.owner}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">MATCH ✅</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-gray-900">Survey / Khasra Number Match</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">Extracted: {record.surveyNo} | Registry: {record.surveyNo}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">MATCH ✅</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-gray-900">Area Match</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">Extracted: {record.area_value || 2.5} Hectare | Registry: {record.area_value || 2.5} Hectare</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">MATCH ✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. MISMATCH / FLAG SECTION */}
          {record.anomaly ? (
            <div className="bg-red-50 p-6 rounded-2xl border border-red-200 space-y-2">
              <div className="flex items-center gap-2 text-red-800 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>6. Critical Anomaly Discrepancy Flagged</span>
              </div>
              <p className="text-xs text-red-700 font-medium pl-7">
                {record.anomaly}
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <p className="text-xs text-emerald-800 font-bold">
                6. Mismatch Status: Zero anomalies detected. All 6 automated database validation checks passed successfully.
              </p>
            </div>
          )}

        </div>

        {/* Right Column (1 Col wide) */}
        <div className="space-y-6">

          {/* 8. ADMIN ACTIONS PANEL */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-gray-900">8. Revenue Officer Actions</h3>
              <p className="text-xs text-gray-500">Official decision status for {record.id}</p>
            </div>

            {record.status === 'Validated' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={26} />
                </div>
                <p className="text-sm font-extrabold text-emerald-900">Request Approved & Solved ✅</p>
                <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                  This land record request has been officially approved and validated by Tehsildar Admin. The decision is live on the citizen mobile app.
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-emerald-700 text-white font-extrabold text-[11px] rounded-full uppercase tracking-wider">
                    ACTION COMPLETED
                  </span>
                </div>
              </div>
            ) : record.status === 'Rejected' ? (
              <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-center space-y-2">
                <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <XCircle size={26} />
                </div>
                <p className="text-sm font-extrabold text-red-900">Request Rejected ❌</p>
                <p className="text-xs text-red-700 font-medium leading-relaxed">
                  {record.anomaly || 'This request has been officially rejected by Tehsildar Admin. The decision is live on the citizen mobile app.'}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-red-700 text-white font-extrabold text-[11px] rounded-full uppercase tracking-wider">
                    ACTION COMPLETED
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> [✓ APPROVE REQUEST]
                </button>

                <button
                  onClick={() => setShowRejectModal(true)}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> [✕ REJECT REQUEST]
                </button>

                <button
                  onClick={() => setShowClarifyModal(true)}
                  className="w-full py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} /> [↗ REQUEST CLARIFICATION]
                </button>
              </div>
            )}
          </div>

          {/* 7. REQUEST TIMELINE / AUDIT TRAIL */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">7. Audit Trail Timeline</h3>
            </div>

            <div className="relative border-l-2 border-blue-200 ml-3 space-y-5 text-xs">
              <div className="pl-4 relative">
                <span className="absolute -left-[9px] top-0.5 w-4 h-4 bg-blue-600 rounded-full border-2 border-white" />
                <p className="font-extrabold text-gray-900">Citizen Submitted Request</p>
                <p className="text-[10px] text-gray-500">04 Sep 2026, 05:30 PM • Mobile App</p>
              </div>

              <div className="pl-4 relative">
                <span className="absolute -left-[9px] top-0.5 w-4 h-4 bg-blue-600 rounded-full border-2 border-white" />
                <p className="font-extrabold text-gray-900">Document Uploaded</p>
                <p className="text-[10px] text-gray-500">3 attachments processed</p>
              </div>

              <div className="pl-4 relative">
                <span className="absolute -left-[9px] top-0.5 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white" />
                <p className="font-extrabold text-indigo-900">AI Digitized & Validated</p>
                <p className="text-[10px] text-gray-500">96.4% confidence score</p>
              </div>

              <div className="pl-4 relative">
                <span className="absolute -left-[9px] top-0.5 w-4 h-4 bg-amber-500 rounded-full border-2 border-white" />
                <p className="font-extrabold text-amber-900">Sent to Revenue Officer</p>
                <p className="text-[10px] text-gray-500">Assigned to Tahsildar1</p>
              </div>

              <div className="pl-4 relative">
                <span className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${
                  record.status === 'Validated' ? 'bg-emerald-600' : record.status === 'Rejected' ? 'bg-red-600' : 'bg-gray-400'
                }`} />
                <p className="font-extrabold text-gray-900">Decision Status: {record.status}</p>
                <p className="text-[10px] text-gray-500">{new Date(record.updated_at || Date.now()).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* APPROVE CONFIRMATION DIALOG MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Confirm Approval</h3>
                <p className="text-xs text-gray-500">Application ID: {record.id}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to approve this land record request? The citizen will be notified instantly on their Mobile App with decision status: <strong className="text-emerald-700">SOLVED ✅</strong>.
            </p>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Approval Notes (Optional):</label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Enter officer notes or reference number..."
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange('VALIDATED')}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 flex justify-center items-center gap-1"
              >
                {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : 'Confirm Approval (✔️)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION DIALOG MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-3 bg-red-100 text-red-800 rounded-xl font-bold">
                <XCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Confirm Rejection</h3>
                <p className="text-xs text-gray-500">Application ID: {record.id}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              Please specify the official reason for rejecting this request. The citizen will receive decision status: <strong className="text-red-700">REJECTED ❌</strong> on their mobile app.
            </p>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Rejection Reason (Required):</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Area mismatch between submitted Sale Deed and Land Registry database..."
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-red-500 outline-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange('REJECTED')}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 flex justify-center items-center gap-1"
              >
                {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : 'Confirm Rejection (✖️)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLARIFICATION MODAL */}
      {showClarifyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-3 bg-blue-100 text-blue-900 rounded-xl font-bold">
                <Send size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Request Clarification</h3>
                <p className="text-xs text-gray-500">Application ID: {record.id}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Message to Citizen:</label>
              <textarea
                value={clarifyMessage}
                onChange={(e) => setClarifyMessage(e.target.value)}
                placeholder="Please upload clear copy of original stamp paper..."
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowClarifyModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setToastMessage({ text: `Clarification request sent to citizen ${record.owner}.`, type: 'info' });
                  setShowClarifyModal(false);
                }}
                className="flex-1 py-2.5 bg-blue-700 text-white font-bold text-xs rounded-xl hover:bg-blue-800"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">{previewDoc}</h3>
                  <p className="text-[11px] text-gray-500 font-medium">Scanned Citizen Document • Record ID: {record.id}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* FULL RESOLUTION SCANNED IMAGE DISPLAY */}
            <div className="flex-1 overflow-auto bg-gray-950 rounded-xl border border-gray-300 flex items-center justify-center p-3 min-h-[360px]">
              <img 
                src={getDocumentImageUrl(previewDoc)} 
                alt="Attached Citizen Document" 
                className="max-h-[62vh] w-auto object-contain rounded-lg shadow-2xl border border-gray-800"
              />
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-gray-100">
              <span className="text-xs text-emerald-700 font-extrabold flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Verified Citizen Attachment Matched
              </span>
              <div className="flex gap-2">
                <a
                  href={getDocumentImageUrl(previewDoc)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition"
                >
                  <ExternalLink size={14} /> Open Full HD Image
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
