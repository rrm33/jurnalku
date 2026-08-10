"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAjuanMenunggu() {
  try {
    return await prisma.ajuanProfilSiswa.findMany({
      where: { status: "MENUNGGU" },
      include: {
        siswa: {
          select: { nama: true, nisn: true, kelas: { select: { nama: true } } }
        }
      },
      orderBy: { created_at: "asc" }
    });
  } catch (error) {
    console.error("Error getAjuanMenunggu:", error);
    return [];
  }
}

export async function getAllAjuanSiswa() {
  try {
    // Ambil langsung dari tabel ajuan agar pasti dapat datanya
    const ajuans = await prisma.ajuanProfilSiswa.findMany({
      include: {
        siswa: { select: { id: true, nama: true, nisn: true, kelas: { select: { nama: true } } } }
      },
      orderBy: { created_at: "desc" }
    });

    // Kelompokkan berdasarkan Siswa
    const studentMap = new Map();
    for (const aj of ajuans) {
      if (!aj.siswa) continue; // Skip jika siswa tidak ditemukan
      
      if (!studentMap.has(aj.siswa_id)) {
        studentMap.set(aj.siswa_id, {
          id: aj.siswa.id,
          nama: aj.siswa.nama,
          nisn: aj.siswa.nisn,
          kelas: aj.siswa.kelas,
          ajuanProfil: []
        });
      }
      
      // Bersihkan object siswa dari dalam aj untuk menghindari redundansi
      const { siswa, ...ajuanData } = aj;
      studentMap.get(aj.siswa_id).ajuanProfil.push(ajuanData);
    }

    const students = Array.from(studentMap.values());

    // Urutkan siswa: yang punya ajuan MENUNGGU ditaruh paling atas
    return students.sort((a, b) => {
      const aHasPending = a.ajuanProfil.some(aj => aj.status === "MENUNGGU");
      const bHasPending = b.ajuanProfil.some(aj => aj.status === "MENUNGGU");
      if (aHasPending && !bHasPending) return -1;
      if (!aHasPending && bHasPending) return 1;
      
      // Jika sama-sama punya atau tidak punya pending, urutkan berdasarkan ajuan terbaru
      const aLatest = a.ajuanProfil[0]?.created_at || 0;
      const bLatest = b.ajuanProfil[0]?.created_at || 0;
      return new Date(bLatest) - new Date(aLatest);
    });
  } catch (error) {
    console.error("Error getAllAjuanSiswa:", error);
    return [];
  }
}

export async function approveAjuan(ajuanId) {
  try {
    const ajuan = await prisma.ajuanProfilSiswa.findUnique({ where: { id: ajuanId } });
    if (!ajuan) throw new Error("Ajuan tidak ditemukan.");
    if (ajuan.status !== "MENUNGGU") throw new Error("Ajuan ini sudah diproses sebelumnya.");

    const dataPerubahan = JSON.parse(ajuan.data_perubahan);
    
    // Pastikan data_perubahan tidak menyimpan string literal "null" tapi benar-benar null JS
    const sanitizedData = {};
    for (const key in dataPerubahan) {
      sanitizedData[key] = dataPerubahan[key];
    }

    // Gunakan transaksi untuk update siswa dan ubah status ajuan
    await prisma.$transaction([
      prisma.siswa.update({
        where: { id: ajuan.siswa_id },
        data: sanitizedData
      }),
      prisma.ajuanProfilSiswa.update({
        where: { id: ajuanId },
        data: { status: "DISETUJUI" }
      })
    ]);

    revalidatePath("/beranda/master/ajuan-profil");
    revalidatePath("/beranda/master/siswa");
    
    return { success: true, message: "Ajuan disetujui, profil siswa berhasil diperbarui." };
  } catch (error) {
    console.error("Error approveAjuan:", error);
    
    // Penanganan khusus jika melanggar unique constraint (misal: email, nisn, nik sudah dipakai)
    if (error.code === 'P2002') {
      const field = error.meta?.target ? error.meta.target.join(', ') : 'Data unik';
      return { 
        success: false, 
        message: `Gagal menyetujui ajuan: ${field} yang diajukan sudah digunakan oleh siswa lain. Minta siswa untuk merevisi ajuannya.` 
      };
    }
    
    return { success: false, message: error.message || "Terjadi kesalahan saat menyetujui ajuan." };
  }
}

export async function rejectAjuan(ajuanId) {
  try {
    const ajuan = await prisma.ajuanProfilSiswa.findUnique({ where: { id: ajuanId } });
    if (!ajuan) throw new Error("Ajuan tidak ditemukan.");
    if (ajuan.status !== "MENUNGGU") throw new Error("Ajuan ini sudah diproses sebelumnya.");

    await prisma.ajuanProfilSiswa.update({
      where: { id: ajuanId },
      data: { status: "DITOLAK" }
    });

    revalidatePath("/beranda/master/ajuan-profil");
    return { success: true, message: "Ajuan berhasil ditolak." };
  } catch (error) {
    console.error("Error rejectAjuan:", error);
    return { success: false, message: error.message };
  }
}
