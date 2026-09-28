"use server";

import prisma from "@/lib/prisma";
import { getUserSession } from "./auth";

export async function getBroadcasts(guruId) {
  try {
    const broadcasts = await prisma.broadcast.findMany({
      where: { guru_id: guruId },
      orderBy: { createdAt: 'desc' },
      include: {
        reads: true,
      }
    });

    const totalSiswa = await prisma.siswa.count({
      where: { status: "Aktif" }
    });

    return { 
      success: true, 
      data: broadcasts.map(b => ({
        id: b.id,
        judul: b.judul,
        pesan: b.pesan,
        createdAt: b.createdAt,
        readCount: b.reads.length,
        totalSiswa
      }))
    };
  } catch (error) {
    console.error("Error get broadcasts:", error);
    return { success: false, error: "Gagal mengambil data broadcast" };
  }
}

export async function sendBroadcast(judul, pesan) {
  try {
    const session = await getUserSession();
    if (!session || session.role !== 'guru') {
      return { success: false, error: "Unauthorized" };
    }

    const broadcast = await prisma.broadcast.create({
      data: {
        judul,
        pesan,
        guru_id: session.id
      }
    });

    return { success: true, data: broadcast };
  } catch (error) {
    console.error("Error send broadcast:", error);
    return { success: false, error: "Gagal mengirim broadcast" };
  }
}

export async function getUnreadBroadcastsForSiswa() {
  try {
    const session = await getUserSession();
    if (!session || session.role !== 'siswa') {
      return { success: false, error: "Unauthorized" };
    }

    // Get all broadcasts the student hasn't read yet
    const unreadBroadcasts = await prisma.broadcast.findMany({
      where: {
        NOT: {
          reads: {
            some: {
              siswa_id: session.id
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }, // show oldest unread first
      include: {
        guru: {
          select: { nama: true }
        }
      }
    });

    return { success: true, data: unreadBroadcasts };
  } catch (error) {
    console.error("Error get unread broadcasts:", error);
    return { success: false, error: "Gagal mengambil pesan" };
  }
}

export async function markBroadcastAsRead(broadcastId) {
  try {
    const session = await getUserSession();
    if (!session || session.role !== 'siswa') return { success: false };

    await prisma.broadcastRead.upsert({
      where: {
        broadcast_id_siswa_id: {
          broadcast_id: broadcastId,
          siswa_id: session.id
        }
      },
      update: {},
      create: {
        broadcast_id: broadcastId,
        siswa_id: session.id
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking read:", error);
    return { success: false };
  }
}

export async function getAllBroadcastsForSiswa() {
  try {
    const session = await getUserSession();
    if (!session || session.role !== 'siswa') {
      return { success: false, error: "Unauthorized" };
    }

    const broadcasts = await prisma.broadcast.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        guru: {
          select: { nama: true }
        },
        reads: {
          where: { siswa_id: session.id }
        }
      }
    });

    return { success: true, data: broadcasts };
  } catch (error) {
    console.error("Error get all broadcasts:", error);
    return { success: false, error: "Gagal mengambil data pesan" };
  }
}
