"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

export async function getNewTugasCount() {
  noStore();
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return 0;
    
    const parsed = JSON.parse(session.value);
    if (parsed.role !== "siswa") return 0;
    
    const siswaId = parseInt(parsed.id);

    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      select: { kelas_id: true }
    });

    if (!siswa) return 0;

    const newTugasCount = await prisma.tugas.count({
      where: {
        rpp: {
          kelas_id: siswa.kelas_id,
          // filter is_active true diganti di JS atau diabaikan khusus count ini
        },
        pengumpulan: {
          none: {
            siswa_id: siswaId
          }
        },
        OR: [
          { deadline: { gte: new Date() } },
          { deadline: null }
        ]
      }
    });

    return newTugasCount;
  } catch (error) {
    console.error("Error getNewTugasCount:", error);
    return 0;
  }
}

export async function getKbmSiswa() {
  noStore();
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return [];
    
    const parsed = JSON.parse(session.value);
    if (parsed.role !== "siswa") return [];
    const siswaId = parseInt(parsed.id);

    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      select: { kelas_id: true }
    });

    if (!siswa) return [];

    // Ambil seluruh RPP untuk kelas siswa ini
    const kbmList = await prisma.rpp.findMany({
      where: {
        kelas_id: siswa.kelas_id,
      },
      include: {
        mapel: true,
        guru: true,
        tugas: {
          include: {
            pengumpulan: {
              where: {
                siswa_id: siswaId
              }
            }
          }
        }
      },
      orderBy: { id: "desc" }
    });

    // Filter di JavaScript (Hanya RPP yang is_active !== false)
    return kbmList.filter(kbm => kbm.is_active !== false);
  } catch (error) {
    console.error("Error getKbmSiswa:", error);
    return [{ isError: true, message: error.message }];
  }
}

export async function getKbmStatsSiswa() {
  noStore();
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return null;
    
    const parsed = JSON.parse(session.value);
    if (parsed.role !== "siswa") return null;
    const siswaId = parseInt(parsed.id);

    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      select: { kelas_id: true }
    });

    if (!siswa) return null;

    const totalKbm = await prisma.rpp.count({
      where: { kelas_id: siswa.kelas_id, is_active: true }
    });

    const totalTugasTersedia = await prisma.tugas.count({
      where: { rpp: { kelas_id: siswa.kelas_id, is_active: true } }
    });

    const totalTugasSelesai = await prisma.pengumpulanTugas.count({
      where: { siswa_id: siswaId }
    });

    const totalTugasBelum = totalTugasTersedia - totalTugasSelesai;

    return { totalKbm, totalTugasTersedia, totalTugasSelesai, totalTugasBelum };
  } catch (error) {
    console.error("Error getKbmStatsSiswa:", error);
    return null;
  }
}

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function submitTugas(formDataPayload) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return { success: false, message: "Sesi tidak valid." };
    
    const parsed = JSON.parse(session.value);
    if (parsed.role !== "siswa") return { success: false, message: "Akses ditolak." };
    const siswaId = parseInt(parsed.id);

    const tugas_id = parseInt(formDataPayload.get('tugas_id'));
    const input_jawaban = formDataPayload.get('input_jawaban');
    
    const file = formDataPayload.get('upload_file');
    let filePath = null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `jawaban_${siswaId}_${tugas_id}_${Date.now()}_${file.name.replace(/\\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/jawaban');
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      filePath = `/uploads/jawaban/${filename}`;
    }

    // Cek apakah tugas masih ada atau sudah melewati deadline?
    const tugas = await prisma.tugas.findUnique({ where: { id: tugas_id } });
    if (!tugas) return { success: false, message: "Tugas tidak ditemukan." };
    if (tugas.deadline && new Date() > new Date(tugas.deadline)) {
       return { success: false, message: "Tugas sudah melewati batas waktu." };
    }

    const existingPengumpulan = await prisma.pengumpulanTugas.findFirst({
      where: { tugas_id, siswa_id: siswaId }
    });

    if (existingPengumpulan) {
      if (existingPengumpulan.nilai !== null) {
        return { success: false, message: "Jawaban sudah dinilai oleh guru dan tidak dapat diubah." };
      }
      await prisma.pengumpulanTugas.update({
        where: { id: existingPengumpulan.id },
        data: {
          input_jawaban,
          ...(filePath && { upload_file: filePath })
        }
      });
    } else {
      await prisma.pengumpulanTugas.create({
        data: {
          input_jawaban,
          upload_file: filePath,
          tugas_id,
          siswa_id: siswaId
        }
      });
    }

    revalidatePath("/beranda-siswa", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error submitTugas:", error);
    return { success: false, message: "Gagal menyimpan jawaban." };
  }
}
