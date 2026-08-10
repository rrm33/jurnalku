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
    return { success: false, message: error.message };
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
