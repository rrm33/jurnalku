"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

export async function getLegerOptions() {
  noStore();
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return { success: false, message: "Unauthorized" };

    const parsed = JSON.parse(session.value);
    
    if (parsed.role === "guru") {
      // Dapatkan mapel dan kelas dari RPP yang diajar guru ini
      const rpps = await prisma.rpp.findMany({
        where: { guru_id: parsed.id },
        select: {
          mapel: true,
          kelas: true
        }
      });
      
      const mapelMap = new Map();
      const kelasMap = new Map();
      
      rpps.forEach(rpp => {
        if (rpp.mapel) mapelMap.set(rpp.mapel.id, rpp.mapel);
        if (rpp.kelas) kelasMap.set(rpp.kelas.id, rpp.kelas);
      });

      return { 
        success: true, 
        mapels: Array.from(mapelMap.values()),
        kelasList: Array.from(kelasMap.values())
      };
    } else if (parsed.role === "siswa") {
       // Untuk siswa, dapatkan RPP berdasarkan kelasnya
       const rpps = await prisma.rpp.findMany({
        where: { kelas_id: parsed.kelas_id },
        select: { mapel: true }
      });
      const mapelMap = new Map();
      rpps.forEach(rpp => {
        if (rpp.mapel) mapelMap.set(rpp.mapel.id, rpp.mapel);
      });

      return {
        success: true,
        mapels: Array.from(mapelMap.values()),
        kelas_id: parsed.kelas_id
      }
    }

    return { success: false, message: "Role tidak valid" };
  } catch (error) {
    console.error("Error getLegerOptions:", error);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

export async function getLegerData(mapelId, kelasId) {
  noStore();
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    let userId = null;
    let userRole = null;
    if (session) {
      const parsed = JSON.parse(session.value);
      userId = parsed.id;
      userRole = parsed.role;
    }

    const pMapelId = parseInt(mapelId);
    const pKelasId = parseInt(kelasId);

    // Ambil daftar Tugas (melalui RPP mapel & kelas terkait)
    const tugasListDb = await prisma.tugas.findMany({
      where: {
        rpp: {
          mapel_id: pMapelId,
          kelas_id: pKelasId
        }
      },
      include: { rpp: true },
      orderBy: { rpp: { pertemuan_ke: 'asc' } }
    });
    const tugasList = tugasListDb.filter(t => t.rpp?.is_active !== false);

    // Ambil siswa di kelas
    const siswaDiKelas = await prisma.siswa.findMany({
      where: { kelas_id: pKelasId },
      include: {
        pengumpulanTugas: {
          where: {
            tugas: {
              rpp: {
                mapel_id: pMapelId,
                kelas_id: pKelasId
              }
            }
          }
        },
        kelas: true
      },
      orderBy: { nama: 'asc' }
    });

    // Kalkulasi nilai per siswa
    const siswaList = siswaDiKelas.map(siswa => {
      let jumlah = 0;
      let countDinilai = 0;
      const nilaiTugas = {};

      tugasList.forEach(tugas => {
        const pengumpulan = siswa.pengumpulanTugas.find(p => p.tugas_id === tugas.id);
        const nilai = pengumpulan && pengumpulan.nilai !== null ? pengumpulan.nilai : 0;
        nilaiTugas[tugas.id] = nilai;
        jumlah += nilai;
        if (pengumpulan && pengumpulan.nilai !== null) countDinilai++;
      });

      const rataRata = tugasList.length > 0 ? (jumlah / tugasList.length).toFixed(2) : 0;

      return {
        ...siswa,
        isMe: userRole === 'siswa' && siswa.id === userId,
        nilaiTugas,
        jumlah,
        rataRata: parseFloat(rataRata)
      };
    });

    // Peringkat Kelas (descending rata-rata)
    const sortedKelas = [...siswaList].sort((a, b) => b.rataRata - a.rataRata);
    
    let currentRank = 1;
    let currentRataRata = -1;
    let actualRank = 1;

    sortedKelas.forEach((sk) => {
      if (sk.rataRata !== currentRataRata) {
        actualRank = currentRank;
        currentRataRata = sk.rataRata;
      }
      // Jika sama sekali belum ada nilai atau jumlah 0, beri tanda "-"
      sk.assignedRank = sk.jumlah === 0 ? "-" : actualRank;
      currentRank++;
    });

    siswaList.forEach(s => {
      const found = sortedKelas.find(sk => sk.id === s.id);
      s.peringkatKelas = found ? found.assignedRank : "-";
    });

    // Hitung Peringkat Paralel
    const namaKelas = siswaDiKelas.length > 0 ? siswaDiKelas[0].kelas.nama : "";
    const tingkatKelasMatch = namaKelas.match(/^([A-Za-z0-9]+)/);
    
    if (tingkatKelasMatch) {
      const awalan = tingkatKelasMatch[1];
      
      // Ambil seluruh siswa di tingkat ini (berdasarkan nama kelas yg mirip)
      const paralelSiswa = await prisma.siswa.findMany({
        where: {
          kelas: {
            nama: { startsWith: awalan }
          }
        },
        include: {
          pengumpulanTugas: {
            where: {
              tugas: { rpp: { mapel_id: pMapelId } }
            }
          }
        }
      });

      const allTugasMapelIni = await prisma.tugas.findMany({
         where: { rpp: { mapel_id: pMapelId } },
         include: { rpp: true }
      });
      const totalTugasMapelIni = allTugasMapelIni.filter(t => t.rpp?.is_active !== false).length;

      const calcParalel = paralelSiswa.map(ps => {
         let pJumlah = 0;
         ps.pengumpulanTugas.forEach(pt => {
           if(pt.nilai !== null) pJumlah += pt.nilai;
         });
         const pAvg = totalTugasMapelIni > 0 ? parseFloat((pJumlah / totalTugasMapelIni).toFixed(2)) : 0;
         return { id: ps.id, rata: pAvg, jumlah: pJumlah };
      });
      
      calcParalel.sort((a, b) => b.rata - a.rata);
      
      let pCurrentRank = 1;
      let pCurrentRata = -1;
      let pActualRank = 1;

      calcParalel.forEach(cp => {
        if (cp.rata !== pCurrentRata) {
          pActualRank = pCurrentRank;
          pCurrentRata = cp.rata;
        }
        cp.assignedRank = cp.jumlah === 0 ? "-" : pActualRank;
        pCurrentRank++;
      });
      
      siswaList.forEach(s => {
        const cp = calcParalel.find(c => c.id === s.id);
        s.peringkatParalel = cp ? cp.assignedRank : "-";
      });
    }

    return { 
      success: true, 
      data: {
        tugasList,
        siswaList
      }
    };
  } catch (error) {
    console.error("Error getLegerData:", error);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}
