"use client";

import { useState, useEffect } from "react";
import { getSessionClient } from "@/actions/auth";
import { getAllBroadcastsForSiswa } from "@/actions/broadcast";
import { History, Bell } from "lucide-react";
import Linkify from "@/components/Linkify";

export default function StudentBroadcastPage() {
  const [session, setSession] = useState(null);
  const [broadcasts, setBroadcasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sess = await getSessionClient();
      setSession(sess);
      if (sess && sess.id) {
        const res = await getAllBroadcastsForSiswa();
        if (res.success) {
          setBroadcasts(res.data);
        }
      }
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2 flex items-center gap-2">
          <Bell size={24} className="text-indigo-600" /> Pengumuman (Broadcast)
        </h1>
        <p className="text-slate-500 mb-8 text-sm">
          Semua pengumuman dan pesan broadcast yang dikirim oleh guru.
        </p>

        {broadcasts.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500">Belum ada pengumuman.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {broadcasts.map(b => (
              <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-800 text-lg pr-4">{b.judul}</h3>
                  <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200 text-xs font-bold whitespace-nowrap">
                    {b.guru?.nama || "Guru"}
                  </div>
                </div>
                <div className="text-sm text-slate-600 whitespace-pre-wrap mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <Linkify>{b.pesan}</Linkify>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 font-medium mt-2 border-t border-slate-100 pt-3">
                  <span>Dikirim: {new Date(b.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</span>
                  {b.reads && b.reads.length > 0 && (
                    <span className="text-emerald-500 flex items-center gap-1">✓ Dibaca</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
