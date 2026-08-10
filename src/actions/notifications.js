"use server";

import { prisma } from "@/lib/prisma";

export async function getAdminNotifications() {
  try {
    const ajuanCount = await prisma.ajuanProfilSiswa.count({
      where: { status: "MENUNGGU" }
    });

    const penilaianCount = await prisma.pengumpulanTugas.count({
      where: { nilai: null }
    });

    return {
      ajuan: ajuanCount,
      penilaian: penilaianCount
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { ajuan: 0, penilaian: 0 };
  }
}
