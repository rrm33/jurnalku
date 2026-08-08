"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Database, ServerCrash } from "lucide-react";
import { checkConnection, getSiswaTanpaPassword, loginGuru, seedDummyGuru, loginSiswa, loginSiswaTanpaPassword } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("guru"); // "guru" or "siswa"
  const [dbStatus, setDbStatus] = useState("checking");
  const [siswaTanpaPassword, setSiswaTanpaPassword] = useState([]);

  // Form states Guru
  const [nip, setNip] = useState("");
  const [passwordGuru, setPasswordGuru] = useState("");

  // Form states Siswa
  const [nisnSiswa, setNisnSiswa] = useState("");
  const [passwordSiswa, setPasswordSiswa] = useState("");
  const [searchSiswa, setSearchSiswa] = useState("");

  useEffect(() => {
    // 1. Cek Koneksi DB
    const initData = async () => {
      const conn = await checkConnection();
      setDbStatus(conn.status);
      
      if (conn.status === "connected") {
        // Seed dummy guru (hanya untuk testing agar bisa login)
        await seedDummyGuru();

        // Ambil daftar siswa tanpa password
        const resSiswa = await getSiswaTanpaPassword();
        if (resSiswa.success) {
          setSiswaTanpaPassword(resSiswa.data);
        }
      }
    };
    initData();
  }, []);

  const handleLoginGuru = async (e) => {
    e.preventDefault();
    if (dbStatus !== "connected") {
      return Swal.fire("Database Error", "Tidak terhubung ke database", "error");
    }

    Swal.fire({
      title: "Memproses...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const res = await loginGuru(nip, passwordGuru);

    if (res.success) {
      Swal.fire({
        title: "Berhasil!",
        text: `Selamat datang, ${res.data.nama}`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        router.push("/beranda");
      });
    } else {
      Swal.fire("Login Gagal", res.message, "error");
    }
  };

  const handleLoginSiswa = async (e) => {
    e.preventDefault();
    if (dbStatus !== "connected") return Swal.fire("Database Error", "Tidak terhubung ke database", "error");

    Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const res = await loginSiswa(nisnSiswa, passwordSiswa);
    
    if (res.success) {
      Swal.fire({ title: "Berhasil!", text: `Selamat datang, ${res.data.nama}`, icon: "success", timer: 1500, showConfirmButton: false }).then(() => {
        router.push("/beranda-siswa");
      });
    } else {
      Swal.fire("Login Gagal", res.message, "error");
    }
  };

  const handleLoginInstan = async (siswaId, nama) => {
    Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const res = await loginSiswaTanpaPassword(siswaId);
    
    if (res.success) {
      Swal.fire({ title: "Berhasil!", text: `Halo ${nama}, silakan atur password Anda.`, icon: "success", timer: 1500, showConfirmButton: false }).then(() => {
        router.push("/beranda-siswa");
      });
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  const filteredSiswa = siswaTanpaPassword.filter(s => s.nama.toLowerCase().includes(searchSiswa.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center relative p-4">
      {/* Indikator Koneksi Database */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
        {dbStatus === "checking" && <span className="text-yellow-500 text-sm font-medium animate-pulse">Checking DB...</span>}
        {dbStatus === "connected" && (
          <>
            <Database size={16} className="text-green-500" />
            <span className="text-green-600 text-xs font-bold tracking-wide uppercase">DB Connected</span>
          </>
        )}
        {dbStatus === "error" && (
          <>
            <ServerCrash size={16} className="text-red-500" />
            <span className="text-red-600 text-xs font-bold tracking-wide uppercase">DB Offline</span>
          </>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Jurnal Mengajar</h1>
          <p className="text-gray-500 mt-2 font-medium">Silakan masuk ke akun Anda</p>
        </div>

        {/* Toggle Role */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8 relative">
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow transition-all duration-300 ease-in-out ${role === 'guru' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
          />
          <button
            onClick={() => setRole("guru")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors relative z-10 ${
              role === "guru" ? "text-rose-700" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Guru
          </button>
          <button
            onClick={() => setRole("siswa")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors relative z-10 ${
              role === "siswa" ? "text-rose-700" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Siswa
          </button>
        </div>

        {/* Form Guru */}
        {role === "guru" ? (
          <form onSubmit={handleLoginGuru} className="space-y-5 animate-in fade-in duration-300">
            <div className="mb-4 text-xs text-rose-600 bg-rose-50 p-2 rounded">
              Gunakan NIP: <b>123456789</b> dan Password: <b>password123</b> untuk testing.
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">NIP Guru</label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Masukkan NIP Anda"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={passwordGuru}
                onChange={(e) => setPasswordGuru(e.target.value)}
                placeholder="Masukkan Password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-rose-600 text-white py-3 rounded-xl hover:bg-rose-700 transition-colors font-bold shadow-lg shadow-rose-200 mt-2"
            >
              Masuk sebagai Guru
            </button>
          </form>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Form Siswa */}
            <form onSubmit={handleLoginSiswa} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">NISN Siswa</label>
                <input
                  type="text"
                  value={nisnSiswa}
                  onChange={e => setNisnSiswa(e.target.value)}
                  placeholder="Masukkan NISN Anda"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={passwordSiswa}
                  onChange={e => setPasswordSiswa(e.target.value)}
                  placeholder="Masukkan Password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-bold shadow-lg shadow-green-200 mt-2"
              >
                Masuk sebagai Siswa
              </button>
            </form>

            {/* Daftar Siswa Tanpa Password */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Belum atur password? Cari nama Anda:
              </h3>
              
              <input 
                type="text" 
                value={searchSiswa}
                onChange={e => setSearchSiswa(e.target.value)}
                placeholder="Ketik nama Anda di sini..." 
                className="w-full px-3 py-2 mb-3 text-sm border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
              />

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 pb-1">
                {filteredSiswa.map((siswa) => (
                  <button
                    key={siswa.id}
                    onClick={() => handleLoginInstan(siswa.id, siswa.nama)}
                    className="w-full text-left px-4 py-3 border border-gray-100 rounded-xl hover:border-orange-200 hover:bg-orange-50 transition-all flex justify-between items-center group shadow-sm"
                  >
                    <span className="font-semibold text-gray-700 group-hover:text-orange-700">{siswa.nama}</span>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md uppercase tracking-wider">Pilih</span>
                  </button>
                ))}
                {filteredSiswa.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Belum ada data siswa tanpa password.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
