import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { WorkerProfile, AppLanguage } from '../types';

interface InteractiveMapProps {
  workers: WorkerProfile[];
  onSelectWorker: (worker: WorkerProfile) => void;
  lang: AppLanguage;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ workers, onSelectWorker, lang }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center between Islamabad and Rawalpindi
      const map = L.map(mapContainerRef.current, {
        center: [33.65, 73.07],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Refresh markers
    if (markersLayerRef.current && mapInstanceRef.current) {
      markersLayerRef.current.clearLayers();

      workers.forEach(w => {
        const isAvail = w.is_available;
        const color = isAvail ? '#5D2A42' : '#886273';
        const badgeBg = isAvail ? '#FB6376' : '#d6c0c9';

        // Custom DivIcon with trade badge and rating
        const customIcon = L.divIcon({
          className: 'custom-worker-pin',
          html: `
            <div style="
              background-color: ${color};
              color: white;
              padding: 5px 9px;
              border-radius: 9999px;
              border: 2px solid white;
              box-shadow: 0 4px 12px rgba(93,42,66,0.35);
              font-family: system-ui, sans-serif;
              font-size: 11px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 5px;
              white-space: nowrap;
              cursor: pointer;
              transform: translate(-50%, -100%);
            ">
              <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:${badgeBg};"></span>
              <span>${w.trade}</span>
              <span style="color:#FFDCCC;">★${w.rating}</span>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([w.latitude, w.longitude], { icon: customIcon });

        const popupContent = document.createElement('div');
        popupContent.style.padding = '4px';
        popupContent.style.minWidth = '180px';
        popupContent.innerHTML = `
          <div style="font-weight: 700; font-size: 14px; color: #3A1B29; margin-bottom: 2px;">
            ${w.name} ${w.name_ur ? `<span style="font-size:12px; color:#886273; font-family:serif;">(${w.name_ur})</span>` : ''}
          </div>
          <div style="font-size: 12px; color: #FB6376; font-weight: 700;">
            ${w.trade} · ${w.area}, ${w.city}
          </div>
          <div style="font-size: 11px; color: #886273; margin-top: 4px;">
            ${w.experience_years} yrs exp · ${w.completed_jobs} completed
          </div>
          <div style="font-size: 12px; font-weight: 800; color: #5D2A42; margin-top: 4px;">
            Starting PKR ${w.starting_price}
          </div>
          <div style="font-size: 11px; margin-top: 4px; color: ${isAvail ? '#FB6376' : '#b45309'}; font-weight: 600;">
            ${isAvail ? '● Available Now' : '○ Busy on Job'}
          </div>
          <button id="btn-view-${w.id}" style="
            width: 100%;
            margin-top: 8px;
            padding: 7px 10px;
            background-color: #FB6376;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(251,99,118,0.3);
          ">
            View & Contact
          </button>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-view-${w.id}`);
          if (btn) {
            btn.onclick = () => onSelectWorker(w);
          }
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }

    return () => {
      // cleanup on unmount
    };
  }, [workers, onSelectWorker, lang]);

  return (
    <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border border-[#F2DDD3] shadow-sm bg-white">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm px-3.5 py-2.5 rounded-2xl border border-[#F2DDD3] text-xs shadow-md">
        <div className="font-bold text-[#3A1B29] mb-1">Islamabad & Rawalpindi Map</div>
        <div className="flex items-center gap-3 text-[#886273]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FB6376]" /> Available ({workers.filter(w => w.is_available).length})
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Busy ({workers.filter(w => !w.is_available).length})
          </span>
        </div>
      </div>
    </div>
  );
};
