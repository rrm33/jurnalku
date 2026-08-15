"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, FileText, CheckSquare, Users, Menu, X, Map, BookOpen, ClipboardList, LogOut, Megaphone } from "lucide-react";

export default function TeacherMobileNav({ notifications, onLogout }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleNav = (path) => {
    setIsMoreOpen(false);
    router.push(path);
  };

  const isActive = (path) => {
    if (path === "/beranda") return pathname === "/beranda";
    return pathname.startsWith(path);
  };

  const getIconClass = (path) => {
    return isActive(path) 
      ? "text-rose-600 scale-110 transition-all duration-300 drop-shadow-md" 
      : "text-slate-400 group-hover:text-rose-400 transition-all duration-300";
  };

  const getLabelClass = (path) => {
    return isActive(path)
      ? "text-rose-600 font-bold opacity-100"
      : "text-slate-500 font-medium opacity-80 group-hover:opacity-100";
  };

  return (
    <>
      {/* Spacer to prevent content from hiding behind the bottom nav */}
      <div className="h-20 md:hidden w-full" />

      {/* Main Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200/50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 px-2 pb-safe pt-2">
        <div className="flex justify-between items-center max-w-md mx-auto">
          
          <button onClick={() => handleNav("/beranda")} className="group flex flex-col items-center justify-center w-1/5 py-1 relative">
            <Home size={22} className={getIconClass("/beranda")} strokeWidth={isActive("/beranda") ? 2.5 : 2} />
            <span className={`text-[10px] mt-1 ${getLabelClass("/beranda")}`}>Home</span>
            {isActive("/beranda") && <span className="absolute -top-2 w-8 h-1 bg-rose-500 rounded-b-full"></span>}
          </button>

          <button onClick={() => handleNav("/beranda/rpp")} className="group flex flex-col items-center justify-center w-1/5 py-1 relative">
            <FileText size={22} className={getIconClass("/beranda/rpp")} strokeWidth={isActive("/beranda/rpp") ? 2.5 : 2} />
            <span className={`text-[10px] mt-1 ${getLabelClass("/beranda/rpp")}`}>RPP</span>
            {isActive("/beranda/rpp") && <span className="absolute -top-2 w-8 h-1 bg-rose-500 rounded-b-full"></span>}
          </button>

          <button onClick={() => handleNav("/beranda/penilaian")} className="group flex flex-col items-center justify-center w-1/5 py-1 relative">
            <div className="relative">
              <CheckSquare size={22} className={getIconClass("/beranda/penilaian")} strokeWidth={isActive("/beranda/penilaian") ? 2.5 : 2} />
              {notifications?.penilaian > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm animate-pulse">
                  {notifications.penilaian}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-1 ${getLabelClass("/beranda/penilaian")}`}>Penilai</span>
            {isActive("/beranda/penilaian") && <span className="absolute -top-2 w-8 h-1 bg-rose-500 rounded-b-full"></span>}
          </button>

          <button onClick={() => handleNav("/beranda/master/siswa")} className="group flex flex-col items-center justify-center w-1/5 py-1 relative">
            <Users size={22} className={getIconClass("/beranda/master/siswa")} strokeWidth={isActive("/beranda/master/siswa") ? 2.5 : 2} />
            <span className={`text-[10px] mt-1 ${getLabelClass("/beranda/master/siswa")}`}>Siswa</span>
            {isActive("/beranda/master/siswa") && <span className="absolute -top-2 w-8 h-1 bg-rose-500 rounded-b-full"></span>}
          </button>

          <button onClick={() => setIsMoreOpen(true)} className="group flex flex-col items-center justify-center w-1/5 py-1 relative">
            <div className="relative">
              <Menu size={22} className="text-slate-400 group-hover:text-rose-400 transition-colors" />
              {notifications?.ajuan > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </div>
            <span className="text-[10px] mt-1 text-slate-500 font-medium">Lainnya</span>
          </button>

        </div>
      </div>

      {/* More Bottom Sheet */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setIsMoreOpen(false)}></div>
          
          <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-full duration-300 ease-out flex flex-col max-h-[85vh]">
            <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setIsMoreOpen(false)}>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
            </div>
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-lg">Menu Lainnya</h2>
              <button onClick={() => setIsMoreOpen(false)} className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 pb-safe">
              
              <button onClick={() => handleNav("/beranda/informasi")} className="w-full flex items-center gap-4 px-4 py-3 bg-slate-50 hover:bg-rose-50 rounded-2xl transition-colors text-left">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-500">
                  <Megaphone size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-700 text-sm">Informasi</h3>
                  <p className="text-xs text-slate-500">Papan pengumuman</p>
                </div>
              </button>

              <button onClick={() => handleNav("/beranda/master/ajuan-profil")} className="w-full flex items-center gap-4 px-4 py-3 bg-slate-50 hover:bg-rose-50 rounded-2xl transition-colors text-left">
                <div className="relative w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-500">
                  <ClipboardList size={18} />
                  {notifications?.ajuan > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-700 text-sm">Ajuan Profil</h3>
                  <p className="text-xs text-slate-500">Perubahan data siswa</p>
                </div>
                {notifications?.ajuan > 0 && (
                  <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">
                    {notifications.ajuan} Baru
                  </span>
                )}
              </button>

              <button onClick={() => handleNav("/beranda/maps")} className="w-full flex items-center gap-4 px-4 py-3 bg-slate-50 hover:bg-rose-50 rounded-2xl transition-colors text-left">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-500">
                  <Map size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-700 text-sm">Maps Siswa</h3>
                  <p className="text-xs text-slate-500">Peta lokasi tempat tinggal</p>
                </div>
              </button>

              <button onClick={() => handleNav("/beranda/master/kelas")} className="w-full flex items-center gap-4 px-4 py-3 bg-slate-50 hover:bg-rose-50 rounded-2xl transition-colors text-left">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-500">
                  <BookOpen size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-700 text-sm">Data Kelas</h3>
                  <p className="text-xs text-slate-500">Manajemen rombongan belajar</p>
                </div>
              </button>

              <button onClick={() => handleNav("/beranda/master/mapel")} className="w-full flex items-center gap-4 px-4 py-3 bg-slate-50 hover:bg-rose-50 rounded-2xl transition-colors text-left">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-500">
                  <BookOpen size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-700 text-sm">Mata Pelajaran</h3>
                  <p className="text-xs text-slate-500">Manajemen mapel diampu</p>
                </div>
              </button>

              <button onClick={() => handleNav("/beranda/master/tahun-pelajaran")} className="w-full flex items-center gap-4 px-4 py-3 bg-slate-50 hover:bg-rose-50 rounded-2xl transition-colors text-left">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-500">
                  <BookOpen size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-700 text-sm">Tahun Pelajaran</h3>
                  <p className="text-xs text-slate-500">Pengaturan semester aktif</p>
                </div>
              </button>

              <div className="h-4 border-b border-slate-100 mb-4"></div>

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
