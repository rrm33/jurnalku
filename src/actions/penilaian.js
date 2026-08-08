"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

export async function getDaftarPenilaian() {
  noStore();
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return { success: false, message: "Unauthorized" };

    const parsed = JSON.parse(session.value);
    if (parsed.role !== "guru") return { success: false, message: "Access Denied" };

    const rppsWithTugas = await prisma.rpp.findMany({
      where: { 
        tugas: { some: {} },
        guru_id: parsed.id 
      },
      include: {
        kelas: true,
        mapel: true,
        tugas: {
          include: {
            pengumpulan: true
          }
        },
      },
      orderBy: { id: 'desc' }
    });

    const classIds = [...new Set(rppsWithTugas.map(r => r.kelas_id))];
    const classes = await prisma.kelas.findMany({
      where: { id: { in: classIds } },
      include: {
        _count: {
          select: { siswa: true }
        }
      }
    });
    
    const classMap = {};
    classes.forEach(c => classMap[c.id] = c._count.siswa);

    const formattedData = rppsWithTugas.map(rpp => {
      const tugas = rpp.tugas[0];
      const totalSiswa = classMap[rpp.kelas_id] || 0;
      const totalMengerjakan = tugas.pengumpulan.length;
      const totalDinilai = tugas.pengumpulan.filter(p => p.nilai !== null).length;
      
      return {
        id: rpp.id,
        tugas_judul: tugas.judul,
        mapel_nama: rpp.mapel?.nama,
        kelas_nama: rpp.kelas?.nama,
        deadline: tugas.deadline,
        totalSiswa,
        totalMengerjakan,
        totalDinilai
      };
    });

    return { success: true, data: formattedData };
  } catch (error) {
    console.error("Error getDaftarPenilaian:", error);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}


export async function getTugasDenganPenilaian(rppId) {
  noStore();
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return { success: false, message: "Unauthorized" };

    const parsed = JSON.parse(session.value);
    if (parsed.role !== "guru") return { success: false, message: "Access Denied" };

    const parsedRppId = parseInt(rppId);

    // Ambil data RPP dan Tugas terkait
    const rpp = await prisma.rpp.findUnique({
      where: { id: parsedRppId },
      include: {
        kelas: true,
        mapel: true,
        tugas: true
      }
    });

    if (!rpp) {
      return { success: false, message: "RPP tidak ditemukan" };
    }

    if (!rpp.tugas || rpp.tugas.length === 0) {
      return { success: true, data: { rpp, tugas: null, siswaList: [] } };
    }

    const tugasId = rpp.tugas[0].id;

    // Ambil semua siswa di kelas tersebut beserta data pengumpulan mereka (jika ada)
    const siswaList = await prisma.siswa.findMany({
      where: { kelas_id: rpp.kelas_id },
      orderBy: { nama: 'asc' },
      include: {
        pengumpulanTugas: {
          where: { tugas_id: tugasId }
        }
      }
    });

    return {
      success: true,
      data: {
        rpp,
        tugas: rpp.tugas[0],
        siswaList
      }
    };

  } catch (error) {
    console.error("Error getTugasDenganPenilaian:", error);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

export async function simpanNilaiMasal(tugasId, dataNilai) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return { success: false, message: "Unauthorized" };

    const parsed = JSON.parse(session.value);
    if (parsed.role !== "guru") return { success: false, message: "Access Denied" };

    const parsedTugasId = parseInt(tugasId);

    // Proses data secara masif (bulk/upsert)
    // dataNilai formatnya: [ { siswa_id: 1, nilai: 85 }, { siswa_id: 2, nilai: null } ]
    
    // Karena Prisma di Sqlite/MySQL tidak punya fungsi bulk upsert yang simpel dan aman untuk relasi ganda, 
    // kita akan loop satu-satu dalam transaction.
    
    const operations = dataNilai.map(item => {
      const pSiswaId = parseInt(item.siswa_id);
      let pNilai = null;
      
      // Jika kosong (string kosong) atau null, simpan sebagai null (belum dinilai)
      if (item.nilai !== null && item.nilai !== "" && item.nilai !== undefined) {
         pNilai = parseInt(item.nilai);
         // validasi max/min 
         if (pNilai < 0) pNilai = 0;
         if (pNilai > 100) pNilai = 100;
      }

      return prisma.pengumpulanTugas.upsert({
        where: {
          tugas_id_siswa_id: {
            tugas_id: parsedTugasId,
            siswa_id: pSiswaId
          }
        },
        update: {
          nilai: pNilai
        },
        create: {
          tugas_id: parsedTugasId,
          siswa_id: pSiswaId,
          nilai: pNilai
        }
      });
    });

    await prisma.$transaction(operations);

    return { success: true };

  } catch (error) {
    console.error("Error simpanNilaiMasal:", error);
    return { success: false, message: "Gagal menyimpan penilaian." };
  }
}
