"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

async function getSessionData() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return null;
  try {
    return JSON.parse(session.value);
  } catch (e) {
    return null;
  }
}

export async function getInformasiList() {
  const session = await getSessionData();
  if (!session || session.role !== "guru") return { success: false, message: "Unauthorized" };

  try {
    const data = await prisma.informasi.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        guru: {
          select: { nama: true }
        }
      }
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function saveInformasi(formData) {
  const session = await getSessionData();
  if (!session || session.role !== "guru") return { success: false, message: "Unauthorized" };

  try {
    const id = formData.get("id");
    const informasi = formData.get("informasi");
    let judul = formData.get("judul");
    
    if (!judul || judul.trim() === "") {
      judul = informasi.substring(0, 40);
      if (informasi.length > 40) judul += "...";
    }

    const file = formData.get("file");
    let filePath = formData.get("existing_file") || null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.name);
      const filename = `info_${uniqueSuffix}${ext}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/informasi");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      filePath = `/uploads/informasi/${filename}`;
    }

    if (id) {
      await prisma.informasi.update({
        where: { id: parseInt(id) },
        data: { judul, informasi, file: filePath }
      });
      return { success: true, message: "Informasi berhasil diperbarui." };
    } else {
      await prisma.informasi.create({
        data: {
          judul,
          informasi,
          file: filePath,
          guru_id: session.id
        }
      });
      return { success: true, message: "Informasi berhasil ditambahkan." };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteInformasi(id) {
  const session = await getSessionData();
  if (!session || session.role !== "guru") return { success: false, message: "Unauthorized" };

  try {
    await prisma.informasi.delete({
      where: { id: parseInt(id) }
    });
    return { success: true, message: "Berhasil dihapus." };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
