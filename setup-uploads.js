const fs = require('fs');
const path = require('path');

console.log('🔄 Menyiapkan folder uploads persisten untuk Hostinger...');

const persistentDir = path.join(process.cwd(), '..', 'jurnalku_uploads');
const targetDir = path.join(process.cwd(), 'public', 'uploads');
const subFolders = ['guru', 'siswa', 'rpp', 'informasi'];

// 1. Buat folder persisten di luar project jika belum ada
if (!fs.existsSync(persistentDir)) {
  console.log(`📁 Membuat direktori persisten di: ${persistentDir}`);
  fs.mkdirSync(persistentDir, { recursive: true });
}
subFolders.forEach(sub => {
  if (!fs.existsSync(path.join(persistentDir, sub))) {
    fs.mkdirSync(path.join(persistentDir, sub), { recursive: true });
  }
});

// Fungsi bantuan untuk copy folder secara rekursif (untuk migrasi file lama)
function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

// 2. Cek apakah folder public/uploads sudah ada dan BUKAN symlink
if (fs.existsSync(targetDir)) {
  const stat = fs.lstatSync(targetDir);
  if (stat.isSymbolicLink()) {
    console.log('🔗 Symlink uploads sudah aktif. Aman!');
  } else {
    console.log('📦 Migrasi file foto yang ada ke folder persisten...');
    copyFolderSync(targetDir, persistentDir); // Selamatkan file lama sebelum dihapus
    
    console.log('🗑️ Menghapus folder public/uploads bawaan untuk diganti symlink...');
    fs.rmSync(targetDir, { recursive: true, force: true });
    
    // Buat Symlink
    try {
      fs.symlinkSync(persistentDir, targetDir, 'dir');
      console.log('✅ Sukses! Folder uploads berhasil dikaitkan (Symlink) ke direktori persisten.');
    } catch (error) {
      console.error('❌ Gagal membuat symlink:', error.message);
      fs.mkdirSync(targetDir, { recursive: true });
    }
  }
} else {
  // Jika targetDir tidak ada, langsung buat symlink
  try {
    fs.symlinkSync(persistentDir, targetDir, 'dir');
    console.log('✅ Sukses membuat symlink baru!');
  } catch (error) {
    console.error('❌ Gagal membuat symlink:', error.message);
    fs.mkdirSync(targetDir, { recursive: true });
  }
}
