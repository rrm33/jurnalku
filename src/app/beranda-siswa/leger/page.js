"use client";

import { useState, useEffect } from "react";
import { getLegerOptions, getLegerData } from "@/actions/leger";
import { ClipboardList, Trophy, Medal } from "lucide-react";

export default function LegerSiswaPage() {
  const [mapels, setMapels] = useState([]);
  const [kelasId, setKelasId] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("");
  
  const [tugasList, setTugasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [myData, setMyData] = useState(null);
  
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
      setKelasId(res.kelas_id);
    }
    setLoading(false);
  };

  const handleTampilkan = async () => {
    if (!selectedMapel || !kelasId) return;
    setLoadingData(true);
    const res = await getLegerData(selectedMapel, kelasId);
    if (res.success) {
      setTugasList(res.data.tugasList);
      setSiswaList(res.data.siswaList);
      
      // Assume we can find myData based on session (but since session is in cookies, we don't have ID on client directly).
      // Wait, getLegerData doesn't tell us which one is "Me" unless we pass it.
      // We can fetch our own name or ID from another endpoint, or we can just fetch it from the action.
      // Let's assume the action can be updated or we can just pass the name if we know it.
      // For now, let's update getLegerData to return `myId` if role === siswa.
      
      setMyData(res.data.siswaList.find(s => s.isMe)); // Needs update in getLegerData
    }
    setLoadingData(false);
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-in fade-in zoom-in-95 duration-500">
      
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Peringkat & Nilai</h2>
        <p className="text-slate-500 mt-1">Pilih mata pelajaran untuk melihat posisi ranking Anda.</p>
      </header>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
          <select 
            value={selectedMapel}
            onChange={(e) => setSelectedMapel(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm"
          >
            <option value="">-- Pilih Mapel --</option>
            {mapels.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
          </select>
        </div>
        <button 
          onClick={handleTampilkan}
          disabled={!selectedMapel || loadingData}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all whitespace-nowrap"
        >
          {loadingData ? "Memuat..." : "Tampilkan"}
        </button>
      </div>

      {myData && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-5 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
            <Trophy className="absolute -right-4 -bottom-4 text-emerald-400 opacity-30" size={100} />
            <p className="text-emerald-100 font-semibold text-sm mb-1">Peringkat Kelas</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">{myData.peringkatKelas}</span>
              <span className="text-sm pb-1 font-medium text-emerald-200">dari {siswaList.length}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-5 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
            <Medal className="absolute -right-4 -bottom-4 text-indigo-400 opacity-30" size={100} />
            <p className="text-indigo-100 font-semibold text-sm mb-1">Peringkat Paralel</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">{myData.peringkatParalel}</span>
            </div>
          </div>
        </div>
      )}

      {loadingData ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : siswaList.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold whitespace-nowrap">No</th>
                <th className="px-4 py-3 font-bold whitespace-nowrap min-w-[150px]">Nama Siswa</th>
                <th className="px-4 py-3 font-bold text-center whitespace-nowrap">Jumlah</th>
                <th className="px-4 py-3 font-bold text-center whitespace-nowrap">Rata-rata</th>
                <th className="px-4 py-3 font-bold text-center whitespace-nowrap">Rank<br/>Kelas</th>
              </tr>
            </thead>
            <tbody>
              {siswaList.map((siswa, idx) => {
                const isMe = siswa.isMe;
                return (
                  <tr key={siswa.id} className={`border-b border-slate-100 ${isMe ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                    <td className={`px-4 py-3 ${isMe ? 'font-bold text-emerald-700' : 'text-slate-500'}`}>{idx + 1}</td>
                    <td className={`px-4 py-3 ${isMe ? 'font-black text-emerald-800' : 'font-semibold text-slate-700'}`}>
                      {siswa.nama}
                      {isMe && <span className="ml-2 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase">Saya</span>}
                    </td>
                    <td className={`px-4 py-3 text-center ${isMe ? 'font-bold text-emerald-700' : 'font-bold text-slate-700'}`}>{siswa.jumlah}</td>
                    <td className={`px-4 py-3 text-center ${isMe ? 'font-bold text-emerald-700' : 'font-bold text-slate-700'}`}>{siswa.rataRata}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black ${isMe ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                        {siswa.peringkatKelas}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && selectedMapel && (
          <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center">
            <ClipboardList size={40} className="text-slate-300 mb-4" />
            <h1 className="text-xl font-bold text-slate-700 mb-2">Tidak Ada Data</h1>
            <p className="text-slate-500">Belum ada nilai yang dimasukkan untuk mapel ini.</p>
          </div>
        )
      )}
    </div>
  );
}
