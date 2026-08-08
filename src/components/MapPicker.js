"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix untuk masalah ikon default Leaflet di Next.js/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapPicker({ initialPosition, onConfirm, onClose }) {
  const [position, setPosition] = useState(initialPosition || { lat: -6.200000, lng: 106.816666 });

  // Get current location if no initial position
  useEffect(() => {
    if (!initialPosition) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // fallback to Jakarta
      );
    }
  }, [initialPosition]);

  const handleConfirm = () => {
    onConfirm(position);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Pilih Lokasi</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-200 rounded-full transition-colors">✕</button>
        </div>
        <div className="flex-1 relative">
          <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={position} />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-slate-200 text-sm font-bold text-slate-700 z-[10]">
            Klik pada peta untuk memindahkan titik (Pin)
          </div>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Batal</button>
          <button onClick={handleConfirm} className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-colors">
            Konfirmasi Lokasi
          </button>
        </div>
      </div>
    </div>
  );
}
