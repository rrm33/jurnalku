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
    // agar siswa tidak terjebak di layar "Ubah Password"
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

    // Buang password dari dataUpdate agar tidak ditimpa ulang nanti (opsional, tapi lebih baik)
    if (dataUpdate.password) {
      delete dataUpdate.password;
    }

    // Simpan data selain password sebagai ajuan
    await prisma.ajuanProfilSiswa.create({
      data: {
        siswa_id: id,
        data_perubahan: JSON.stringify(dataUpdate),
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

export async function getPendingAjuanSiswa() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return false;
    
    const parsed = JSON.parse(session.value);
    if (parsed.role !== "siswa") return false;

    const count = await prisma.ajuanProfilSiswa.count({
      where: {
        siswa_id: parseInt(parsed.id),
        status: "MENUNGGU"
      }
    });

    return count > 0;
  } catch (error) {
    console.error("Error getPendingAjuan:", error);
    return false;
  }
}
