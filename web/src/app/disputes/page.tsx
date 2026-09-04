'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { mockDisputes } from '@/lib/mockData';
import { Dispute } from '@/lib/types';
import { 
  MapPin, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Eye, 
  UserCheck, 
  CheckCircle2, 
  X, 
  Send, 
  FileText, 
  ShieldAlert, 
  Compass, 
  Sparkles 
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

// Dynamic import for Leaflet map to prevent SSR issues
const DisputeMap = dynamic(() => import('@/components/DisputeMap'), { ssr: false });

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('PENDING');

  // Modal states
  const [detailDispute, setDetailDispute] = useState<Dispute | null>(null);
  const [resolveTarget, setResolveTarget] = useState<Dispute | null>(null);
  const [assignTarget, setAssignTarget] = useState<Dispute | null>(null);

  // Form inputs
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [assignedOfficial, setAssignedOfficial] = useState('Tahsildar Mohanlalganj');
  const [assignmentInstruction, setAssignmentInstruction] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Toast Banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filter disputes
  const filteredDisputes = disputes.filter(d => {
    if (filterType === 'ALL') return true;
    if (filterType === 'PENDING') return d.status !== 'Resolved';
    if (filterType === 'RESOLVED') return d.status === 'Resolved';
    return d.type.toLowerCase().includes(filterType.toLowerCase());
  });

  // Handle Resolve Dispute
  const handleConfirmResolve = async () => {
    if (!resolveTarget) return;
    setActionLoading(true);

    const notes = resolutionNotes.trim() || 'Dispute resolved by Tehsildar Admin after ground GIS boundary verification.';

    try {
      await fetch(`${BACKEND_URL}/api/v1/disputes/${resolveTarget.id}/resolve?resolution_notes=${encodeURIComponent(notes)}`, {
        method: 'PUT'
      });
    } catch (err) {
      console.log('Backend sync error, updated locally');
    }

    setDisputes(prev => prev.map(item => {
      if (item.id === resolveTarget.id) {
        return {
          ...item,
          status: 'Resolved',
          priority: 'Low',
          resolutionNotes: notes
        };
      }
      return item;
    }));

    if (detailDispute?.id === resolveTarget.id) {
      setDetailDispute(prev => prev ? { ...prev, status: 'Resolved', priority: 'Low', resolutionNotes: notes } : null);
    }

    setActionLoading(false);
    showToast(`✅ Dispute ${resolveTarget.id} resolved successfully! Resolution recorded on GIS portal.`);
    setResolveTarget(null);
    setResolutionNotes('');
  };

  // Handle Assign Dispute
  const handleConfirmAssign = async () => {
    if (!assignTarget) return;
    setActionLoading(true);

    try {
      await fetch(`${BACKEND_URL}/api/v1/disputes/${assignTarget.id}/assign?official_id=${encodeURIComponent(assignedOfficial)}`, {
        method: 'PUT'
      });
    } catch (err) {
      console.log('Backend sync error, assigned locally');
    }

    setDisputes(prev => prev.map(item => {
      if (item.id === assignTarget.id) {
        return {
          ...item,
          status: 'Under Review',
          assignedTo: assignedOfficial
        };
      }
      return item;
    }));

    if (detailDispute?.id === assignTarget.id) {
      setDetailDispute(prev => prev ? { ...prev, status: 'Under Review', assignedTo: assignedOfficial } : null);
    }

    setActionLoading(false);
    showToast(`👤 Dispute ${assignTarget.id} assigned to ${assignedOfficial}.`);
    setAssignTarget(null);
    setAssignmentInstruction('');
  };

  // Stats Counters
  const totalCount = disputes.length;
  const pendingCount = disputes.filter(d => d.status !== 'Resolved').length;
  const criticalCount = disputes.filter(d => (d.priority === 'Critical' || d.priority === 'High') && d.status !== 'Resolved').length;
  const underReviewCount = disputes.filter(d => d.status === 'Under Review').length;
  const resolvedCount = disputes.filter(d => d.status === 'Resolved').length;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`p-3 rounded-xl text-xs font-bold shadow-md flex justify-between items-center transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap justify-between items-center shrink-0 gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            🗺️ GIS Mapping & Boundary Dispute Solver
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time geospatial boundary overlap detection, title dispute resolution, and officer assignment.
          </p>
        </div>

        <div className="flex space-x-6 text-sm">
          <div 
            onClick={() => setFilterType('PENDING')}
            className={`flex flex-col cursor-pointer transition px-3 py-1 rounded-xl ${
              filterType === 'PENDING' ? 'bg-amber-100 border border-amber-300 ring-2 ring-amber-400' : 'hover:bg-gray-50'
            }`}
          >
            <span className="text-amber-900 text-xs font-black uppercase flex items-center gap-1">
              <Clock size={12} className="text-amber-600" /> Pending Cases
            </span>
            <span className="font-black text-amber-700 text-lg">{pendingCount} Pending</span>
          </div>

          <div className="flex flex-col border-l border-gray-200 pl-6">
            <span className="text-gray-500 text-xs font-bold uppercase">Total Disputes</span>
            <span className="font-extrabold text-gray-900 text-lg">{totalCount}</span>
          </div>
          <div className="flex flex-col border-l border-gray-200 pl-6">
            <span className="text-gray-500 text-xs font-bold uppercase">Critical / High</span>
            <span className="font-extrabold text-red-600 text-lg">{criticalCount}</span>
          </div>
          <div className="flex flex-col border-l border-gray-200 pl-6">
            <span className="text-gray-500 text-xs font-bold uppercase">Under Review</span>
            <span className="font-extrabold text-orange-600 text-lg">{underReviewCount}</span>
          </div>
          <div className="flex flex-col border-l border-gray-200 pl-6">
            <span className="text-gray-500 text-xs font-bold uppercase">Resolved</span>
            <span className="font-extrabold text-emerald-600 text-lg">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Split Layout: Interactive Map (60%) + Actionable Side Panel (40%) */}
      <div className="flex flex-1 overflow-hidden gap-4 min-h-[540px]">
        {/* Left: Map (60%) */}
        <div className="w-3/5 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
          <DisputeMap 
            disputes={filteredDisputes} 
            selectedDisputeId={selectedDisputeId}
            onSelectDispute={(d) => setSelectedDisputeId(d.id)}
            onOpenDetails={(d) => setDetailDispute(d)}
            onResolveDispute={(d) => setResolveTarget(d)}
            onAssignDispute={(d) => setAssignTarget(d)}
          />
          
          {/* Map Legend Floating */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-200 z-[400] text-xs">
            <h4 className="font-extrabold text-gray-900 mb-2">GIS Priority Legend</h4>
            <div className="space-y-1.5 font-medium">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-600 mr-2 border border-white outline outline-1 outline-gray-300"></span> Critical / High Risk</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2 border border-white outline outline-1 outline-gray-300"></span> Medium Risk</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-600 mr-2 border border-white outline outline-1 outline-gray-300"></span> Low / Resolved ✅</div>
            </div>
          </div>
        </div>

        {/* Right: Dispute List (40%) */}
        <div className="w-2/5 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Filter Tabs */}
          <div className="p-3 border-b border-gray-200 bg-gray-50 shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: `⏳ Pending Cases (${pendingCount})`, val: 'PENDING' },
                { label: `All Disputes (${totalCount})`, val: 'ALL' },
                { label: 'Ownership Conflict', val: 'Ownership' },
                { label: 'Boundary Overlap', val: 'Boundary' },
                { label: 'Chain Gap', val: 'Chain' },
                { label: `Resolved ✅ (${resolvedCount})`, val: 'RESOLVED' },
              ].map(f => (
                <button
                  key={f.val}
                  onClick={() => setFilterType(f.val)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    filterType === f.val 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dispute Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredDisputes.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs font-bold">
                No disputes found for filter "{filterType}".
              </div>
            ) : (
              filteredDisputes.map((dispute) => {
                const isSelected = selectedDisputeId === dispute.id;
                return (
                  <div 
                    key={dispute.id} 
                    onClick={() => setSelectedDisputeId(dispute.id)}
                    className={`border rounded-xl p-4 transition cursor-pointer ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        dispute.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        dispute.priority === 'Critical' ? 'bg-red-100 text-red-800 border border-red-300' :
                        dispute.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' :
                        dispute.priority === 'Medium' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {dispute.status === 'Resolved' ? 'RESOLVED ✅' : dispute.priority}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-blue-900">{dispute.id}</span>
                    </div>
                    
                    <h3 className="text-sm font-extrabold text-gray-900 mb-1">{dispute.type}</h3>
                    
                    <div className="space-y-1.5 mt-2 text-xs text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-600 shrink-0" />
                        <span className="font-semibold">{dispute.district}, {dispute.state} — Survey: <strong className="font-mono text-gray-900">{dispute.surveyNo}</strong></span>
                      </div>
                      <div className="flex items-start">
                        <Users className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="font-bold text-gray-800">{dispute.parties.join(' vs ')}</span>
                      </div>
                      <div className="flex items-start">
                        <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 text-gray-600">{dispute.summary}</span>
                      </div>

                      {dispute.assignedTo && (
                        <div className="flex items-center text-[11px] font-bold text-blue-700 bg-blue-50 p-1.5 rounded-lg border border-blue-200 mt-2">
                          <UserCheck className="w-3.5 h-3.5 mr-1 shrink-0" /> Assigned Officer: {dispute.assignedTo}
                        </div>
                      )}

                      {dispute.resolutionNotes && (
                        <div className="flex items-start text-[11px] font-bold text-emerald-800 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 mt-2">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0 mt-0.5 text-emerald-600" /> Notes: {dispute.resolutionNotes}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center text-xs font-bold">
                        {dispute.status === 'Resolved' ? (
                          <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Resolved ✅</span>
                        ) : dispute.status === 'Under Review' ? (
                          <span className="flex items-center text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200"><Clock className="w-3.5 h-3.5 mr-1" /> Under Review</span>
                        ) : (
                          <span className="flex items-center text-gray-700 bg-gray-100 px-2 py-0.5 rounded"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Detected</span>
                        )}
                      </div>
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDetailDispute(dispute); }}
                          className="text-xs font-bold px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition flex items-center gap-1"
                        >
                          <Eye size={13} /> Details
                        </button>

                        {dispute.status !== 'Resolved' && (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setAssignTarget(dispute); }}
                              className="text-xs font-bold px-2.5 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                            >
                              Assign
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setResolveTarget(dispute); }}
                              className="text-xs font-bold px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
                            >
                              Resolve
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 1. DISPUTE DETAILS MODAL (FRONT OF MAP) */}
      {detailDispute && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-gray-200 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setDetailDispute(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-3 bg-blue-100 text-blue-800 rounded-xl font-bold">
                <Compass size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{detailDispute.id}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                    detailDispute.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {detailDispute.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-black text-gray-900 mt-0.5">{detailDispute.type}</h3>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-bold block">District / State:</span>
                <span className="font-bold text-gray-900">{detailDispute.district}, {detailDispute.state}</span>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-bold block">Khasra / Survey #:</span>
                <span className="font-mono font-bold text-blue-900">{detailDispute.surveyNo}</span>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-bold block">GIS Coordinates:</span>
                <span className="font-mono font-bold text-gray-900">{detailDispute.coordinates.join(', ')}</span>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 col-span-2">
                <span className="text-gray-500 font-bold block">Involved Parties:</span>
                <span className="font-extrabold text-gray-900">{detailDispute.parties.join(' vs ')}</span>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-bold block">Assigned Official:</span>
                <span className="font-bold text-blue-800">{detailDispute.assignedTo || 'Unassigned'}</span>
              </div>
            </div>

            {/* Discrepancy Summary Box */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                <ShieldAlert size={16} /> GIS Overlap & Title Discrepancy Analysis
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                {detailDispute.summary}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <button
                onClick={() => setDetailDispute(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200"
              >
                Close Details
              </button>

              {detailDispute.status !== 'Resolved' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setAssignTarget(detailDispute); setDetailDispute(null); }}
                    className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-800 font-bold text-xs rounded-xl hover:bg-gray-200"
                  >
                    👤 Assign Officer
                  </button>
                  <button
                    onClick={() => { setResolveTarget(detailDispute); setDetailDispute(null); }}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-md"
                  >
                    ⚡ Resolve Dispute Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. RESOLVE DISPUTE MODAL (FRONT OF MAP) */}
      {resolveTarget && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Resolve Land Dispute</h3>
                <p className="text-xs text-gray-500">Dispute ID: {resolveTarget.id} • Survey #{resolveTarget.surveyNo}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to mark dispute <strong className="text-gray-900">{resolveTarget.id}</strong> ({resolveTarget.type}) as officially <strong className="text-emerald-700">RESOLVED ✅</strong>?
            </p>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Official Resolution Findings & Notes:</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Revenue officer completed joint ground survey. Khasra boundary redrawn and title validated for both parties..."
                className="w-full p-3 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setResolveTarget(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 flex justify-center items-center gap-1 shadow-md"
              >
                {actionLoading ? 'Saving...' : 'Confirm Resolution (✔️)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ASSIGN OFFICER MODAL (FRONT OF MAP) */}
      {assignTarget && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-3 bg-blue-100 text-blue-800 rounded-xl font-bold">
                <UserCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Assign Field Officer</h3>
                <p className="text-xs text-gray-500">Dispute ID: {assignTarget.id}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Select Revenue Official / Surveyor:</label>
              <select
                value={assignedOfficial}
                onChange={(e) => setAssignedOfficial(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 bg-gray-50 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="Tahsildar Mohanlalganj">Tahsildar Mohanlalganj (Revenue Officer)</option>
                <option value="Revenue Officer Sadar">Revenue Officer Sadar (District Admin)</option>
                <option value="Patwari Alambagh">Patwari Alambagh (Field Surveyor)</option>
                <option value="Senior Land Surveyor Lucknow">Senior GIS Land Surveyor Lucknow</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Instructions for Official (Optional):</label>
              <textarea
                value={assignmentInstruction}
                onChange={(e) => setAssignmentInstruction(e.target.value)}
                placeholder="e.g. Conduct ground physical measurement of boundary overlap at Khasra #45/12..."
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAssignTarget(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-blue-700 text-white font-bold text-xs rounded-xl hover:bg-blue-800 shadow-md"
              >
                {actionLoading ? 'Assigning...' : 'Assign Official (👤)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
