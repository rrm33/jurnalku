"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { getSiswa } from "@/actions/master";
import { Map, MapPin, Search } from "lucide-react";

// Import peta secara dinamis untuk menghindari SSR Next.js yang membuat error pada Leaflet
const StudentMaps = dynamic(() => import('@/components/StudentMaps'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
      <Map size={48} className="text-slate-300 mb-4" />
      <p className="text-slate-400 font-medium">Memuat pustaka peta...</p>
    </div>
  )
});

export default function MapsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getSiswa();
      if (Array.isArray(res)) {
        setStudents(res);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredStudents = students.filter(s => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchNama = s.nama.toLowerCase().includes(query);
    const matchKelas = s.kelas?.nama?.toLowerCase().includes(query);
    return matchNama || matchKelas;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="text-emerald-500" /> Peta Persebaran Siswa
          </h1>
          <p className="text-slate-500 mt-1">
            Visualisasi data lokasi tempat tinggal siswa di dalam satu peta interaktif.
          </p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama / kelas siswa..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="w-full h-[650px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium">Menarik data koordinat siswa...</p>
        </div>
      ) : (
        <StudentMaps students={filteredStudents} />
      )}
    </div>
  );
}
