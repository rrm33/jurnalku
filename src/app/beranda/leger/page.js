"use client";

import { useState, useEffect } from "react";
import { getLegerOptions, getLegerData } from "@/actions/leger";
import { ClipboardList, Trophy } from "lucide-react";

export default function LegerGuruPage() {
  const [mapels, setMapels] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  
  const [tugasList, setTugasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setLoading(true);
    const res = await getLegerOptions();
    if (res.success) {
      setMapels(res.mapels);
      setKelasList(res.kelasList);
    }
    setLoading(false);
  };

  const handleTampilkan = async () => {
    if (!selectedMapel || !selectedKelas) return;
    setLoadingData(true);
    const res = await getLegerData(selectedMapel, selectedKelas);
    if (res.success) {
      setTugasList(res.data.tugasList);
      setSiswaList(res.data.siswaList);
    }
    setLoadingData(false);
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-500">
      
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Leger Nilai Siswa</h2>
        <p className="text-slate-500 mt-1">Rekapitulasi nilai dan peringkat berdasarkan kelas.</p>
      </header>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Mata Pelajaran</label>
          <select 
            value={selectedMapel}
            onChange={(e) => setSelectedMapel(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-rose-200 focus:outline-none"
          >
            <option value="">-- Pilih Mapel --</option>
            {mapels.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
          </select>
        </div>
        
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas</label>
          <select 
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-rose-200 focus:outline-none"
          >
            <option value="">-- Pilih Kelas --</option>
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>

        <button 
          onClick={handleTampilkan}
          disabled={!selectedMapel || !selectedKelas || loadingData}
          className="w-full md:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all"
        >
          {loadingData ? "Memuat..." : "Tampilkan Leger"}
        </button>
      </div>

      {loadingData ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : siswaList.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold whitespace-nowrap">No</th>
                <th className="px-4 py-3 font-bold whitespace-nowrap min-w-[200px]">Nama Siswa</th>
                {tugasList.map((tugas, idx) => (
                  <th key={tugas.id} className="px-4 py-3 font-bold text-center whitespace-nowrap">
                    T{idx + 1}
                  </th>
                ))}
                <th className="px-4 py-3 font-bold text-center whitespace-nowrap">Jumlah</th>
                <th className="px-4 py-3 font-bold text-center whitespace-nowrap">Rata-rata</th>
                <th className="px-4 py-3 font-bold text-center whitespace-nowrap text-rose-600">Peringkat<br/>Kelas</th>
                <th className="px-4 py-3 font-bold text-center whitespace-nowrap text-indigo-600">Peringkat<br/>Paralel</th>
              </tr>
            </thead>
            <tbody>
              {siswaList.map((siswa, idx) => (
                <tr key={siswa.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{siswa.nama}</td>
                  {tugasList.map(tugas => (
                    <td key={tugas.id} className="px-4 py-3 text-center">
                      {siswa.nilaiTugas[tugas.id]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-bold text-slate-700">{siswa.jumlah}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700">{siswa.rataRata}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-black">
                      {siswa.peringkatKelas}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black">
                      {siswa.peringkatParalel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && selectedMapel && selectedKelas && (
          <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center">
            <ClipboardList size={40} className="text-slate-300 mb-4" />
            <h1 className="text-xl font-bold text-slate-700 mb-2">Tidak Ada Data</h1>
            <p className="text-slate-500">Siswa di kelas ini belum memiliki nilai untuk mapel yang dipilih.</p>
          </div>
        )
      )}
    </div>
  );
}
