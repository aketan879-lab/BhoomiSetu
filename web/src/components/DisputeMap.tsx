'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Dispute } from '@/lib/types';

// Fix for default marker icons in Next.js/Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.0/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.0/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.0/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom colored icons based on priority & status
const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.6);"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

const getDisputeIcon = (dispute: Dispute) => {
  if (dispute.status === 'Resolved') return createColoredIcon('#16a34a'); // green
  if (dispute.priority === 'Critical' || dispute.priority === 'High') return createColoredIcon('#dc2626'); // red
  if (dispute.priority === 'Medium') return createColoredIcon('#ea580c'); // orange
  return createColoredIcon('#2563eb'); // blue
};

function MapFlyController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 9, { animate: true, duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

interface DisputeMapProps {
  disputes: Dispute[];
  selectedDisputeId?: string | null;
  onSelectDispute?: (dispute: Dispute) => void;
  onOpenDetails?: (dispute: Dispute) => void;
  onResolveDispute?: (dispute: Dispute) => void;
  onAssignDispute?: (dispute: Dispute) => void;
}

export default function DisputeMap({ 
  disputes,
  selectedDisputeId,
  onSelectDispute,
  onOpenDetails,
  onResolveDispute,
  onAssignDispute
}: DisputeMapProps) {
  // Default Center (India)
  const defaultCenter: [number, number] = [22.5, 82.0];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedDispute = disputes.find(d => d.id === selectedDisputeId);
  const flyCenter = selectedDispute ? selectedDispute.coordinates : null;

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
        ⚡ Loading Interactive GIS Map...
      </div>
    );
  }

  return (
    <MapContainer center={defaultCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapFlyController center={flyCenter} />

      {disputes.map((dispute) => (
        <Marker 
          key={dispute.id} 
          position={dispute.coordinates}
          icon={getDisputeIcon(dispute)}
          eventHandlers={{
            click: () => onSelectDispute && onSelectDispute(dispute),
          }}
        >
          <Popup minWidth={260}>
            <div className="p-1 space-y-2">
              <div className="flex justify-between items-center border-b border-gray-200 pb-1">
                <span className="font-mono text-xs font-bold text-blue-800">{dispute.id}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                  dispute.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                  dispute.priority === 'Critical' || dispute.priority === 'High' ? 'bg-red-100 text-red-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {dispute.status === 'Resolved' ? 'RESOLVED ✅' : dispute.priority}
                </span>
              </div>

              <h4 className="font-extrabold text-sm text-gray-900 leading-tight">{dispute.type}</h4>
              
              <div className="text-xs text-gray-600 space-y-0.5">
                <p><strong>Location:</strong> {dispute.district}, {dispute.state}</p>
                <p><strong>Survey / Khasra:</strong> <span className="font-mono font-bold text-blue-900">{dispute.surveyNo}</span></p>
                <p><strong>Parties:</strong> {dispute.parties.join(' vs ')}</p>
                {dispute.assignedTo && (
                  <p className="text-blue-700 font-bold"><strong>Assigned:</strong> {dispute.assignedTo}</p>
                )}
              </div>

              <p className="text-[11px] text-gray-500 bg-gray-50 p-1.5 rounded border border-gray-200 line-clamp-2">
                {dispute.summary}
              </p>

              {/* ACTION BUTTONS INSIDE POPUP */}
              <div className="pt-2 flex flex-col gap-1.5 border-t border-gray-100">
                <button
                  onClick={() => onOpenDetails && onOpenDetails(dispute)}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded transition flex items-center justify-center gap-1 shadow-sm"
                >
                  👁️ View Details & Evidence
                </button>

                {dispute.status !== 'Resolved' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => onAssignDispute && onAssignDispute(dispute)}
                      className="flex-1 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[11px] rounded border border-gray-300 transition"
                    >
                      👤 Assign
                    </button>
                    <button
                      onClick={() => onResolveDispute && onResolveDispute(dispute)}
                      className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded transition shadow-sm"
                    >
                      ⚡ Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
