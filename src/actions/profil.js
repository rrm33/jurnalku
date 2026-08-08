"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export async function getProfilGuru(guruId = 1) {
  try {
    return await prisma.guru.findUnique({
      where: { id: guruId }
    });
  } catch (error) {
    console.error("Error getProfilGuru:", error);
    return null;
  }
}

export async function updateProfilGuru(formDataPayload, guruId = 1) {
  try {
    const nip = formDataPayload.get('nip');
    const nama = formDataPayload.get('nama');
    const email = formDataPayload.get('email');
    const hp = formDataPayload.get('hp');
    const nik = formDataPayload.get('nik');
    const kk = formDataPayload.get('kk');
    const password = formDataPayload.get('password');
    let fotoPath = formDataPayload.get('existing_foto') || null;

    // Handle File Upload
    const file = formDataPayload.get('foto');
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split('.').pop();
      const filename = `guru_${guruId}_${Date.now()}.${ext}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/guru');
      
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      fotoPath = `/uploads/guru/${filename}`;
    }

    await prisma.guru.update({
      where: { id: guruId },
      data: {
        nip,
        nama,
        email: email || null,
        hp: hp || null,
        nik: nik || null,
        kk: kk || null,
        foto: fotoPath,
        ...(password ? { password } : {})
      }
    });

    revalidatePath("/beranda/profil");
    return { success: true, foto: fotoPath };
  } catch (error) {
    console.error("Error updateProfilGuru:", error);
    return { success: false, message: error.message };
  }
}
