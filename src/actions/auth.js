"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 hari

function getCookieOptions() {
  return {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    expires: new Date(Date.now() + COOKIE_MAX_AGE * 1000),
    sameSite: 'lax',
    secure: false, // Aman di HTTP dan HTTPS (mencegah cookie tertolak saat diakses via HTTP / reverse-proxy)
    path: '/'
  };
}

// Mengecek koneksi dan sesi aktif
export async function getSessionClient() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session || !session.value) return null;
    try {
      return JSON.parse(decodeURIComponent(session.value));
    } catch {
      return JSON.parse(session.value);
    }
  } catch {
    return null;
  }
}

export async function checkConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "connected" }
  } catch (error) {
    return { status: "error" }
  }
}

// Mengambil daftar siswa yang belum set password
export async function getSiswaTanpaPassword() {
  try {
    const siswa = await prisma.siswa.findMany({
      where: { password: null },
      select: { id: true, nama: true, nisn: true }
    });
    return { success: true, data: siswa }
  } catch (error) {
    return { success: false, data: [] }
  }
}

// Login untuk Guru
export async function loginGuru(nip, password) {
  try {
    const guru = await prisma.guru.findUnique({ where: { nip } });
    if (!guru) {
      return { success: false, message: "NIP tidak ditemukan" }
    }
    // TODO: Gunakan bcrypt untuk membandingkan hash password di versi production
    if (guru.password !== password) {
      return { success: false, message: "Password salah" }
    }
    
    const userRole = guru.role || (guru.id === 1 ? 'admin' : 'guru');
    const cookieStore = await cookies();
    cookieStore.set(
      'session',
      JSON.stringify({ id: guru.id, role: userRole, nama: guru.nama, foto: guru.foto }),
      getCookieOptions()
    );
    
    return { success: true, data: { nama: guru.nama, role: userRole } }
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan server" }
  }
}

// Login untuk Siswa dengan password
export async function loginSiswa(nisn, password) {
  try {
    const siswa = await prisma.siswa.findUnique({ where: { nisn } });
    if (!siswa) {
      return { success: false, message: "NISN tidak ditemukan" }
    }
    if (!siswa.password) {
      return { success: false, message: "Password belum diatur. Silakan login lewat daftar siswa tanpa password." }
    }
    if (siswa.password !== password) {
      return { success: false, message: "Password salah" }
    }
    
    const cookieStore = await cookies();
    cookieStore.set(
      'session',
      JSON.stringify({ id: siswa.id, role: 'siswa', nama: siswa.nama, needsPassword: false }),
      getCookieOptions()
    );
    
    return { success: true, data: { nama: siswa.nama } }
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan server" }
  }
}

// Login Siswa Instan (Tanpa Password)
export async function loginSiswaTanpaPassword(id) {
  try {
    const siswa = await prisma.siswa.findUnique({ where: { id: parseInt(id) } });
    if (!siswa) return { success: false, message: "Siswa tidak ditemukan" };
    if (siswa.password) return { success: false, message: "Siswa sudah memiliki password" };

    const cookieStore = await cookies();
    cookieStore.set(
      'session',
      JSON.stringify({ id: siswa.id, role: 'siswa', nama: siswa.nama, needsPassword: true }),
      getCookieOptions()
    );
    
    return { success: true, data: { nama: siswa.nama } };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

// Set Password Baru untuk Siswa
export async function setSiswaPassword(id, newPassword) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return { success: false, message: "Tidak ada sesi aktif" };
    
    let parsed;
    try {
      parsed = JSON.parse(decodeURIComponent(session.value));
    } catch {
      parsed = JSON.parse(session.value);
    }

    if (parsed.id !== id || parsed.role !== 'siswa') return { success: false, message: "Sesi tidak valid" };

    await prisma.siswa.update({
      where: { id: parseInt(id) },
      data: { password: newPassword }
    });

    // Perbarui sesi agar needsPassword menjadi false
    cookieStore.set(
      'session',
      JSON.stringify({ ...parsed, needsPassword: false }),
      getCookieOptions()
    );

    return { success: true, message: "Password berhasil disimpan" };
  } catch (error) {
    return { success: false, message: "Gagal menyimpan password" };
  }
}

// Logout
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return { success: true };
}

// Seed Data Awal (Guru Dummy) agar bisa tes login
export async function seedDummyGuru() {
  try {
    const count = await prisma.guru.count()
    if (count === 0) {
      await prisma.guru.create({
        data: {
          nip: "123456789",
          nama: "Guru Testing",
          password: "password123",
          email: "guru@sekolah.com"
        }
      })
      return { success: true, message: "Data dummy guru berhasil ditambahkan!" }
    }
    return { success: true, message: "Data guru sudah ada." }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Gagal membuat data dummy" }
  }
}
