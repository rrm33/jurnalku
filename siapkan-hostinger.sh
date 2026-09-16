#!/bin/bash

echo "📦 Mengompres (zip) Source Code untuk Hostinger..."

# Membuat file zip source code, mengecualikan folder-folder berat
zip -r jurnalku-hostinger-source.zip . -x "node_modules/*" -x ".next/*" -x ".git/*" -x "tmp/*" -x ".DS_Store"

echo "✅ Selesai! File jurnalku-hostinger-source.zip siap di-upload ke Hostinger."
echo "Di Hostinger, masukkan pengaturan sesuai panduan resmi:"
echo "- Build command: npm install && npm run build"
echo "- Start command: npm run start"
