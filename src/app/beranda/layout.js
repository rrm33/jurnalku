"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Users, LogOut, FileText, User, Menu, X, Megaphone, Home, Map, CheckSquare, ClipboardList } from "lucide-react";
import DbIndicator from "@/components/DbIndicator";
import { logout } from "@/actions/auth";
import { getAdminNotifications } from "@/actions/notifications";
import Swal from "sweetalert2";

export default function BerandaLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState({ ajuan: 0, penilaian: 0 });

  useEffect(() => {
    async function fetchNotifs() {
      const data = await getAdminNotifications();
      if (data) {
        setNotifications(data);
        
        // Tampilkan modal info jika berada di beranda dan ada notifikasi
        if (pathname === "/beranda" && (data.ajuan > 0 || data.penilaian > 0)) {
          let msg = [];
          if (data.penilaian > 0) msg.push(`<b>${data.penilaian}</b> tugas menunggu dinilai`);
          if (data.ajuan > 0) msg.push(`<b>${data.ajuan}</b> ajuan profil`);
          
          Swal.fire({
            title: 'Informasi Baru!',
            html: `Saat ini terdapat:<br><br>${msg.join('<br>')}`,
            icon: 'info',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Tutup'
          });
        }
      }
    }
    fetchNotifs();
  }, [pathname]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda akan keluar dari sesi ini.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar!',
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

  const isActive = (path) => {
    if (path === "/beranda") {
      return pathname === "/beranda"; // Khusus beranda (daftar RPP)
    }
    return pathname.startsWith(path);
  };

  const getMenuClass = (path) => {
    return isActive(path) 
      ? "w-full flex items-center gap-3 px-4 py-3 bg-rose-50 text-rose-600 rounded-xl font-semibold transition-all border-l-4 border-rose-300 rounded-l-none"
      : "w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-rose-50/50 hover:text-rose-400 rounded-xl font-medium transition-colors border-l-4 border-transparent rounded-l-none";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      
      {/* Topbar Mobile */}
      <div className="md:hidden bg-white border-b border-rose-50 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-500">
            <BookOpen size={16} />
          </div>
          <span className="font-bold text-slate-700 tracking-wide">Jurnal Mengajar</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-rose-400 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-40 md:hidden animate-in fade-in backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigasi */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 w-72 md:w-64 bg-white border-r border-rose-50 shadow-xl md:shadow-sm flex flex-col h-screen transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 border-b border-rose-50/50 flex items-center justify-between bg-white relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-400 border border-rose-100">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-700 text-lg leading-tight tracking-wide">Jurnal</h1>
              <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-widest">Mengajar Pro</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-rose-300 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-colors relative z-10">
            <X size={20} />
          </button>
        </div>

        <DbIndicator />
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto styled-scrollbar">
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3 mt-2 px-4">Menu Utama</div>
          <button onClick={() => handleNavigation("/beranda")} className={getMenuClass("/beranda")}>
            <Home size={18} /> Beranda
          </button>

          <button onClick={() => handleNavigation("/beranda/rpp")} className={getMenuClass("/beranda/rpp")}>
            <FileText size={18} /> Daftar RPP
          </button>
          
          <button onClick={() => handleNavigation("/beranda/penilaian")} className={`${getMenuClass("/beranda/penilaian")} justify-between`}>
            <div className="flex items-center gap-3">
              <CheckSquare size={18} /> Penilaian
            </div>
            {notifications.penilaian > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                {notifications.penilaian}
              </span>
            )}
          </button>
          
          <button onClick={() => handleNavigation("/beranda/informasi")} className={getMenuClass("/beranda/informasi")}>
            <Megaphone size={18} /> Informasi
          </button>

          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3 mt-8 px-4">Master Data</div>
          
          <button onClick={() => handleNavigation("/beranda/master/siswa")} className={getMenuClass("/beranda/master/siswa")}>
            <Users size={18} /> Data Siswa
          </button>
          
          <button onClick={() => handleNavigation("/beranda/master/ajuan-profil")} className={`${getMenuClass("/beranda/master/ajuan-profil")} justify-between`}>
            <div className="flex items-center gap-3">
              <ClipboardList size={18} /> Ajuan Profil
            </div>
            {notifications.ajuan > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                {notifications.ajuan}
              </span>
            )}
          </button>
          
          <button onClick={() => handleNavigation("/beranda/maps")} className={getMenuClass("/beranda/maps")}>
            <Map size={18} /> Peta Persebaran
          </button>
          
          <button onClick={() => handleNavigation("/beranda/master/kelas")} className={getMenuClass("/beranda/master/kelas")}>
            <BookOpen size={18} /> Data Kelas
          </button>

          <button onClick={() => handleNavigation("/beranda/master/mapel")} className={getMenuClass("/beranda/master/mapel")}>
            <BookOpen size={18} /> Mata Pelajaran
          </button>

          <button onClick={() => handleNavigation("/beranda/master/tahun-pelajaran")} className={getMenuClass("/beranda/master/tahun-pelajaran")}>
            <BookOpen size={18} /> Tahun Pelajaran
          </button>
        </nav>

        <div className="p-4 border-t border-rose-50/50 bg-white">
          <button 
            onClick={() => handleNavigation("/beranda/profil")}
            className="w-full flex items-center text-left gap-3 px-4 py-3 bg-white hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl mb-3 transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 font-bold shrink-0 group-hover:bg-rose-100 transition-colors">
              G
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-rose-600 transition-colors">Guru Testing</p>
              <p className="text-xs text-slate-400 truncate group-hover:text-rose-400 transition-colors">Lihat Profil</p>
            </div>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl font-medium transition-colors">
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
