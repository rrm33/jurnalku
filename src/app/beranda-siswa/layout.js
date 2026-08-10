"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LogOut, Home, ClipboardList, User, Menu, X } from "lucide-react";
import DbIndicator from "@/components/DbIndicator";
import { logout } from "@/actions/auth";
import { getNewTugasCount } from "@/actions/tugas-siswa";
import { getAjuanStatusSiswa } from "@/actions/profil-siswa";
import Swal from "sweetalert2";

export default function BerandaSiswaLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newTugasCount, setNewTugasCount] = useState(0);
  const [ajuanStatus, setAjuanStatus] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const count = await getNewTugasCount();
      setNewTugasCount(count);
      
      const ajuanInfo = await getAjuanStatusSiswa();
      setAjuanStatus(ajuanInfo?.status || null);
    }
    fetchData();
  }, [pathname]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar?',
      text: "Anda akan keluar dari Dasbor Siswa.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
        router.push("/login");
      }
    });
  };

  const handleNavigation = (path) => {
    setIsSidebarOpen(false);
    router.push(path);
  };

  const isActive = (path) => pathname === path;

  const getMenuClass = (path) => {
    return isActive(path) 
      ? "w-full flex items-center gap-3 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl font-medium transition-colors"
      : "w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      
      {/* Topbar Mobile */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
            <BookOpen size={16} />
          </div>
          <span className="font-bold text-slate-800">Siswa Area</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 bg-slate-100 rounded-lg">
          <Menu size={20} />
        </button>
      </div>

      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigasi Siswa */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 w-72 md:w-64 bg-white border-r border-slate-200 shadow-xl md:shadow-sm flex flex-col h-screen transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-green-200">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight">Jurnal</h1>
              <p className="text-xs text-slate-500">Siswa Area</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <DbIndicator />
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2 px-4">Menu Siswa</div>
          <button onClick={() => handleNavigation("/beranda-siswa")} className={getMenuClass("/beranda-siswa")}>
            <Home size={18} /> Beranda
          </button>
          
          <button onClick={() => handleNavigation("/beranda-siswa/tugas")} className={`${getMenuClass("/beranda-siswa/tugas")} justify-between`}>
            <div className="flex items-center gap-3">
              <ClipboardList size={18} /> Kegiatan KBM
            </div>
            {newTugasCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                {newTugasCount}
              </span>
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 bg-white">
          <button 
            onClick={() => handleNavigation("/beranda-siswa/profil")}
            className="w-full flex items-center text-left gap-3 px-4 py-3 bg-slate-50 hover:bg-green-50 hover:ring-1 ring-green-100 rounded-xl mb-3 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-green-700">Akun Siswa</p>
              <p className="text-xs text-slate-500 truncate group-hover:text-green-500">Lihat Profil</p>
            </div>
            {ajuanStatus === 'DITOLAK' && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shrink-0">
                !
              </span>
            )}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors">
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
