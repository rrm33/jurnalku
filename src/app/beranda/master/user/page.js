"use client";

import { useState, useEffect } from "react";
import { getAllUsers, saveUser, deleteUser, resetPasswordUser } from "@/actions/user";
import { 
  Users, UserPlus, Search, Edit2, Trash2, KeyRound, 
  ShieldCheck, UserCheck, Mail, Phone, Hash, X, Check, AlertCircle 
} from "lucide-react";
import Swal from "sweetalert2";

export default function MasterUserPage() {
  const [userList, setUserList] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State Tambah / Edit
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nip: "",
    nama: "",
    email: "",
    hp: "",
    role: "guru",
    password: ""
  });

  // Modal State Reset Password
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetData, setResetData] = useState({ id: null, nama: "", newPassword: "" });

  const fetchData = async () => {
    setLoading(true);
    const res = await getAllUsers();
    if (res.success) {
      setUserList(res.data);
      setCurrentUserId(res.currentUserId);
    } else {
      Swal.fire("Error", res.message || "Gagal memuat data user", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      id: null,
      nip: "",
      nama: "",
      email: "",
      hp: "",
      role: "guru",
      password: ""
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (user) => {
    setFormData({
      id: user.id,
      nip: user.nip || "",
      nama: user.nama || "",
      email: user.email || "",
      hp: user.hp || "",
      role: user.role || "guru",
      password: ""
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = new FormData();
    if (formData.id) payload.append("id", formData.id);
    payload.append("nip", formData.nip);
    payload.append("nama", formData.nama);
    payload.append("email", formData.email);
    payload.append("hp", formData.hp);
    payload.append("role", formData.role);
    if (formData.password) payload.append("password", formData.password);

    const res = await saveUser(payload);
    setSaving(false);

    if (res.success) {
      Swal.fire("Berhasil", res.message, "success");
      setIsOpen(false);
      fetchData();
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  const handleOpenReset = (user) => {
    setResetData({
      id: user.id,
      nama: user.nama,
      newPassword: ""
    });
    setIsResetOpen(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetData.newPassword) {
      Swal.fire("Peringatan", "Password baru wajib diisi!", "warning");
      return;
    }

    Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const res = await resetPasswordUser(resetData.id, resetData.newPassword);
    
    if (res.success) {
      Swal.fire("Berhasil", res.message, "success");
      setIsResetOpen(false);
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  const handleDelete = async (user) => {
    if (user.id === currentUserId) {
      Swal.fire("Peringatan", "Anda tidak dapat menghapus akun Anda sendiri!", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: `Hapus User ${user.nama}?`,
      text: `Akun dengan NIP ${user.nip} akan dihapus permanen dari sistem.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e11d48"
    });

    if (confirm.isConfirmed) {
      Swal.fire({ title: "Menghapus...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const res = await deleteUser(user.id);
      if (res.success) {
        Swal.fire("Terhapus!", res.message, "success");
        fetchData();
      } else {
        Swal.fire("Gagal", res.message, "error");
      }
    }
  };

  const filteredUsers = userList.filter(u => {
    const q = search.toLowerCase();
    return (
      u.nama?.toLowerCase().includes(q) ||
      u.nip?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const totalAdmin = userList.filter(u => u.role === "admin").length;
  const totalGuru = userList.filter(u => u.role !== "admin").length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <Users size={28} className="text-rose-500" /> Kelola User
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manajemen akun guru dan hak akses administrator aplikasi Jurnalku.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-200 transition-all active:scale-95 w-fit"
        >
          <UserPlus size={18} />
          + Tambah User Baru
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total User</p>
            <h3 className="text-2xl font-black text-slate-800">{userList.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Administrator</p>
            <h3 className="text-2xl font-black text-purple-900">{totalAdmin}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">Guru Pengajar</p>
            <h3 className="text-2xl font-black text-rose-900">{totalGuru}</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <Search size={20} className="text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari user berdasarkan nama, NIP, atau email..."
          className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 font-medium"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Memuat data user...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            Tidak ada user yang sesuai dengan pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[11px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6">User / Guru</th>
                  <th className="py-4 px-6">Kontak</th>
                  <th className="py-4 px-6">Hak Akses (Role)</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((user) => {
                  const isMe = user.id === currentUserId;
                  const isAdmin = user.role === "admin";

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center font-bold text-slate-600 shadow-sm">
                            {user.foto ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={user.foto} alt={user.nama} className="w-full h-full object-cover" />
                            ) : (
                              user.nama ? user.nama.charAt(0).toUpperCase() : "G"
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 text-sm">{user.nama}</span>
                              {isMe && (
                                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-mono">NIP: {user.nip}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1 text-xs">
                          <p className="flex items-center gap-1.5 text-slate-600">
                            <Mail size={13} className="text-slate-400" />
                            {user.email || "-"}
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-600">
                            <Phone size={13} className="text-slate-400" />
                            {user.hp || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                            <ShieldCheck size={13} /> Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200">
                            <UserCheck size={13} /> Guru Pengajar
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenReset(user)}
                            title="Reset Password"
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors border border-transparent hover:border-amber-200"
                          >
                            <KeyRound size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(user)}
                            title="Edit User"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-200"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            title="Hapus User"
                            disabled={isMe}
                            className={`p-2 rounded-xl transition-colors ${
                              isMe 
                                ? "text-slate-300 cursor-not-allowed" 
                                : "text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                            }`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit User */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {formData.id ? "Edit Data User" : "Tambah User Baru"}
                  </h3>
                  <p className="text-xs text-slate-500">Isi data akun guru / administrator.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Hash size={13} /> NIP (Nomor Induk Pegawai) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  placeholder="Contoh: 198501012010011001"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-mono font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Ryan Rizqi Maulana, S.Kom."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail size={13} /> Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@sekolah.com"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} /> No. HP / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.hp}
                    onChange={(e) => setFormData({ ...formData, hp: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Hak Akses (Role) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.role === "guru"
                        ? "bg-rose-50 border-rose-300 text-rose-800 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="guru"
                      checked={formData.role === "guru"}
                      onChange={() => setFormData({ ...formData, role: "guru" })}
                      className="hidden"
                    />
                    <UserCheck size={18} className={formData.role === "guru" ? "text-rose-600" : "text-slate-400"} />
                    <span className="text-xs">Guru Pengajar</span>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.role === "admin"
                        ? "bg-purple-50 border-purple-300 text-purple-800 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === "admin"}
                      onChange={() => setFormData({ ...formData, role: "admin" })}
                      className="hidden"
                    />
                    <ShieldCheck size={18} className={formData.role === "admin" ? "text-purple-600" : "text-slate-400"} />
                    <span className="text-xs">Administrator</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <KeyRound size={13} /> {formData.id ? "Ganti Password (Opsional)" : "Password Awal *"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={formData.id ? "Kosongkan jika tidak ingin mengubah password" : "Default: 123456"}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-xs transition-colors shadow-md shadow-rose-200"
                >
                  {saving ? "Menyimpan..." : "Simpan User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <KeyRound size={18} className="text-amber-500" /> Reset Password
              </h3>
              <button
                type="button"
                onClick={() => setIsResetOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="py-4 space-y-4">
              <p className="text-xs text-slate-500">
                Atur password baru untuk akun <b>{resetData.nama}</b>:
              </p>

              <div>
                <input
                  type="password"
                  required
                  value={resetData.newPassword}
                  onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                  placeholder="Ketik password baru..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 text-xs shadow-md shadow-amber-200"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
