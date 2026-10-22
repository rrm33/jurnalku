"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getSessionClient } from "@/actions/auth";
import fs from "fs/promises";
import path from "path";

export async function getProfilGuru(guruId = null) {
  try {
    let targetId = guruId;
    if (!targetId) {
      const session = await getSessionClient();
      if (session && (session.role === "guru" || session.role === "admin")) {
        targetId = session.id;
      }
    }
    if (!targetId) targetId = 1;

    return await prisma.guru.findUnique({
      where: { id: parseInt(targetId) }
    });
  } catch (error) {
    console.error("Error getProfilGuru:", error);
    return null;
  }
}

export async function updateProfilGuru(formDataPayload, guruId = null) {
  try {
    let targetId = guruId;
    let currentSession = null;
    if (!targetId) {
      currentSession = await getSessionClient();
      if (currentSession && (currentSession.role === "guru" || currentSession.role === "admin")) {
        targetId = currentSession.id;
      }
    }
    if (!targetId) targetId = 1;

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
      const filename = `guru_${targetId}_${Date.now()}.${ext}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/guru');
      
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      fotoPath = `/uploads/guru/${filename}`;
    }

    const updated = await prisma.guru.update({
      where: { id: parseInt(targetId) },
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

    // Perbarui sesi cookie jika mengedit profil diri sendiri
    if (!guruId || (currentSession && currentSession.id === targetId)) {
      const cookieStore = await cookies();
      const sess = currentSession || await getSessionClient();
      if (sess) {
        cookieStore.set(
          'session',
          JSON.stringify({ ...sess, nama: updated.nama, foto: updated.foto }),
          {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            sameSite: 'lax',
            secure: false,
            path: '/'
          }
        );
      }
    }

    revalidatePath("/beranda/profil");
    revalidatePath("/beranda");
    return { success: true, foto: fotoPath, nama: updated.nama };
  } catch (error) {
    console.error("Error updateProfilGuru:", error);
    return { success: false, message: error.message };
  }
}
