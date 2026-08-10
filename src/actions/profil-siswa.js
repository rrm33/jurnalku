"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { cookies } from "next/headers";

export async function getMyProfilSiswa() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return null;
    
    const parsed = JSON.parse(session.value);
    if (parsed.role !== "siswa") return null;

    return await prisma.siswa.findUnique({
      where: { id: parseInt(parsed.id) },
      include: {
        kelas: true
      }
    });
  } catch (error) {
    console.error("Error getMyProfilSiswa:", error);
    return null;
  }
}

export async function updateProfilSiswa(formDataPayload) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) throw new Error("Unauthorized");
    
    const parsed = JSON.parse(session.value);
    if (parsed.role !== "siswa") throw new Error("Unauthorized");
    
    const id = parseInt(parsed.id);
    
    const email = formDataPayload.get('email');
    const hp = formDataPayload.get('hp');
    const hp_ortu = formDataPayload.get('hp_ortu');
    const nik = formDataPayload.get('nik');
    const kk = formDataPayload.get('kk');
    const tmp_lahir = formDataPayload.get('tmp_lahir');
    const tgl_lahir = formDataPayload.get('tgl_lahir');
    const akta_lahir = formDataPayload.get('akta_lahir');
    const alamat = formDataPayload.get('alamat');
    const password = formDataPayload.get('password');
    let fotoPath = formDataPayload.get('existing_foto') || null;

    // Handle File Upload
    const file = formDataPayload.get('foto');
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split('.').pop();
      const filename = `siswa_${id}_${Date.now()}.${ext}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/siswa');
      
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      fotoPath = `/uploads/siswa/${filename}`;
    }

    const dataUpdate = {
      email: email || null,
      hp: hp || null,
      hp_ortu: hp_ortu || null,
      nik: nik || null,
      kk: kk || null,
      tmp_lahir: tmp_lahir || null,
      tgl_lahir: tgl_lahir ? new Date(tgl_lahir) : null,
      akta_lahir: akta_lahir || null,
      alamat: alamat || null,
      foto: fotoPath,
    };

    // Jika password diupdate, kita ubah password SEKARANG JUGA secara permanen
    if (password) {
      await prisma.siswa.update({
        where: { id: id },
        data: { password: password }
      });
      
      const cookieStore = await cookies();
      const session = cookieStore.get('session');
      if (session) {
        const parsed = JSON.parse(session.value);
        if (parsed.needsPassword) {
          parsed.needsPassword = false;
          cookieStore.set('session', JSON.stringify(parsed), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 minggu
          });
        }
      }
    }

    // Ambil data siswa saat ini untuk membandingkan apakah ada perubahan
    const currentSiswa = await prisma.siswa.findUnique({ where: { id: id } });
    
    // Bandingkan dan kumpulkan hanya data yang benar-benar berubah
    const actualChanges = {};
    for (const key in dataUpdate) {
      if (key === 'password') continue;
      
      let oldVal = currentSiswa[key];
      let newVal = dataUpdate[key];
      
      // Khusus tanggal lahir, bandingkan string ISO-nya agar akurat
      if (key === 'tgl_lahir') {
        oldVal = oldVal ? oldVal.toISOString().split('T')[0] : null;
        newVal = newVal ? newVal.toISOString().split('T')[0] : null;
      }
      
      if (oldVal !== newVal) {
        actualChanges[key] = dataUpdate[key];
      }
    }

    // Jika tidak ada data yang berubah (atau hanya password yang berubah)
    if (Object.keys(actualChanges).length === 0) {
      revalidatePath("/beranda-siswa/profil");
      if (password) {
        return { success: true, message: "Password berhasil diperbarui!" };
      } else {
        return { success: true, message: "Tidak ada perubahan data." };
      }
    }

    // Simpan data yang BENAR-BENAR BERUBAH sebagai ajuan
    await prisma.ajuanProfilSiswa.create({
      data: {
        siswa_id: id,
        data_perubahan: JSON.stringify(actualChanges),
        status: "MENUNGGU"
      }
    });

    revalidatePath("/beranda-siswa/profil");
    revalidatePath("/beranda/master/ajuan-profil");

    return { success: true, message: "Pengajuan perubahan profil berhasil dikirim dan menunggu persetujuan Admin/Guru." };
  } catch (error) {
    console.error("Error updateProfilSiswa:", error);
    return { success: false, message: error.message };
  }
}

export async function getAjuanStatusSiswa() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return { status: null };
    
    const parsed = JSON.parse(session.value);
    if (parsed.role !== "siswa") return { status: null };

    const latestAjuan = await prisma.ajuanProfilSiswa.findFirst({
      where: { siswa_id: parseInt(parsed.id) },
      orderBy: { created_at: 'desc' }
    });

    if (!latestAjuan) return { status: null };

    return { status: latestAjuan.status };
  } catch (error) {
    console.error("Error getAjuanStatusSiswa:", error);
    return { status: null };
  }
}
