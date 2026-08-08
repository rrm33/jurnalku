"use client";

import { useState, useEffect } from "react";
import { getDashboardStats } from "@/actions/dashboard";
import { 
  Users, BookOpen, Layers, FileText, TrendingUp 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardBeranda() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const res = await getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp className="text-emerald-500" size={32} />
          Dashboard Utama
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Ringkasan statistik data aplikasi Jurnal Mengajar Anda.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Siswa</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalSiswa}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Layers size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Kelas</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalKelas}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <BookOpen size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mata Pelajaran</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalMapel}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Dokumen RPP</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalRpp}</h3>
          </div>
        </div>
      </div>

      <div className="pt-2 pb-2">
        <h3 className="text-xl font-bold text-slate-800 border-l-4 border-pink-500 pl-3">Statistik Pengerjaan Tugas</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 p-5 rounded-2xl border border-pink-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-2">Total Tugas Dibuat</p>
          <h3 className="text-4xl font-black text-pink-700">{stats.totalTugas}</h3>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Siswa Aktif Mengerjakan</p>
          <h3 className="text-4xl font-black text-emerald-700">{stats.totalSiswaMengerjakan}</h3>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-5 rounded-2xl border border-rose-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">Siswa Belum Mengerjakan</p>
          <h3 className="text-4xl font-black text-rose-700">{stats.totalSiswaBelumMengerjakan}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Pengumpulan</p>
          <h3 className="text-2xl font-black text-slate-700">{stats.totalPengumpulan}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tugas Telah Dinilai</p>
          <h3 className="text-2xl font-black text-emerald-600">{stats.totalDinilai}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menunggu Penilaian</p>
          <h3 className="text-2xl font-black text-amber-500">{stats.totalBelumDinilai}</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart - Siswa per Kelas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribusi Siswa per Kelas</h3>
          <div className="h-[300px] w-full">
            {stats.siswaPerKelas.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.siswaPerKelas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">Belum ada data kelas</div>
            )}
          </div>
        </div>

        {/* Pie Chart - RPP per Mapel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Sebaran RPP Berdasarkan Mata Pelajaran</h3>
          <div className="h-[300px] w-full flex justify-center">
            {stats.rppPerMapel.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.rppPerMapel}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.rppPerMapel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">Belum ada dokumen RPP</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
