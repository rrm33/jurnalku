"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export async function getDashboardStats() {
  noStore();
  try {
    const totalSiswa = await prisma.siswa.count();
    const totalKelas = await prisma.kelas.count();
    const totalMapel = await prisma.mapel.count();
    const totalRpp = await prisma.rpp.count();
    
    const totalTugas = await prisma.tugas.count();
    const totalPengumpulan = await prisma.pengumpulanTugas.count();
    const totalDinilai = await prisma.pengumpulanTugas.count({
      where: { nilai: { not: null } }
    });
    const totalBelumDinilai = totalPengumpulan - totalDinilai;
    
    // Perkiraan total ekspektasi pengumpulan: jumlah tugas dikali jumlah siswa di kelas yang bersangkutan.
    // Atau untuk mudahnya:
    // Total Siswa Mengerjakan = DISTINCT siswa_id dari PengumpulanTugas
    const siswaMengerjakanAgg = await prisma.pengumpulanTugas.groupBy({
      by: ['siswa_id'],
    });
    const totalSiswaMengerjakan = siswaMengerjakanAgg.length;
    // Siswa belum mengerjakan = Total Siswa - Siswa yang pernah ngerjain tugas (meski ini simplifikasi)
    const totalSiswaBelumMengerjakan = totalSiswa - totalSiswaMengerjakan;

    // Chart 1: Siswa per kelas
    const kelasData = await prisma.kelas.findMany({
      select: {
        nama: true,
        _count: {
          select: { siswa: true }
        }
      },
      orderBy: { nama: 'asc' }
    });

    const siswaPerKelas = kelasData.map(k => ({
      name: k.nama,
      total: k._count.siswa
    }));

    // Chart 2: RPP per mapel
    const mapelData = await prisma.mapel.findMany({
      select: {
        nama: true,
        _count: {
          select: { rpps: true }
        }
      }
    });

    const rppPerMapel = mapelData.map(m => ({
      name: m.nama,
      value: m._count.rpps
    })).filter(m => m.value > 0);

    return {
      success: true,
      data: {
        totalSiswa,
        totalKelas,
        totalMapel,
        totalRpp,
        totalTugas,
        totalPengumpulan,
        totalDinilai,
        totalBelumDinilai,
        totalSiswaMengerjakan,
        totalSiswaBelumMengerjakan,
        siswaPerKelas,
        rppPerMapel
      }
    };
  } catch (error) {
    console.error("Error getDashboardStats:", error);
    return { success: false, message: error.message };
  }
}
