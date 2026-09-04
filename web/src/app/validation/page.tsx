'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Check, 
  X, 
  Eye, 
  FileText, 
  Link as LinkIcon, 
  Download, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  History, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  MapPin, 
  Sparkles,
  Building2
} from 'lucide-react';
import { mockLandRecords } from '@/lib/mockData';
import ValidationBadge from '@/components/ValidationBadge';
import { LandRecord } from '@/lib/types';

const BACKEND_URL = 'http://localhost:8000';

interface AdminHistoryLog {
  id: string;
  timestamp: string;
  actionType: 'APPROVED' | 'REJECTED' | 'ASSIGNED' | 'DISPUTE_RESOLVED' | 'SMARTSCAN_OCR';
  recordId: string;
  ownerName: string;
  details: string;
  officialName: string;
}

export default function ValidationQueuePage() {
  const [records, setRecords] = useState<LandRecord[]>(mockLandRecords);
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Admin Decision History Log State
  const [adminHistory, setAdminHistory] = useState<AdminHistoryLog[]>([
    {
      id: 'HIST-101',
      timestamp: '2026-09-05 01:25 PM',
      actionType: 'APPROVED',
      recordId: 'LR-UP-001',
      ownerName: 'Ramesh Kumar',
      details: 'Approved land mutation application for Khasra #45/12 (Lucknow, UP). Title validated across DB.',
      officialName: 'Tehsildar Admin (USR-PATWARI-01)'
    },
    {
      id: 'HIST-102',
      timestamp: '2026-09-05 01:10 PM',
      actionType: 'SMARTSCAN_OCR',
      recordId: 'LR-SCAN-88F4A2',
      ownerName: 'Sunita Devi',
      details: 'SmartScan OCR document parsed for Sale Deed #MH-112. ULPIN UP-09-4512-8821 verified.',
      officialName: 'Tehsildar Admin (USR-PATWARI-01)'
    },
    {
      id: 'HIST-103',
      timestamp: '2026-09-05 12:45 PM',
      actionType: 'DISPUTE_RESOLVED',
      recordId: 'D-1237',
      ownerName: 'Priya Sharma vs Rahul Gupta',
      details: 'Resolved boundary overlap dispute D-1237 after PostGIS ground survey clearance.',
      officialName: 'Tehsildar Admin (USR-PATWARI-01)'
    },
    {
      id: 'HIST-104',
      timestamp: '2026-09-05 11:30 AM',
      actionType: 'ASSIGNED',
      recordId: 'D-1235',
      ownerName: 'Sunita Devi vs Anil Kumar',
      details: 'Assigned dispute D-1235 to Tahsildar Mohanlalganj for ground hearing.',
      officialName: 'Tehsildar Admin (USR-PATWARI-01)'
    },
    {
      id: 'HIST-105',
      timestamp: '2026-09-05 10:15 AM',
      actionType: 'REJECTED',
      recordId: 'REC-1002',
      ownerName: 'Sunita Devi',
      details: 'Rejected mutation request REC-1002 due to area mismatch anomaly (65% spatial score).',
      officialName: 'Tehsildar Admin (USR-PATWARI-01)'
    }
  ]);

  const fetchLiveBackendRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/records/`);
      if (res.ok) {
        const liveItems = await res.json();
        const liveMapped: LandRecord[] = liveItems.map((item: any) => ({
          id: item.id,
          type: item.land_type || 'Sale Deed',
          owner: item.owner_name,
          surveyNo: item.khasra_number || item.khata_number || 'N/A',
          district: item.district || 'Lucknow',
          state: item.state_code || 'UP',
          format: 'PDF',
          scores: { format: 95, crossDb: 90, spatial: 92, title: 90 },
          anomaly: item.validation_status === 'REJECTED' ? 'Rejected by Admin' : null,
          status: item.validation_status === 'VALIDATED' ? 'Validated' : item.validation_status === 'REJECTED' ? 'Rejected' : 'Pending'
        }));

        const liveIds = new Set(liveMapped.map((r: LandRecord) => r.id));
        const filteredMock = mockLandRecords.filter(m => !liveIds.has(m.id));
        setRecords([...liveMapped, ...filteredMock]);
      }
    } catch (err) {
      console.error('Failed to fetch live records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Read status URL parameter e.g. /validation?status=PENDING
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get('status');
      if (statusParam) {
        setStatusFilter(statusParam.toUpperCase());
      }
    }
    fetchLiveBackendRecords();
  }, []);

  const handleUpdateStatus = async (recordId: string, newStatus: 'VALIDATED' | 'REJECTED') => {
    const nextStatusText = newStatus === 'VALIDATED' ? 'Validated' : 'Rejected';
    const targetRecord = records.find(r => r.id === recordId);

    setRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, status: nextStatusText, anomaly: newStatus === 'REJECTED' ? 'Rejected by Admin' : r.anomaly } : r))
    );

    // Append to Admin Audit History
    if (targetRecord) {
      const newLog: AdminHistoryLog = {
        id: `HIST-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        actionType: newStatus === 'VALIDATED' ? 'APPROVED' : 'REJECTED',
        recordId: targetRecord.id,
        ownerName: targetRecord.owner,
        details: `${newStatus === 'VALIDATED' ? 'Approved & Validated' : 'Rejected'} mutation application for ${targetRecord.owner} (Khasra #${targetRecord.surveyNo}, ${targetRecord.district}).`,
        officialName: 'Tehsildar Admin (USR-PATWARI-01)'
      };
      setAdminHistory(prev => [newLog, ...prev]);
    }

    try {
      let res = await fetch(`${BACKEND_URL}/api/v1/records/${recordId}/status?status=${newStatus}`, {
        method: 'PUT',
      });
      if (!res.ok) {
        // Upsert record to backend DB
        await fetch(`${BACKEND_URL}/api/v1/records/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            record_type: 'SALE_DEED',
            state_code: 'UP',
            district: 'Lucknow',
            tehsil: 'Sadar',
            village: 'Alambagh',
            khasra_number: '45/12',
            owner_name: 'Rakesh Kumar',
            father_husband_name: 'Shri Harish Kumar',
            area_value: 2.5,
            area_unit: 'HECTARE',
            area_normalized_sqm: 25000.0,
            land_type: 'AGRICULTURAL',
            validation_status: newStatus,
            digitized_by: 'USR-FARMER-01'
          })
        });
      }
      fetchLiveBackendRecords();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Filtered Records
  const filteredRecords = records.filter(r => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      r.id.toLowerCase().includes(q) ||
      r.owner.toLowerCase().includes(q) ||
      r.surveyNo.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q);

    const s = statusFilter.toUpperCase();
    const matchesStatus = s === 'ALL' || s === 'HISTORY' ||
      (s === 'PENDING' && (r.status === 'Pending')) ||
      (s === 'VALIDATED' && (r.status === 'Validated')) ||
      (s === 'REJECTED' && (r.status === 'Rejected' || r.status === 'Escalated')) ||
      (s === 'FLAGGED' && (r.status === 'Flagged'));

    const rk = riskFilter.toUpperCase();
    const avgScore = (r.scores.format + r.scores.crossDb + r.scores.spatial + r.scores.title) / 4;
    const matchesRisk = rk === 'ALL' ||
      (rk === 'LOW' && avgScore >= 80) ||
      (rk === 'HIGH' && avgScore < 80);

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const pendingCount = records.filter(r => r.status === 'Pending').length;
  const approvedCount = records.filter(r => r.status === 'Validated').length;
  const rejectedCount = records.filter(r => r.status === 'Rejected' || r.status === 'Escalated').length;

  return (
    <div className="space-y-6">
      {/* Header & Revenue Jurisdiction Info */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-900 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              DISTRICT LUCKNOW • TEHSIL SADAR
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
              <Building2 size={12} /> Revenue Jurisdiction
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mt-1">
            🏛️ District Land Records Repository & Admin Audit Portal
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Complete land record database for District Lucknow (Tehsil Sadar). Inspect pending requests to attend, approved titles, and audit history.
          </p>
        </div>

        <button
          onClick={fetchLiveBackendRecords}
          disabled={loading}
          className="px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync District Database
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm overflow-x-auto gap-2">
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
            statusFilter === 'PENDING'
              ? 'bg-amber-500 text-white shadow'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Clock size={14} /> ⏳ Pending Requests to Attend ({pendingCount})
        </button>

        <button
          onClick={() => setStatusFilter('VALIDATED')}
          className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
            statusFilter === 'VALIDATED'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <CheckCircle2 size={14} /> 🟢 Approved Records ({approvedCount})
        </button>

        <button
          onClick={() => setStatusFilter('REJECTED')}
          className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
            statusFilter === 'REJECTED'
              ? 'bg-red-600 text-white shadow'
              : 'text-red-800 bg-red-50 hover:bg-red-100 border border-red-200'
          }`}
        >
          <X size={14} /> 🔴 Rejected Applications ({rejectedCount})
        </button>

        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
            statusFilter === 'ALL'
              ? 'bg-blue-900 text-white shadow'
              : 'text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <FileText size={14} /> 📋 All District Land Records ({records.length})
        </button>

        <button
          onClick={() => setStatusFilter('HISTORY')}
          className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ml-auto ${
            statusFilter === 'HISTORY'
              ? 'bg-purple-700 text-white shadow'
              : 'text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200'
          }`}
        >
          <History size={14} /> 📜 Admin Action History ({adminHistory.length})
        </button>
      </div>

      {/* Search & Filter Controls (For Table Mode) */}
      {statusFilter !== 'HISTORY' && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Record ID, Owner Name, Survey/Khasra No, District..." 
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 w-80"
              />
            </div>
            
            <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-gray-50">
              <span className="text-gray-500 font-bold">Status:</span>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-extrabold text-gray-900 outline-none cursor-pointer"
              >
                <option value="ALL">All District Statuses</option>
                <option value="PENDING">Pending Review (To Attend)</option>
                <option value="VALIDATED">Validated / Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-gray-50">
              <span className="text-gray-500 font-bold">Risk Level:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-transparent font-extrabold text-gray-900 outline-none cursor-pointer"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk (&ge; 80% Score)</option>
                <option value="HIGH">High Risk (&lt; 80% Score)</option>
              </select>
            </div>
          </div>

          {(searchQuery || statusFilter !== 'ALL' || riskFilter !== 'ALL') && (
            <button 
              onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setRiskFilter('ALL'); }}
              className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* VIEW MODE 1: ADMIN ACTION HISTORY TIMELINE */}
      {statusFilter === 'HISTORY' ? (
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden space-y-4 p-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <History className="text-purple-600" size={20} /> Tehsildar Admin Decision Audit History Log
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Complete chronological log of all approvals, rejections, dispute assignments, and SmartScan OCR actions taken by the Admin.
              </p>
            </div>
            <span className="text-xs bg-purple-100 text-purple-900 font-extrabold px-3 py-1 rounded-full border border-purple-200">
              Total {adminHistory.length} Recorded Actions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50/60 text-purple-900 uppercase font-bold border-b border-purple-200">
                <tr>
                  <th className="p-3">Log ID & Date</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Target Record / Dispute</th>
                  <th className="p-3">Applicant / Party</th>
                  <th className="p-3">Action Details</th>
                  <th className="p-3">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium text-gray-900">
                {adminHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-purple-50/30 transition">
                    <td className="p-3 font-mono">
                      <strong className="text-purple-900 block">{log.id}</strong>
                      <span className="text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> {log.timestamp}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                        log.actionType === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        log.actionType === 'REJECTED' ? 'bg-red-100 text-red-800 border border-red-300' :
                        log.actionType === 'DISPUTE_RESOLVED' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        log.actionType === 'ASSIGNED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-purple-100 text-purple-800 border border-purple-300'
                      }`}>
                        {log.actionType === 'APPROVED' && <><CheckCircle2 size={12} /> APPROVED</>}
                        {log.actionType === 'REJECTED' && <><X size={12} /> REJECTED</>}
                        {log.actionType === 'DISPUTE_RESOLVED' && <><MapPin size={12} /> DISPUTE RESOLVED</>}
                        {log.actionType === 'ASSIGNED' && <><UserCheck size={12} /> OFFICER ASSIGNED</>}
                        {log.actionType === 'SMARTSCAN_OCR' && <><Sparkles size={12} /> SMARTSCAN OCR</>}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-700">{log.recordId}</td>
                    <td className="p-3 font-bold text-gray-900">{log.ownerName}</td>
                    <td className="p-3 text-gray-600 max-w-xs leading-relaxed">{log.details}</td>
                    <td className="p-3 text-xs text-purple-900 font-bold bg-purple-50 rounded-lg border border-purple-100">
                      {log.officialName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: DISTRICT LAND RECORDS TABLE */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
              Showing {filteredRecords.length} District Land Records (Lucknow Jurisdiction)
            </span>
            <span className="text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Synced with FastAPI Backend
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-600">
              <thead className="text-[11px] text-gray-700 uppercase font-extrabold bg-gray-100/70 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Record ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Owner / Khatedar</th>
                  <th className="px-4 py-3">Khasra / Survey</th>
                  <th className="px-4 py-3">District & State</th>
                  <th className="px-4 py-3 text-center">Format</th>
                  <th className="px-4 py-3 text-center">Cross-DB</th>
                  <th className="px-4 py-3 text-center">Spatial</th>
                  <th className="px-4 py-3 text-center">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Officer Action (👁️ ✔️ ✖️)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium text-gray-900">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">
                        <Link href={`/validation/${record.id}`} className="hover:underline">
                          {record.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{record.type}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{record.owner}</td>
                      <td className="px-4 py-3 font-mono">{record.surveyNo}</td>
                      <td className="px-4 py-3">{record.district}, {record.state}</td>
                      <td className="px-4 py-3 text-center"><ValidationBadge score={record.scores.format} /></td>
                      <td className="px-4 py-3 text-center"><ValidationBadge score={record.scores.crossDb} /></td>
                      <td className="px-4 py-3 text-center"><ValidationBadge score={record.scores.spatial} /></td>
                      <td className="px-4 py-3 text-center"><ValidationBadge score={record.scores.title} /></td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          record.status === 'Validated' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          record.status === 'Flagged' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          record.status === 'Escalated' || record.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {record.status === 'Validated' ? 'Approved ✅' : record.status === 'Pending' ? 'Pending Review 🕐' : record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 👁️ Eye Button -> Details */}
                          <Link 
                            href={`/validation/${record.id}`}
                            className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold transition border border-blue-200"
                            title="Inspect Details (👁️)"
                          >
                            <Eye size={15} />
                          </Link>

                          {record.status !== 'Validated' && record.status !== 'Rejected' && (
                            <>
                              {/* ✔️ Green Tick -> Approve */}
                              <button 
                                onClick={() => handleUpdateStatus(record.id, 'VALIDATED')}
                                className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg font-bold transition border border-emerald-300"
                                title="Approve & Solve (✔️)"
                              >
                                <Check size={15} />
                              </button>

                              {/* ✖️ Red Cross -> Reject */}
                              <button 
                                onClick={() => handleUpdateStatus(record.id, 'REJECTED')}
                                className="p-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-lg font-bold transition border border-red-300"
                                title="Reject Request (✖️)"
                              >
                                <X size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-gray-500 font-bold text-xs">
                      No matching land records found for filter "{statusFilter}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

