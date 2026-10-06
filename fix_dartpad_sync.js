const fs = require('fs');
let content = fs.readFileSync('src/app/beranda-siswa/tugas/[id]/page.js', 'utf8');

// Remove the previous patch
const oldEffect = `  useEffect(() => {
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
  }, [kodeText]);`;

content = content.replace(oldEffect, "");

// Add state
content = content.replace(/const \[isEditing, setIsEditing\] = useState\(false\);/, 
  'const [isEditing, setIsEditing] = useState(false);\n  const [dartpadReady, setDartpadReady] = useState(false);\n  const [initialSyncDone, setInitialSyncDone] = useState(false);');

// Add new effect
const newEffect = `
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.origin === 'https://dartpad.dev' && e.data && e.data.type === 'ready') {
        setDartpadReady(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (dartpadReady && !loading && !initialSyncDone && iframeRef.current) {
      const template = "import 'package:flutter/material.dart';\\n\\nvoid main() {\\n  runApp(const MyApp());\\n}\\n\\nclass MyApp extends StatelessWidget {\\n  const MyApp({super.key});\\n  @override\\n  Widget build(BuildContext context) {\\n    return const MaterialApp(\\n      home: Scaffold(\\n        body: Center(\\n          child: Text('Tulis kode program di editor sebelah kiri lalu klik Jalankan', textAlign: TextAlign.center)\\n        )\\n      )\\n    );\\n  }\\n}";
      iframeRef.current.contentWindow.postMessage({
        sourceCode: kodeText || template,
        type: 'sourceCode'
      }, '*');
      setInitialSyncDone(true);
    }
  }, [dartpadReady, loading, initialSyncDone, kodeText]);

  const handleSubmit = async (e) => {`;

content = content.replace('  const handleSubmit = async (e) => {', newEffect);

fs.writeFileSync('src/app/beranda-siswa/tugas/[id]/page.js', content);
console.log("Dartpad sync logic applied!");
