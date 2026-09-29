"use client";

import { useState, useEffect } from "react";
import { getSessionClient } from "@/actions/auth";
import { getBroadcasts, sendBroadcast } from "@/actions/broadcast";
import Swal from "sweetalert2";
import { Send, History, Users, Eye } from "lucide-react";
import Linkify from "@/components/Linkify";

export default function BroadcastPage() {
  const [session, setSession] = useState(null);
  const [broadcasts, setBroadcasts] = useState([]);
  const [judul, setJudul] = useState("");
  const [pesan, setPesan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sess = await getSessionClient();
      setSession(sess);
      if (sess && sess.id) {
        await fetchBroadcasts(sess.id);
      }
    }
    load();
  }, []);

  const fetchBroadcasts = async (guruId) => {
    setIsLoading(true);
    const res = await getBroadcasts(guruId);
    if (res.success) {
      setBroadcasts(res.data);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!judul.trim() || !pesan.trim()) {
      Swal.fire("Data belum lengkap", "Judul dan pesan tidak boleh kosong", "warning");
      return;
    }

    setIsSubmitting(true);
    const res = await sendBroadcast(judul, pesan);
    setIsSubmitting(false);

    if (res.success) {
      Swal.fire("Berhasil", "Pesan broadcast telah dikirim ke semua siswa!", "success");
      setJudul("");
      setPesan("");
      fetchBroadcasts(session.id);
    } else {
      Swal.fire("Gagal", res.error || "Terjadi kesalahan", "error");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Pesan Broadcast</h1>
        <p className="text-slate-500 mb-8 text-sm">
          Kirim pengumuman penting ke seluruh akun siswa. Pesan ini akan muncul otomatis (pop-up) saat siswa membuka aplikasi mereka.
        </p>

        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-10 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Judul Pengumuman</label>
            <input 
              type="text" 
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Info Libur Semester"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Isi Pesan</label>
            <textarea 
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder="Tulis pesan lengkap di sini... (URL/Link web akan otomatis bisa diklik oleh siswa)"
              rows={4}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            <Send size={18} /> {isSubmitting ? "Mengirim..." : "Kirim ke Semua Siswa"}
          </button>
        </form>

        <h2 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <History size={20} className="text-slate-500" /> Riwayat Broadcast
        </h2>

        {broadcasts.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500">Belum ada pesan broadcast yang pernah dikirim.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {broadcasts.map(b => (
              <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-800 text-lg pr-4">{b.judul}</h3>
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 text-xs font-bold whitespace-nowrap">
                    <Eye size={12} /> {b.readCount} / {b.totalSiswa} Siswa
                  </div>
                </div>
                <div className="text-sm text-slate-600 whitespace-pre-wrap mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <Linkify>{b.pesan}</Linkify>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Dikirim pada: {new Date(b.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
