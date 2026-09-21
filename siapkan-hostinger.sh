#!/bin/bash

echo "📦 Mengompres (zip) Source Code untuk Hostinger..."

# Membuat file zip source code, mengecualikan folder-folder berat dan file uploads lokal
zip -r jurnalku-hostinger-source.zip . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".git/*" \
  -x "tmp/*" \
  -x ".DS_Store" \
  -x "public/uploads/siswa/*" \
  -x "public/uploads/guru/*" \
  -x "public/uploads/rpp/*" \
  -x "public/uploads/informasi/*"

echo "✅ Selesai! File jurnalku-hostinger-source.zip siap di-upload ke Hostinger."
echo "⚠️ PENTING UNTUK DEPLOYMENT: Pastikan Anda membackup/memindahkan folder 'public/uploads' di server sebelum menimpa file!"
echo "Di Hostinger, masukkan pengaturan sesuai panduan resmi:"
echo "- Build command: npm install && npm run build"
echo "- Start command: npm run start"
