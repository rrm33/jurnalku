"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPresensiData(rppId) {
  try {
    const id = parseInt(rppId);
    
    // 1. Dapatkan RPP untuk mengetahui kelasnya
    const rpp = await prisma.rpp.findUnique({
      where: { id },
      include: {
        kelas: true,
        mapel: true
      }
    });
    
    if (!rpp) return { success: false, message: "RPP tidak ditemukan" };
    
    // 2. Ambil semua siswa di kelas tersebut (Hanya yang Aktif)
    const siswaList = await prisma.siswa.findMany({
      where: { kelas_id: rpp.kelas_id, status: "Aktif" },
      orderBy: { nama: 'asc' }
    });
    
    // 3. Ambil data presensi yang sudah ada untuk RPP ini
    const existingPresensi = await prisma.presensi.findMany({
      where: { rpp_id: id }
    });
    
    // 4. Map data presensi ke siswa
    const resultSiswa = siswaList.map(siswa => {
      const presensi = existingPresensi.find(p => p.siswa_id === siswa.id);
      return {
        id: siswa.id,
        nama: siswa.nama,
        status: presensi ? presensi.status : null,
        keterangan: presensi ? (presensi.keterangan || "") : ""
      };
    });
    
    return { 
      success: true, 
      rpp: {
        pertemuan_ke: rpp.pertemuan_ke,
        judul: rpp.judul,
        mapel: rpp.mapel?.nama || "-",
        kelas: rpp.kelas?.nama || "-"
      },
      siswaList: resultSiswa 
    };
  } catch (error) {
    console.error("Error getPresensiData:", error);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

export async function savePresensi(rppId, presensiDataList) {
  try {
    const id = parseInt(rppId);
    
    // Menggunakan transaction agar aman
    await prisma.$transaction(async (tx) => {
      for (const data of presensiDataList) {
        if (!data.status) continue; // Jangan simpan jika status belum diisi
        
        const existing = await tx.presensi.findUnique({
          where: {
            rpp_id_siswa_id: {
              rpp_id: id,
              siswa_id: data.id
            }
          }
        });
        
        if (existing) {
          await tx.presensi.update({
            where: { id: existing.id },
            data: {
              status: data.status,
              keterangan: data.status === "Hadir" ? "" : data.keterangan
            }
          });
        } else {
          await tx.presensi.create({
            data: {
              rpp_id: id,
              siswa_id: data.id,
              status: data.status,
              keterangan: data.status === "Hadir" ? "" : data.keterangan
            }
          });
        }
      }
    });
    
    revalidatePath("/beranda");
    revalidatePath(`/beranda/presensi/${rppId}`);
    return { success: true };
  } catch (error) {
    console.error("Error savePresensi:", error);
    return { success: false, message: "Gagal menyimpan presensi" };
  }
}
