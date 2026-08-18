"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Users, LogOut, FileText, User, Menu, X, Megaphone, Home, Map, CheckSquare, ClipboardList } from "lucide-react";
import DbIndicator from "@/components/DbIndicator";
import TeacherMobileNav from "@/components/TeacherMobileNav";
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

    const handleUpdate = () => fetchNotifs();
    window.addEventListener('refreshNotifs', handleUpdate);
    const interval = setInterval(fetchNotifs, 30000); // Poll every 30s
    return () => {
      window.removeEventListener('refreshNotifs', handleUpdate);
      clearInterval(interval);
    };
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
    <div className="flex flex-col md:flex-row relative w-full">
      
      {/* Topbar Mobile (Removed/Hidden in favor of bottom nav) */}
      <div className="hidden"></div>

      {/* Overlay Mobile (Removed) */}
      <div className="hidden"></div>

      {/* Sidebar Navigasi - Hidden on mobile */}
      <aside className={`hidden md:flex sticky top-0 left-0 z-50 w-64 bg-white border-r border-rose-50 shadow-sm flex-col h-screen`}>
        <div className="p-6 border-b border-rose-50/50 flex items-center justify-between bg-white relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <img src="/icon.png" alt="Logo Jurnalku" className="w-10 h-10 object-contain drop-shadow-sm" />
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
            <Map size={18} /> Maps Siswa
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
          
          <button onClick={() => handleNavigation("/beranda/leger")} className={getMenuClass("/beranda/leger")}>
            <ClipboardList size={18} /> Leger Nilai
          </button>

          <button onClick={() => handleNavigation("/beranda/chat")} className={getMenuClass("/beranda/chat")}>
            <Megaphone size={18} /> Pesan (Chat)
          </button>
        </nav>

        <div className="p-4 border-t border-rose-50 bg-white">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl mb-3 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
              G
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-slate-700">Akun Guru</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors border border-transparent hover:border-rose-100">
            <LogOut size={18} /> Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-2 md:p-4 w-full min-h-screen">
        {children}
      </main>

      {/* Bottom Nav for Mobile */}
      <TeacherMobileNav notifications={notifications} onLogout={handleLogout} />
    </div>
  );
}
