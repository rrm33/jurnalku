"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

// Mengambil RPP berdasarkan Guru (sementara Guru ID hardcoded ke 1 atau dipassing)
export async function getRpps(guruId = 1) {
  try {
    return await prisma.rpp.findMany({
      where: { guru_id: guruId },
      include: {
        kelas: true,
        mapel: true,
        tahun_pelajaran: true,
        tugas: true
      },
      orderBy: { pertemuan_ke: "desc" },
    });
  } catch (error) {
    console.error("Error getRpps:", error);
    return [];
  }
}

export async function saveRpp(formDataPayload, guruId = 1) {
  try {
    // Cari tahun pelajaran yang aktif
    const tahunAktif = await prisma.tahunPelajaran.findFirst({
      where: { is_active: true }
    });
    
    if (!tahunAktif) {
      return { success: false, message: "Tidak ada Tahun Pelajaran yang Aktif. Silakan atur di menu Master Data." };
    }

    const id = formDataPayload.get('id');
    const pertemuan_ke = parseInt(formDataPayload.get('pertemuan_ke'));
    const judul = formDataPayload.get('judul');
    const tujuan_pembelajaran = formDataPayload.get('tujuan_pembelajaran');
    const aktivitas_pembelajaran = formDataPayload.get('aktivitas_pembelajaran');
    const mapel_id = parseInt(formDataPayload.get('mapel_id'));
    const kelas_ids = formDataPayload.getAll('kelas_ids[]'); // Bisa lebih dari 1 kelas

    if (!kelas_ids || kelas_ids.length === 0) {
      return { success: false, message: "Minimal pilih satu kelas." };
    }

    // Handle File Upload
    const file = formDataPayload.get('upload_file');
    let filePath = formDataPayload.get('existing_file') || null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}_${file.name.replace(/\\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/rpp');
      
      // Ensure directory exists (optional safety)
      await fs.mkdir(uploadDir, { recursive: true });
      
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      filePath = `/uploads/rpp/${filename}`;
    }

    // Ambil Data Tugas (Jika ada)
    const ada_tugas = formDataPayload.get('ada_tugas') === 'true';
    const judul_tugas = formDataPayload.get('judul_tugas');
    const deskripsi_tugas = formDataPayload.get('deskripsi_tugas');
    const deadline_tugas = formDataPayload.get('deadline_tugas');
    
    // Handle File Tugas
    const fileTugasObj = formDataPayload.get('file_tugas');
    let fileTugasPath = formDataPayload.get('existing_file_tugas') || null;
    
    if (fileTugasObj && fileTugasObj.size > 0) {
      const buffer = Buffer.from(await fileTugasObj.arrayBuffer());
      const filename = `tugas_${Date.now()}_${fileTugasObj.name.replace(/\\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/tugas');
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      fileTugasPath = `/uploads/tugas/${filename}`;
    }

    if (id && id !== "null") {
      // MODE EDIT (hanya update 1 RPP)
      const rpp = await prisma.rpp.update({
        where: { id: parseInt(id) },
        data: {
          pertemuan_ke,
          judul,
          tujuan_pembelajaran,
          aktivitas_pembelajaran,
          upload_file: filePath,
          mapel_id,
          kelas_id: parseInt(kelas_ids[0])
        }
      });

      // Update / Create Tugas
      if (ada_tugas && judul_tugas && deskripsi_tugas) {
        const existingTugas = await prisma.tugas.findFirst({ where: { rpp_id: rpp.id } });
        const tugasPayload = {
          judul: judul_tugas,
          deskripsi: deskripsi_tugas,
          deadline: deadline_tugas ? new Date(deadline_tugas) : null,
          file: fileTugasPath,
          poin_maks: 100
        };

        if (existingTugas) {
          await prisma.tugas.update({
            where: { id: existingTugas.id },
            data: tugasPayload
          });
        } else {
          await prisma.tugas.create({
            data: { ...tugasPayload, rpp_id: rpp.id }
          });
        }
      } else if (!ada_tugas) {
        // Hapus tugas jika ada dan checkbox un-checked
        await prisma.tugas.deleteMany({ where: { rpp_id: rpp.id } });
      }

    } else {
      // MODE CREATE (Bisa multiple kelas, gunakan perulangan agar dapat ID RPP)
      for (const kelasId of kelas_ids) {
        const newRpp = await prisma.rpp.create({
          data: {
            pertemuan_ke,
            judul,
            tujuan_pembelajaran,
            aktivitas_pembelajaran,
            upload_file: filePath,
            status_terlaksana: false,
            guru_id: guruId,
            kelas_id: parseInt(kelasId),
            mapel_id,
            tahun_pelajaran_id: tahunAktif.id
          }
        });

        // Buat Tugas Jika Dicentang
        if (ada_tugas && judul_tugas && deskripsi_tugas) {
          await prisma.tugas.create({
            data: {
              judul: judul_tugas,
              deskripsi: deskripsi_tugas,
              deadline: deadline_tugas ? new Date(deadline_tugas) : null,
              file: fileTugasPath,
              poin_maks: 100,
              rpp_id: newRpp.id
            }
          });
        }
      }
    }
    
    revalidatePath("/beranda");
    return { success: true };
  } catch (error) {
    console.error("Error saveRpp:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteRpp(id) {
  try {
    await prisma.rpp.delete({ where: { id } });
    revalidatePath("/beranda");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal menghapus RPP. Mungkin sudah ada absensi atau tugas terkait." };
  }
}

export async function toggleStatusRpp(id, currentStatus) {
  try {
    await prisma.rpp.update({
      where: { id },
      data: { status_terlaksana: !currentStatus }
    });
    revalidatePath("/beranda");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
