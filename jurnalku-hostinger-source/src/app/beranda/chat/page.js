import ChatBox from "@/components/ChatBox";

export default function ChatPage() {
  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Pesan Anda</h1>
      <p className="text-sm text-slate-500 mb-6">
        Ini adalah halaman demo ChatBox. Untuk implementasi penuh, Anda perlu mengarahkan obrolan ini ke ID siswa tertentu (misalnya dari halaman detail siswa).
      </p>

      {/* Demo: Guru (ID:1) chat ke Siswa (ID:5) */}
      <ChatBox 
        currentRole="guru" 
        currentId="1" 
        targetRole="siswa" 
        targetId="5" 
        targetName="Siswa Demo" 
      />
    </div>
  );
}
