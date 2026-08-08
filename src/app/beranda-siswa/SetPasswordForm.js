"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { setSiswaPassword } from "@/actions/auth";
import { Lock, AlertTriangle } from "lucide-react";

export default function SetPasswordForm({ siswaId, nama }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return Swal.fire("Password Lemah", "Password minimal 6 karakter.", "warning");
    }

    if (password !== confirmPassword) {
      return Swal.fire("Tidak Cocok", "Konfirmasi password tidak sama.", "error");
    }

    Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    const res = await setSiswaPassword(siswaId, password);
    if (res.success) {
      Swal.fire("Berhasil!", "Password Anda berhasil dibuat. Selamat datang di Beranda Siswa!", "success").then(() => {
        router.refresh(); // Refresh halaman agar layout memuat ulang status session
      });
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  if (!isOpen) {
    return (
      <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-orange-800">Akun Belum Aman!</h3>
            <p className="text-sm text-orange-600 mt-1">Anda belum mengatur password. Silakan atur agar akun Anda lebih aman.</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(true)} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-200 transition-colors w-full md:w-auto">
          Atur Password Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>
        
        <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={32} />
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Perhatian</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">Halo <b className="text-slate-700">{nama}</b>, kami menyarankan Anda untuk segera membuat password agar akun lebih aman.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password Baru</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium"
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Konfirmasi Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium"
              placeholder="Ulangi password di atas"
            />
          </div>
          
          <div className="pt-2">
            <button type="submit" className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-colors">
              Simpan Password
            </button>
            <button type="button" onClick={() => setIsOpen(false)} className="w-full mt-3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors">
              Lewati untuk Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
