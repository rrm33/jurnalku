const fs = require('fs');
let content = fs.readFileSync('src/app/beranda-siswa/tugas/[id]/page.js', 'utf8');

const effectBlock = `
  useEffect(() => {
    const handleIframeMessage = (e) => {
      if (e.origin === 'https://dartpad.dev' && e.data && e.data.type === 'ready') {
        if (iframeRef.current) {
          iframeRef.current.contentWindow.postMessage({
            sourceCode: kodeText || "import 'package:flutter/material.dart';\\n\\nvoid main() {\\n  runApp(const MyApp());\\n}\\n\\nclass MyApp extends StatelessWidget {\\n  const MyApp({super.key});\\n  @override\\n  Widget build(BuildContext context) {\\n    return const MaterialApp(\\n      home: Scaffold(\\n        body: Center(\\n          child: Text('Tulis kode program di editor sebelah kiri lalu klik Jalankan', textAlign: TextAlign.center)\\n        )\\n      )\\n    );\\n  }\\n}",
            type: 'sourceCode'
          }, '*');
        }
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [kodeText]);

  const handleSubmit = async (e) => {`;

content = content.replace('  const handleSubmit = async (e) => {', effectBlock);

fs.writeFileSync('src/app/beranda-siswa/tugas/[id]/page.js', content);
console.log("Dartpad clear patch applied!");
