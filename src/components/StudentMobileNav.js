"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, ClipboardList, User, LogOut } from "lucide-react";

export default function StudentMobileNav({ newTugasCount, ajuanStatus, onLogout }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNav = (path) => {
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
      {/* Spacer */}
      <div className="h-20 md:hidden w-full" />

      {/* Main Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200/50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 px-2 pb-safe pt-2">
        <div className="flex justify-between items-center max-w-md mx-auto">
          
          <button onClick={() => handleNav("/beranda-siswa")} className="group flex flex-col items-center justify-center w-1/4 py-1 relative">
            <Home size={22} className={getIconClass("/beranda-siswa")} strokeWidth={isActive("/beranda-siswa") ? 2.5 : 2} />
            <span className={`text-[10px] mt-1 ${getLabelClass("/beranda-siswa")}`}>Home</span>
            {isActive("/beranda-siswa") && <span className="absolute -top-2 w-8 h-1 bg-emerald-500 rounded-b-full"></span>}
          </button>

          <button onClick={() => handleNav("/beranda-siswa/tugas")} className="group flex flex-col items-center justify-center w-1/4 py-1 relative">
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

          <button onClick={() => handleNav("/beranda-siswa/profil")} className="group flex flex-col items-center justify-center w-1/4 py-1 relative">
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

          <button onClick={onLogout} className="group flex flex-col items-center justify-center w-1/4 py-1 relative">
            <LogOut size={22} className="text-slate-400 group-hover:text-red-500 transition-colors" />
            <span className="text-[10px] mt-1 text-slate-500 font-medium group-hover:text-red-500">Keluar</span>
          </button>

        </div>
      </div>
    </>
  );
}
