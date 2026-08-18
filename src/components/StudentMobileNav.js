"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, ClipboardList, User, LogOut, Menu, X, Megaphone } from "lucide-react";
import PwaInstallButton from "./PwaInstallButton";

export default function StudentMobileNav({ newTugasCount, ajuanStatus, onLogout }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleNav = (path) => {
    setIsMoreOpen(false);
    router.push(path);
  };

  const isActive = (path) => {
    if (path === "/beranda-siswa") return pathname === "/beranda-siswa";
    return pathname.startsWith(path);
  };

  const getIconClass = (path) => {
    return isActive(path) 
      ? "text-emerald-600 scale-110 transition-all duration-300 drop-shadow-md" 
      : "text-slate-400 group-hover:text-emerald-400 transition-all duration-300";
  };

  const getLabelClass = (path) => {
    return isActive(path)
      ? "text-emerald-600 font-bold opacity-100"
      : "text-slate-500 font-medium opacity-80 group-hover:opacity-100";
  };

  return (
    <>
      <div className="h-20 md:hidden w-full" />

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200/50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 px-2 pb-safe pt-2">
        <div className="flex justify-between items-center max-w-md mx-auto">
          
          <button onClick={() => handleNav("/beranda-siswa")} className="group flex flex-col items-center justify-center w-1/5 py-1 relative">
            <Home size={22} className={getIconClass("/beranda-siswa")} strokeWidth={isActive("/beranda-siswa") ? 2.5 : 2} />
            <span className={`text-[10px] mt-1 ${getLabelClass("/beranda-siswa")}`}>Home</span>
            {isActive("/beranda-siswa") && <span className="absolute -top-2 w-8 h-1 bg-emerald-500 rounded-b-full"></span>}
          </button>

          <button onClick={() => handleNav("/beranda-siswa/tugas")} className="group flex flex-col items-center justify-center w-1/5 py-1 relative">
            <div className="relative">
              <ClipboardList size={22} className={getIconClass("/beranda-siswa/tugas")} strokeWidth={isActive("/beranda-siswa/tugas") ? 2.5 : 2} />
              {newTugasCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm animate-pulse">
                  {newTugasCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-1 ${getLabelClass("/beranda-siswa/tugas")}`}>KBM</span>
            {isActive("/beranda-siswa/tugas") && <span className="absolute -top-2 w-8 h-1 bg-emerald-500 rounded-b-full"></span>}
          </button>
          
          <button onClick={() => handleNav("/beranda-siswa/chat")} className="group flex flex-col items-center justify-center w-1/5 py-1 relative">
            <Megaphone size={22} className={getIconClass("/beranda-siswa/chat")} strokeWidth={isActive("/beranda-siswa/chat") ? 2.5 : 2} />
            <span className={`text-[10px] mt-1 ${getLabelClass("/beranda-siswa/chat")}`}>Pesan</span>
            {isActive("/beranda-siswa/chat") && <span className="absolute -top-2 w-8 h-1 bg-emerald-500 rounded-b-full"></span>}
          </button>

          <button onClick={() => handleNav("/beranda-siswa/profil")} className="group flex flex-col items-center justify-center w-1/5 py-1 relative">
            <div className="relative">
              <User size={22} className={getIconClass("/beranda-siswa/profil")} strokeWidth={isActive("/beranda-siswa/profil") ? 2.5 : 2} />
              {ajuanStatus === 'DITOLAK' && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                  !
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-1 ${getLabelClass("/beranda-siswa/profil")}`}>Profil</span>
            {isActive("/beranda-siswa/profil") && <span className="absolute -top-2 w-8 h-1 bg-emerald-500 rounded-b-full"></span>}
          </button>

          <button onClick={() => setIsMoreOpen(true)} className="group flex flex-col items-center justify-center w-1/5 py-1 relative">
            <Menu size={22} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
            <span className="text-[10px] mt-1 text-slate-500 font-medium">Lainnya</span>
          </button>

        </div>
      </div>

      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMoreOpen(false)}></div>
          
          <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setIsMoreOpen(false)}>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
            </div>
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-lg">Menu Lainnya</h2>
              <button onClick={() => setIsMoreOpen(false)} className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 pb-safe">
              <button onClick={() => handleNav("/beranda-siswa/leger")} className="w-full flex items-center gap-4 px-4 py-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl transition-colors text-left">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500">
                  <ClipboardList size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-700 text-sm">Leger Nilai</h3>
                  <p className="text-xs text-slate-500">Lihat rekap nilai & peringkat kelas</p>
                </div>
              </button>

              <PwaInstallButton />

              <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition-colors text-left mb-6">
                <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center text-red-500">
                  <LogOut size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">Keluar Sistem</h3>
                  <p className="text-xs opacity-80">Akhiri sesi Anda</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
