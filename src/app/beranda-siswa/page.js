import { cookies } from "next/headers";
import SetPasswordForm from "./SetPasswordForm";
import { getKbmStatsSiswa } from "@/actions/tugas-siswa";
import { BookOpen, ClipboardList, CheckCircle2, User, Sparkles, TrendingUp, Bell } from "lucide-react";
import { calculateProfileCompletion, getProfileProgressColor } from "@/utils/profile";
import { prisma } from "@/lib/prisma";

export default async function BerandaSiswa() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  
  if (!session) return null;
  
  const parsed = JSON.parse(session.value);
  const stats = await getKbmStatsSiswa() || { totalKbm: 0, totalTugasBelum: 0, totalTugasSelesai: 0 };
  
  const siswa = await prisma.siswa.findUnique({ where: { id: parsed.id } });
  const completion = calculateProfileCompletion(siswa);
  const progressColor = getProfileProgressColor(completion);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 relative pb-10">
      {parsed.needsPassword && <SetPasswordForm siswaId={parsed.id} nama={parsed.nama} />}
      
      {/* Modern Profile Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 p-6 md:p-10 text-white shadow-2xl shadow-emerald-500/20 mb-8 mt-2 mx-auto w-full">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-300 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-emerald-50 border border-white/20 mb-4 shadow-sm">
              <Sparkles size={14} className="text-yellow-300" /> Jurnal Mengajar
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight drop-shadow-md">
              Hai, {parsed.nama.split(' ')[0]}!
            </h1>
            <p className="text-emerald-50 font-medium text-sm md:text-base opacity-90 leading-relaxed max-w-lg">
              Semangat belajar hari ini! Pantau KBM dan kerjakan tugasmu agar prestasimu terus meningkat.
            </p>
          </div>

          {/* Profile Completion Card (Glassmorphism) */}
          <div className="w-full md:w-72 bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/20 shadow-lg shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <User size={16} />
                </div>
                Kelengkapan Profil
              </div>
              <span className="font-black text-lg text-emerald-100">{completion}%</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden shadow-inner mb-3">
              <div 
                className={`h-full ${progressColor} relative`} 
                style={{ width: `${completion}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
            {completion < 100 ? (
              <p className="text-[11px] text-emerald-50/90 font-medium leading-relaxed">
                Ayo lengkapi profilmu 100% untuk mendapatkan lencana terverifikasi.
              </p>
            ) : (
              <p className="text-[11px] text-white font-bold flex items-center gap-1">
                <CheckCircle2 size={12} className="text-yellow-300" /> Profil lengkap! Bagus sekali.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-500" /> Rangkuman Belajarmu
        </h2>
      </div>

      {/* Modern Grid Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100/60 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800 mb-1">{stats.totalKbm}</p>
            <h3 className="font-bold text-slate-500 text-xs md:text-sm">Total Kegiatan KBM</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100/60 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner relative">
              <ClipboardList size={24} strokeWidth={2.5} />
              {stats.totalTugasBelum > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800 mb-1">{stats.totalTugasBelum}</p>
            <h3 className="font-bold text-slate-500 text-xs md:text-sm">Tugas Belum Selesai</h3>
          </div>
        </div>

        {/* This card spans 2 columns on mobile if it's the 3rd item, for a nice varied layout, but standard grid is fine too. Let's make it col-span-2 on mobile */}
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-emerald-50 to-green-100 p-5 rounded-3xl shadow-sm border border-emerald-200/50 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12 scale-150">
             <CheckCircle2 size={100} />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black text-emerald-700 mb-1">{stats.totalTugasSelesai}</p>
            <h3 className="font-bold text-emerald-600 text-xs md:text-sm">Tugas Terselesaikan</h3>
          </div>
        </div>

      </div>
    </div>
  );
}
