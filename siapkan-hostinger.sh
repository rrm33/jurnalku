#!/bin/bash

echo "🚀 Memulai proses build untuk Hostinger..."
NODE_OPTIONS="--max-old-space-size=2048" npm run build

echo "📁 Menyiapkan folder Standalone..."
# Salin folder statis dan publik ke dalam folder standalone
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

echo "📦 Mengompres (zip) folder menjadi jurnalku-hostinger.zip..."
cd .next/standalone
zip -q -r ../../jurnalku-hostinger.zip .

echo "✅ Selesai! File jurnalku-hostinger.zip siap di-upload ke Hostinger."
echo "Di Hostinger, Anda hanya perlu mengarahkan startup file ke 'server.js'."
