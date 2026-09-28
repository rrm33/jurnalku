const fs = require('fs');
const path = require('path');

console.log('🔄 Menyiapkan data persisten (uploads & .env) untuk Hostinger...');

const persistentDir = path.join(process.cwd(), '..', 'jurnalku_uploads');
const targetDir = path.join(process.cwd(), 'public', 'uploads');
const persistentEnv = path.join(process.cwd(), '..', '.env.jurnalku');
const targetEnv = path.join(process.cwd(), '.env');
const subFolders = ['guru', 'siswa', 'rpp', 'informasi'];

// --- 1. SETUP UPLOADS ---
if (!fs.existsSync(persistentDir)) {
  console.log(`📁 Membuat direktori persisten uploads di: ${persistentDir}`);
  fs.mkdirSync(persistentDir, { recursive: true });
}
subFolders.forEach(sub => {
  if (!fs.existsSync(path.join(persistentDir, sub))) {
    fs.mkdirSync(path.join(persistentDir, sub), { recursive: true });
  }
});

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

if (fs.existsSync(targetDir)) {
  const stat = fs.lstatSync(targetDir);
  if (stat.isSymbolicLink()) {
    console.log('🔗 Symlink uploads sudah aktif. Aman!');
  } else {
    console.log('📦 Migrasi file foto yang ada ke folder persisten...');
    copyFolderSync(targetDir, persistentDir);
    console.log('🗑️ Menghapus folder public/uploads bawaan untuk diganti symlink...');
    fs.rmSync(targetDir, { recursive: true, force: true });
    try {
      fs.symlinkSync(persistentDir, targetDir, 'dir');
      console.log('✅ Sukses membuat symlink uploads!');
    } catch (error) {
      console.error('❌ Gagal membuat symlink:', error.message);
      fs.mkdirSync(targetDir, { recursive: true });
    }
  }
} else {
  try {
    fs.symlinkSync(persistentDir, targetDir, 'dir');
    console.log('✅ Sukses membuat symlink baru!');
  } catch (error) {
    console.error('❌ Gagal membuat symlink:', error.message);
    fs.mkdirSync(targetDir, { recursive: true });
  }
}

// --- 2. SETUP .ENV ---
// Cek apakah file .env persisten ada di luar folder project
if (fs.existsSync(persistentEnv)) {
  console.log('🔐 Mengcopy file .env dari penyimpanan persisten luar...');
  fs.copyFileSync(persistentEnv, targetEnv);
  console.log('✅ File .env berhasil dipasang!');
} else {
  console.log('⚠️ File .env persisten tidak ditemukan di luar folder project.');
  console.log(`Silakan buat file bernama ".env.jurnalku" di folder luar (${path.join(process.cwd(), '..')}) agar tidak hilang saat deploy.`);
}
