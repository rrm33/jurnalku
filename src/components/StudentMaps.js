"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ExternalLink, User } from "lucide-react";
import { calculateProfileCompletion, getProfileProgressColor } from "@/utils/profile";

// Fix Leaflet marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Komponen helper untuk mengatur zoom bounds agar pas dengan seluruh marker
function MapBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [markers, map]);
  return null;
}

export default function StudentMaps({ students }) {
  // Hanya ambil siswa yang memiliki data alamat tidak kosong
  // dan berhasil diekstrak koordinatnya
  const validMarkers = students
    .map((s) => {
      if (!s.alamat) return null;
      const match = s.alamat.match(/\[Koordinat:\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\]/);
      if (match) {
        const completion = calculateProfileCompletion(s);
        return {
          id: s.id,
          nama: s.nama,
          kelas: s.kelas?.nama || "-",
          alamatTeks: s.alamat.replace(/\[Koordinat:.*\]/, "").trim(),
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2]),
          completion: completion,
          progressColor: getProfileProgressColor(completion)
        };
      }
      return null;
    })
    .filter(Boolean);

  const defaultCenter = { lat: -6.200000, lng: 106.816666 };

  if (validMarkers.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-slate-100 rounded-2xl border border-slate-200 p-6 text-center">
        {students.length > 0 ? (
          <div className="text-slate-500 font-medium">
            <p className="text-lg text-slate-700">Siswa yang Anda cari ditemukan, namun belum memiliki titik koordinat.</p>
            <p className="text-sm mt-2">Siswa tersebut perlu login dan men-set titik lokasinya melalui menu Profil terlebih dahulu agar dapat muncul di peta.</p>
          </div>
        ) : (
          <div className="text-slate-500 font-medium">
            <p className="text-lg">Belum ada titik koordinat lokasi siswa yang tersimpan / ditemukan.</p>
            <p className="text-sm mt-1">Siswa perlu meng-update koordinat melalui menu Profil mereka terlebih dahulu.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-[650px] relative rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds markers={validMarkers} />
        
        {validMarkers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            <Tooltip permanent direction="top" offset={[0, -35]} className="bg-white shadow-sm border border-slate-200 rounded-lg p-2 min-w-[120px]">
              <div className="flex flex-col items-center">
                <span className="font-bold text-xs text-slate-800 text-center truncate w-full mb-1">{marker.nama}</span>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full ${marker.progressColor}`} style={{ width: `${marker.completion}%` }}></div>
                </div>
              </div>
            </Tooltip>
            <Popup>
              <div className="p-1 space-y-2 min-w-[200px]">
                <div className="flex items-start gap-2 border-b border-slate-100 pb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <User size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={`/beranda/master/siswa?search=${encodeURIComponent(marker.nama)}`} className="font-bold text-slate-800 text-sm leading-tight hover:text-rose-600 hover:underline cursor-pointer inline-block truncate w-full" title="Buka Detail Siswa">{marker.nama}</a>
                    <p className="text-xs text-slate-500 mb-1">Kelas: {marker.kelas}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                    {marker.alamatTeks || "Detail alamat tidak tersedia."}
                  </p>
                  
                  <a 
                    href={`https://www.google.com/maps?q=${marker.lat},${marker.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
                  >
                    <ExternalLink size={14} /> Buka di Maps
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute top-4 left-4 z-[10] bg-white/95 backdrop-blur shadow-lg border border-slate-200 rounded-xl px-4 py-3">
        <h4 className="font-bold text-slate-800 text-sm">Informasi Peta</h4>
        <p className="text-xs text-slate-500 mt-1">Total Titik Siswa: <strong className="text-rose-600 text-sm">{validMarkers.length}</strong></p>
      </div>
    </div>
  );
}
