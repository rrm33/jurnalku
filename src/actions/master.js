"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

export async function checkDbConnection() {
  noStore(); // Pastikan fungsi ini TIDAK PERNAH di-cache oleh Next.js
  try {
    // Gunakan count agar sangat ringan dan pasti memicu query
    await prisma.kelas.count();
    return true;
  } catch (error) {
    return false;
  }
}

// ==========================================
// TAHUN PELAJARAN
// ==========================================
export async function getTahunPelajaran() {
  try {
    return await prisma.tahunPelajaran.findMany({
      orderBy: { id: "desc" },
    });
  } catch (error) {
    console.error("Error getTahunPelajaran:", error);
    return [];
  }
}

export async function saveTahunPelajaran(data) {
  try {
    if (data.id) {
      await prisma.tahunPelajaran.update({
        where: { id: data.id },
        data: { nama: data.nama },
      });
    } else {
      await prisma.tahunPelajaran.create({
        data: { nama: data.nama, is_active: false },
      });
    }
    revalidatePath("/beranda/master/tahun-pelajaran");
    return { success: true };
  } catch (error) {
    console.error("Error saveTahunPelajaran:", error);
    return { success: false, message: error.message };
  }
}

export async function setTahunPelajaranAktif(id) {
  try {
    // Nonaktifkan semua dulu
    await prisma.tahunPelajaran.updateMany({
      data: { is_active: false },
    });
    // Aktifkan yang dipilih
    await prisma.tahunPelajaran.update({
      where: { id },
      data: { is_active: true },
    });
    revalidatePath("/beranda/master/tahun-pelajaran");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteTahunPelajaran(id) {
  try {
    await prisma.tahunPelajaran.delete({ where: { id } });
    revalidatePath("/beranda/master/tahun-pelajaran");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal menghapus. Data mungkin sedang digunakan." };
  }
}

// ==========================================
// KELAS
// ==========================================
export async function getKelas() {
  try {
    return await prisma.kelas.findMany({
      include: {
        _count: {
          select: { siswa: true }
        }
      },
      orderBy: { nama: "asc" },
    });
  } catch (error) {
    return [];
  }
}

export async function saveKelas(data) {
  try {
    if (data.id) {
      await prisma.kelas.update({
        where: { id: data.id },
        data: { nama: data.nama },
      });
    } else {
      await prisma.kelas.create({
        data: { nama: data.nama },
      });
    }
    revalidatePath("/beranda/master/kelas");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteKelas(id) {
  try {
    await prisma.kelas.delete({ where: { id } });
    revalidatePath("/beranda/master/kelas");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal menghapus. Pastikan tidak ada siswa di kelas ini." };
  }
}

// ==========================================
// MAPEL
// ==========================================
export async function getMapel() {
  try {
    return await prisma.mapel.findMany({
      orderBy: { nama: "asc" },
    });
  } catch (error) {
    return [];
  }
}

export async function saveMapel(data) {
  try {
    if (data.id) {
      await prisma.mapel.update({
        where: { id: data.id },
        data: { nama: data.nama },
      });
    } else {
      await prisma.mapel.create({
        data: { nama: data.nama },
      });
    }
    revalidatePath("/beranda/master/mapel");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteMapel(id) {
  try {
    await prisma.mapel.delete({ where: { id } });
    revalidatePath("/beranda/master/mapel");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal menghapus. Mata pelajaran mungkin sudah dipakai di RPP." };
  }
}

// ==========================================
// SISWA
// ==========================================
export async function getSiswa(kelasId = null) {
  noStore();
  try {
    const whereClause = kelasId ? { kelas_id: parseInt(kelasId) } : {};
    return await prisma.siswa.findMany({
      where: whereClause,
      include: { kelas: true },
      orderBy: { nama: "asc" },
    });
  } catch (error) {
    return [];
  }
}

export async function saveSiswa(formDataPayload) {
  try {
    const id = formDataPayload.get('id');
    const nisn = formDataPayload.get('nisn');
    const nis = formDataPayload.get('nis');
    const nama = formDataPayload.get('nama');
    const gender = formDataPayload.get('gender');
    const kelas_id = parseInt(formDataPayload.get('kelas_id'));
    
    // Field Tambahan
    const email = formDataPayload.get('email');
    const hp = formDataPayload.get('hp');
    const hp_ortu = formDataPayload.get('hp_ortu');
    const nik = formDataPayload.get('nik');
    const kk = formDataPayload.get('kk');
    const tmp_lahir = formDataPayload.get('tmp_lahir');
    const tgl_lahir = formDataPayload.get('tgl_lahir'); // Format YYYY-MM-DD
    const akta_lahir = formDataPayload.get('akta_lahir');
    const alamat = formDataPayload.get('alamat');
    const password = formDataPayload.get('password');
    let fotoPath = formDataPayload.get('existing_foto') || null;

    // Handle File Upload Siswa
    const file = formDataPayload.get('foto');
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split('.').pop();
      const filename = `siswa_${nisn}_${Date.now()}.${ext}`;
      const fs = require('fs/promises');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'public/uploads/siswa');
      
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      fotoPath = `/uploads/siswa/${filename}`;
    }

    const payload = {
      nisn,
      nis: nis || null,
      nama,
      gender: gender || null,
      kelas_id,
      email: email || null,
      hp: hp || null,
      hp_ortu: hp_ortu || null,
      nik: nik || null,
      kk: kk || null,
      tmp_lahir: tmp_lahir || null,
      tgl_lahir: tgl_lahir ? new Date(tgl_lahir) : null,
      akta_lahir: akta_lahir || null,
      alamat: alamat || null,
      foto: fotoPath
    };

    if (password && password.trim() !== "") {
      payload.password = password;
    }

    if (id && id !== "null") {
      await prisma.siswa.update({
        where: { id: parseInt(id) },
        data: payload,
      });
    } else {
      await prisma.siswa.create({
        data: payload,
      });
    }
    revalidatePath("/beranda/master/siswa");
    revalidatePath("/beranda/maps");
    return { success: true };
  } catch (error) {
    if (error.code === 'P2002') {
      return { success: false, message: "NISN, NIS, atau Email sudah terdaftar!" };
    }
    return { success: false, message: error.message };
  }
}

export async function deleteSiswa(id) {
  try {
    await prisma.siswa.delete({ where: { id } });
    revalidatePath("/beranda/master/siswa");
    revalidatePath("/beranda/maps");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal menghapus data siswa." };
  }
}

export async function importSiswaBulk(siswaArray, kelasId) {
  try {
    // siswaArray adalah array of { nisn, nama, gender, dsb }
    const dataToInsert = siswaArray.map(s => ({
      nisn: String(s.nisn),
      nama: s.nama,
      gender: s.gender || null,
      kelas_id: parseInt(kelasId),
      nis: s.nis ? String(s.nis) : null,
      email: s.email ? String(s.email) : null,
      nik: s.nik ? String(s.nik) : null,
      kk: s.kk ? String(s.kk) : null,
      tmp_lahir: s.tmp_lahir ? String(s.tmp_lahir) : null,
      tgl_lahir: (() => {
        if (!s.tgl_lahir) return null;
        if (!isNaN(s.tgl_lahir) && Number(s.tgl_lahir) > 10000) {
          // Parse Excel Serial Date
          return new Date(Math.round((Number(s.tgl_lahir) - 25569) * 86400 * 1000));
        }
        const d = new Date(s.tgl_lahir);
        return isNaN(d.getTime()) ? null : d;
      })(),
      akta_lahir: s.akta_lahir ? String(s.akta_lahir) : null,
      alamat: s.alamat ? String(s.alamat) : null,
      hp: s.hp ? String(s.hp) : null,
      hp_ortu: s.hp_ortu ? String(s.hp_ortu) : null,
      nama_ortu: s.nama_ortu ? String(s.nama_ortu) : null,
      pekerjaan_ortu: s.pekerjaan_ortu ? String(s.pekerjaan_ortu) : null,
      ekskul: s.ekskul ? String(s.ekskul) : null,
      catatan: s.catatan ? String(s.catatan) : null,
      status: s.status ? String(s.status) : 'Aktif',
    }));

    // Gunakan transaksi untuk insert satu persatu supaya ignore yg duplikat, atau createMany skipDuplicates (jika didukung MySQL driver)
    const result = await prisma.siswa.createMany({
      data: dataToInsert,
      skipDuplicates: true, 
    });

    revalidatePath("/beranda/master/siswa");
    revalidatePath("/beranda/maps");
    return { success: true, count: result.count };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
