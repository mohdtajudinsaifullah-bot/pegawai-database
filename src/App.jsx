import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Save, X, Users, LogOut, LogIn, UserPlus, RefreshCw } from 'lucide-react';

export default function PegawaiDatabase() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [pegawai, setPegawai] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredPegawai, setFilteredPegawai] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    nama: '',
    nokp: '',
    jawatan: '',
    jabatan: '',
    email: '',
    notel: ''
  });
  const [loginData, setLoginData] = useState({
    nokp: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    nama: '',
    nokp: '',
    password: '',
    confirmPassword: ''
  });

  // Load data from persistent storage
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const usersResult = await window.storage.get('pegawai_users_v2', true);
      if (usersResult) {
        setUsers(JSON.parse(usersResult.value));
      }

      const pegawaiResult = await window.storage.get('pegawai_data_v2', true);
      if (pegawaiResult) {
        const data = JSON.parse(pegawaiResult.value);
        setPegawai(data);
        setFilteredPegawai(data);
      }

      const sessionResult = await window.storage.get('current_session_v2');
      if (sessionResult) {
        const session = JSON.parse(sessionResult.value);
        setCurrentUser(session);
        setShowLogin(false);
      }
    } catch (error) {
      console.log('Starting fresh - no existing data');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const filtered = pegawai.filter(p =>
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nokp.includes(searchTerm) ||
      p.jawatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPegawai(filtered);
  }, [searchTerm, pegawai]);

  const saveUsers = async (newUsers) => {
    try {
      await window.storage.set('pegawai_users_v2', JSON.stringify(newUsers), true);
      setUsers(newUsers);
      return true;
    } catch (error) {
      console.error('Error saving users:', error);
      return false;
    }
  };

  const savePegawai = async (newPegawai) => {
    try {
      await window.storage.set('pegawai_data_v2', JSON.stringify(newPegawai), true);
      setPegawai(newPegawai);
      setFilteredPegawai(newPegawai);
      return true;
    } catch (error) {
      console.error('Error saving pegawai:', error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!loginData.nokp || !loginData.password) {
      alert('Sila isi No. KP dan Password');
      return;
    }

    const user = users.find(u => u.nokp === loginData.nokp);
    
    if (!user) {
      alert('No. KP tidak dijumpai. Sila daftar akaun baru.');
      return;
    }

    if (user.password !== loginData.password) {
      alert('Password salah!');
      return;
    }

    setCurrentUser(user);
    try {
      await window.storage.set('current_session_v2', JSON.stringify(user));
    } catch (error) {
      console.error('Session save error:', error);
    }
    setShowLogin(false);
    setLoginData({ nokp: '', password: '' });
  };

  const handleRegister = async () => {
    if (!registerData.nama || !registerData.nokp || !registerData.password || !registerData.confirmPassword) {
      alert('Sila isi semua medan');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      alert('Password tidak sama!');
      return;
    }

    if (registerData.password.length < 6) {
      alert('Password mestilah sekurang-kurangnya 6 aksara');
      return;
    }

    const existingUser = users.find(u => u.nokp === registerData.nokp);
    if (existingUser) {
      alert('No. KP ini telah didaftarkan!');
      return;
    }

    const newUser = {
      id: Date.now(),
      nama: registerData.nama,
      nokp: registerData.nokp,
      password: registerData.password,
      createdAt: new Date().toISOString()
    };

    const saved = await saveUsers([...users, newUser]);
    if (saved) {
      alert('Pendaftaran berjaya! Sila log masuk.');
      setShowRegister(false);
      setShowLogin(true);
      setRegisterData({ nama: '', nokp: '', password: '', confirmPassword: '' });
    } else {
      alert('Gagal mendaftar. Cuba lagi.');
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    try {
      await window.storage.delete('current_session_v2');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setShowLogin(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.nama || !formData.nokp || !formData.jawatan || !formData.jabatan || !formData.email || !formData.notel) {
      alert('Sila isi semua medan');
      return;
    }
    
    let success = false;
    if (editingId) {
      const updated = pegawai.map(p => 
        p.id === editingId ? { ...formData, id: editingId, addedBy: p.addedBy, updatedBy: currentUser.nokp, updatedAt: new Date().toISOString() } : p
      );
      success = await savePegawai(updated);
    } else {
      const newPegawai = { 
        ...formData, 
        id: Date.now(),
        addedBy: currentUser.nokp,
        createdAt: new Date().toISOString()
      };
      success = await savePegawai([...pegawai, newPegawai]);
    }
    
    if (success) {
      resetForm();
    } else {
      alert('Gagal menyimpan. Cuba lagi.');
    }
  };

  const handleEdit = (p) => {
    setFormData(p);
    setEditingId(p.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Adakah anda pasti mahu memadam pegawai ini?')) {
      const updated = pegawai.filter(p => p.id !== id);
      await savePegawai(updated);
    }
  };

  const resetForm = () => {
    setFormData({ nama: '', nokp: '', jawatan: '', jabatan: '', email: '', notel: '' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Users className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Database Pegawai</h1>
            <p className="text-gray-600 mt-2">Log masuk untuk meneruskan</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Kad Pengenalan
              </label>
              <input
                type="text"
                value={loginData.nokp}
                onChange={(e) => setLoginData({...loginData, nokp: e.target.value})}
                placeholder="YYMMDD-PB-XXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                placeholder="Masukkan password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              <LogIn className="w-5 h-5" />
              Log Masuk
            </button>

            <div className="text-center pt-4 border-t">
              <p className="text-gray-600 mb-3">Belum ada akaun?</p>
              <button
                onClick={() => { setShowLogin(false); setShowRegister(true); }}
                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2 mx-auto"
              >
                <UserPlus className="w-5 h-5" />
                Daftar Akaun Baru
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showRegister) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <UserPlus className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Daftar Akaun</h1>
            <p className="text-gray-600 mt-2">Cipta akaun baharu</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Penuh
              </label>
              <input
                type="text"
                value={registerData.nama}
                onChange={(e) => setRegisterData({...registerData, nama: e.target.value})}
                placeholder="Nama anda"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Kad Pengenalan
              </label>
              <input
                type="text"
                value={registerData.nokp}
                onChange={(e) => setRegisterData({...registerData, nokp: e.target.value})}
                placeholder="YYMMDD-PB-XXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                placeholder="Minimum 6 aksara"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sahkan Password
              </label>
              <input
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                placeholder="Masukkan password semula"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleRegister}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              <UserPlus className="w-5 h-5" />
              Daftar
            </button>

            <div className="text-center pt-4 border-t">
              <p className="text-gray-600 mb-3">Sudah ada akaun?</p>
              <button
                onClick={() => { setShowRegister(false); setShowLogin(true); }}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Log Masuk
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Database Pegawai</h1>
                <p className="text-sm text-gray-600">Selamat datang, {currentUser?.nama}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-5 h-5" />
                Tambah
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="w-5 h-5" />
                Log Keluar
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama, no KP, jawatan atau jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Nama</th>
                  <th className="px-6 py-3 text-left">No. KP</th>
                  <th className="px-6 py-3 text-left">Jawatan</th>
                  <th className="px-6 py-3 text-left">Jabatan</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">No. Tel</th>
                  <th className="px-6 py-3 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPegawai.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Tiada data pegawai. Klik "Tambah" untuk mula.
                    </td>
                  </tr>
                ) : (
                  filteredPegawai.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{p.nama}</td>
                      <td className="px-6 py-4 text-gray-700">{p.nokp}</td>
                      <td className="px-6 py-4 text-gray-700">{p.jawatan}</td>
                      <td className="px-6 py-4 text-gray-700">{p.jabatan}</td>
                      <td className="px-6 py-4 text-gray-700">{p.email}</td>
                      <td className="px-6 py-4 text-gray-700">{p.notel}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-center text-gray-600">
          Jumlah: {filteredPegawai.length} pegawai
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Penuh
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. Kad Pengenalan
                  </label>
                  <input
                    type="text"
                    name="nokp"
                    value={formData.nokp}
                    onChange={handleInputChange}
                    placeholder="YYMMDD-PB-XXXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jawatan
                  </label>
                  <input
                    type="text"
                    name="jawatan"
                    value={formData.jawatan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. Telefon
                  </label>
                  <input
                    type="tel"
                    name="notel"
                    value={formData.notel}
                    onChange={handleInputChange}
                    placeholder="01X-XXXXXXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Save className="w-5 h-5" />
                    Simpan
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}