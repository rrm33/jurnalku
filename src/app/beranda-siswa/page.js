import { cookies } from "next/headers";
import SetPasswordForm from "./SetPasswordForm";
import { getKbmStatsSiswa } from "@/actions/tugas-siswa";
import { BookOpen, ClipboardList, CheckCircle2, User } from "lucide-react";
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
    <div className="animate-in fade-in zoom-in-95 duration-500 relative">
      {parsed.needsPassword && <SetPasswordForm siswaId={parsed.id} nama={parsed.nama} />}
      
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl md:rounded-3xl p-5 md:p-8 text-white shadow-xl mb-6 md:mb-8 mx-auto w-full flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Selamat Datang, {parsed.nama}!</h1>
          <p className="text-green-50 font-medium text-sm md:text-base">Di sinilah tempat kamu melihat jurnal KBM kelasmu dan mengerjakan tugas.</p>
        </div>
        <div className="bg-white/10 p-4 rounded-xl border border-white/20 w-full md:w-64 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-sm">
              <User size={16} /> Kelengkapan Profil
            </div>
            <span className="font-bold text-sm">{completion}%</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden mb-2">
            <div className={`h-full ${progressColor} transition-all duration-1000 ease-out`} style={{ width: `${completion}%` }}></div>
          </div>
          {completion < 100 && (
            <p className="text-[10px] text-green-50 leading-tight">Lengkapi data profilmu di menu Profil agar mendapat centang hijau.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="font-bold text-slate-700">Total Kegiatan KBM</h3>
          <p className="text-3xl font-black text-rose-600 mt-2">{stats.totalKbm}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
            <ClipboardList size={32} />
          </div>
          <h3 className="font-bold text-slate-700">Tugas Belum Dikerjakan</h3>
          <p className="text-3xl font-black text-rose-600 mt-2">{stats.totalTugasBelum}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="font-bold text-slate-700">Tugas Selesai</h3>
          <p className="text-3xl font-black text-emerald-600 mt-2">{stats.totalTugasSelesai}</p>
        </div>
      </div>
    </div>
  );
}
