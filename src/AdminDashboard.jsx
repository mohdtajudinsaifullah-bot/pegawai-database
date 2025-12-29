import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Save, X, Shield, LogOut, FileText, RefreshCw } from 'lucide-react';

export default function AdminDashboard({ currentUser, onLogout, onViewProfile }) {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx_2JX5c1CUIwkHdUUBgVNFOFHYy_2HGI5GhpH-EkURUZSTYzNR4czArmL4xifvjGs/exec';
  
  const [pegawai, setPegawai] = useState([]);
  const [filteredPegawai, setFilteredPegawai] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    nokp: '',
    jawatan: '',
    jabatan: '',
    email: '',
    notel: ''
  });

  useEffect(() => {
    loadPegawaiData();
  }, []);

  useEffect(() => {
    const filtered = pegawai.filter(p =>
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nokp.includes(searchTerm) ||
      (p.jawatan && p.jawatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.jabatan && p.jabatan.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPegawai(filtered);
  }, [searchTerm, pegawai]);

  const formatIC = (value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 12);
  };

  const loadPegawaiData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(SCRIPT_URL + '?action=getPegawai');
      const data = await response.json();
      if (data.success) {
        setPegawai(data.pegawai || []);
        setFilteredPegawai(data.pegawai || []);
      }
    } catch (error) {
      console.error('Error loading pegawai:', error);
      alert('Gagal memuat data pegawai');
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nokp') {
      const formatted = formatIC(value);
      setFormData(prev => ({ ...prev, nokp: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitPegawai = async () => {
    if (!formData.nama || !formData.nokp || !formData.jawatan || !formData.jabatan || !formData.email || !formData.notel) {
      alert('Sila isi semua medan');
      return;
    }
    if (formData.nokp.length !== 12) {
      alert('No. KP mestilah 12 digit');
      return;
    }

    setIsLoading(true);
    try {
      const action = editingId ? 'updatePegawai' : 'addPegawai';
      const payload = editingId
        ? { action, id: editingId, ...formData, updatedBy: currentUser.nokp }
        : { action, ...formData, addedBy: currentUser.nokp };

      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        alert(editingId ? 'Pegawai dikemaskini!' : 'Pegawai berjaya ditambah!');
        await loadPegawaiData();
        resetForm();
      } else {
        alert('Gagal menyimpan. Sila cuba lagi.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Gagal menyimpan. Sila cuba lagi.');
    }
    setIsLoading(false);
  };

  const handleEdit = (p) => {
    setFormData({
      nama: p.nama,
      nokp: p.nokp,
      jawatan: p.jawatan || '',
      jabatan: p.jabatan || '',
      email: p.email || '',
      notel: p.notel || ''
    });
    setEditingId(p.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Adakah anda pasti mahu memadam pegawai ini?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'deletePegawai', id })
      });
      const data = await response.json();

      if (data.success) {
        alert('Pegawai berjaya dipadam!');
        await loadPegawaiData();
      } else {
        alert('Gagal memadam. Sila cuba lagi.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal memadam. Sila cuba lagi.');
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({ nama: '', nokp: '', jawatan: '', jabatan: '', email: '', notel: '' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600">Selamat datang, {currentUser?.nama}</p>
                  <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    <Shield className="w-3 h-3" />Admin
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-5 h-5" />Tambah Pegawai
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="w-5 h-5" />Log Keluar
              </button>
            </div>
          </div>

          {/* Search */}
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

        {/* Table */}
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
                      {isLoading ? 'Memuat data...' : 'Tiada data pegawai. Klik "Tambah Pegawai" untuk mula.'}
                    </td>
                  </tr>
                ) : (
                  filteredPegawai.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{p.nama}</td>
                      <td className="px-6 py-4 text-gray-700">{p.nokp}</td>
                      <td className="px-6 py-4 text-gray-700">{p.jawatan || '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{p.jabatan || '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{p.email || '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{p.notel || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => onViewProfile(p.nokp)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="View Profile"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Padam"
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

        {/* Counter */}
        <div className="mt-4 text-center text-gray-600">
          Jumlah: <span className="font-bold text-indigo-600">{filteredPegawai.length}</span> pegawai
        </div>
      </div>

      {/* Modal Add/Edit Pegawai */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penuh</label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Kad Pengenalan (12 digit)</label>
                  <input
                    type="text"
                    name="nokp"
                    value={formData.nokp}
                    onChange={handleInputChange}
                    placeholder="840311035035"
                    maxLength="12"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.nokp.length}/12 digit</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jawatan</label>
                  <input
                    type="text"
                    name="jawatan"
                    value={formData.jawatan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                  <input
                    type="text"
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Telefon</label>
                  <input
                    type="tel"
                    name="notel"
                    value={formData.notel}
                    onChange={handleInputChange}
                    placeholder="0123456789"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmitPegawai}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    onClick={resetForm}
                    disabled={isLoading}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
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