import ChatBox from "@/components/ChatBox";

export default function StudentChatPage() {
  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Pesan (Hubungi Guru)</h1>
      <p className="text-sm text-slate-500 mb-6">
        Ini adalah halaman demo ChatBox. Anda sedang melihat obrolan dengan Guru Pembimbing Anda.
      </p>

      {/* Demo: Siswa (ID:5) chat ke Guru (ID:1) */}
      <ChatBox 
        currentRole="siswa" 
        currentId="5" 
        targetRole="guru" 
        targetId="1" 
        targetName="Bapak/Ibu Guru" 
      />
    </div>
  );
}
