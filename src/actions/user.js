"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSessionClient } from "@/actions/auth";

export async function getAllUsers() {
  try {
    const session = await getSessionClient();
    if (!session || (session.role !== "guru" && session.role !== "admin")) {
      return { success: false, message: "Akses ditolak" };
    }

    const users = await prisma.guru.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        nip: true,
        nama: true,
        email: true,
        hp: true,
        foto: true,
        role: true,
      }
    });

    const mapped = users.map(u => ({
      ...u,
      role: u.role || (u.id === 1 ? "admin" : "guru")
    }));

    return { success: true, data: mapped, currentUserId: session.id };
  } catch (error) {
    console.error("Error getAllUsers:", error);
    return { success: false, message: error.message };
  }
}

export async function saveUser(formDataPayload) {
  try {
    const session = await getSessionClient();
    if (!session || (session.role !== "guru" && session.role !== "admin")) {
      return { success: false, message: "Akses ditolak" };
    }

    const id = formDataPayload.get("id");
    const nip = formDataPayload.get("nip")?.trim();
    const nama = formDataPayload.get("nama")?.trim();
    const email = formDataPayload.get("email")?.trim() || null;
    const hp = formDataPayload.get("hp")?.trim() || null;
    const role = formDataPayload.get("role")?.trim() || "guru";
    const password = formDataPayload.get("password")?.trim();

    if (!nip || !nama) {
      return { success: false, message: "NIP dan Nama Lengkap wajib diisi!" };
    }

    // Cek duplikasi NIP
    const existing = await prisma.guru.findUnique({
      where: { nip }
    });

    if (id) {
      const targetId = parseInt(id);
      if (existing && existing.id !== targetId) {
        return { success: false, message: "NIP sudah digunakan oleh guru/user lain!" };
      }

      const updateData = {
        nip,
        nama,
        email,
        hp,
        role,
        ...(password ? { password } : {})
      };

      await prisma.guru.update({
        where: { id: targetId },
        data: updateData
      });

      revalidatePath("/beranda/master/user");
      return { success: true, message: "User berhasil diperbarui!" };
    } else {
      if (existing) {
        return { success: false, message: "NIP sudah terdaftar!" };
      }

      await prisma.guru.create({
        data: {
          nip,
          nama,
          email,
          hp,
          role,
          password: password || "123456"
        }
      });

      revalidatePath("/beranda/master/user");
      return { success: true, message: "User baru berhasil ditambahkan!" };
    }
  } catch (error) {
    console.error("Error saveUser:", error);
    return { success: false, message: error.message };
  }
}

export async function resetPasswordUser(id, newPassword) {
  try {
    const session = await getSessionClient();
    if (!session || (session.role !== "guru" && session.role !== "admin")) {
      return { success: false, message: "Akses ditolak" };
    }

    if (!newPassword || newPassword.trim().length === 0) {
      return { success: false, message: "Password baru tidak boleh kosong!" };
    }

    await prisma.guru.update({
      where: { id: parseInt(id) },
      data: { password: newPassword.trim() }
    });

    return { success: true, message: "Password user berhasil direset!" };
  } catch (error) {
    console.error("Error resetPasswordUser:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteUser(id) {
  try {
    const session = await getSessionClient();
    if (!session || (session.role !== "guru" && session.role !== "admin")) {
      return { success: false, message: "Akses ditolak" };
    }

    const targetId = parseInt(id);
    if (session.id === targetId) {
      return { success: false, message: "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!" };
    }

    // Cek apakah guru memiliki data RPP tertaut
    const rppCount = await prisma.rpp.count({
      where: { guru_id: targetId }
    });

    if (rppCount > 0) {
      return {
        success: false,
        message: `Tidak dapat menghapus user ini karena masih memiliki ${rppCount} jurnal/RPP yang terhubung. Hapus atau alihkan RPP terlebih dahulu.`
      };
    }

    await prisma.guru.delete({
      where: { id: targetId }
    });

    revalidatePath("/beranda/master/user");
    return { success: true, message: "User berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleteUser:", error);
    return { success: false, message: error.message };
  }
}
