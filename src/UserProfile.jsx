import React, { useState, useEffect } from 'react';
import { User, Home, LogOut, FileText, Heart, Baby, MapPin, TrendingUp, Calendar, Briefcase, Building, Map, RefreshCw, Edit2, Save, Plus, Trash2 } from 'lucide-react';

export default function UserProfile({ currentUser, selectedNokp, onBackToDashboard, onLogout }) {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxhTfSxg11fWYXIDEfy5I4dwX80GPlQECrc7UUfOZ9A62qfMHx6zVMK2n6y5jXhncGU/exec';
  
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    nama: '',
    nokp: '',
    jawatan: '',
    jabatan: '',
    email: '',
    notel: ''
  });
  
  // Pasangan - support multiple (poligami)
  const [pasanganList, setPasanganList] = useState([]);
  const [isEditingPasangan, setIsEditingPasangan] = useState(false);
  const [newPasanganForm, setNewPasanganForm] = useState({
    nama: '',
    noPengenalan: '',
    tempatBertugas: '',
    jabatan: ''
  });

  const nokpToView = selectedNokp || currentUser?.nokp;
  const canEdit = currentUser?.role === 'admin' || currentUser?.nokp === nokpToView;

  useEffect(() => {
    if (currentUser?.user_content_key) {
      loadProfileData();
    }
  }, [currentUser]);

  // FIXED: Load from Pegawai sheet instead of Profiles
  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      console.log('🔵 Loading profile data from Pegawai sheet...');
      console.log('📤 user_content_key:', currentUser.user_content_key);
      
      const response = await fetch(
        `${SCRIPT_URL}?action=getPegawai&user_content_key=${currentUser.user_content_key}`
      );
      
      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Pegawai data:', data);
      
      if (data.success && data.data) {
        setProfileData(data.data);
        setProfileForm({
          nama: data.data?.nama || '',
          nokp: data.data?.nokp || '',
          jawatan: data.data?.jawatan || '',
          jabatan: data.data?.jabatan || '',
          email: data.data?.email || '',
          notel: data.data?.notel || ''
        });
      } else {
        console.log('⚠️ No profile data found');
      }
    } catch (error) {
      console.error('💥 Error loading profile:', error);
    }
    setIsLoading(false);
  };

  // Load pasangan data - support multiple
  const loadPasanganData = async () => {
    try {
      console.log('🔵 Loading pasangan data...');
      const response = await fetch(
        `${SCRIPT_URL}?action=getSpouse&user_content_key=${currentUser.user_content_key}`
      );
      const data = await response.json();
      console.log('📦 Pasangan response:', data);
      
      if (data.success && data.data && data.data.length > 0) {
        console.log('✅ Pasangan found:', data.data.length);
        setPasanganList(data.data);
      } else {
        console.log('ℹ️ No spouse data found');
        setPasanganList([]);
      }
    } catch (error) {
      console.error('💥 Error loading spouse data:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'pasangan' && currentUser?.user_content_key) {
      loadPasanganData();
    }
  }, [activeTab]);

  const handleAddPasangan = () => {
    // Add new pasangan to list (local state)
    setPasanganList([...pasanganList, { ...newPasanganForm, id: Date.now() }]);
    setNewPasanganForm({
      nama: '',
      noPengenalan: '',
      tempatBertugas: '',
      jabatan: ''
    });
    setIsEditingPasangan(false);
    alert('Pasangan ditambah! (Coming soon: Save to database)');
  };

  if (isLoading && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {currentUser?.role === 'admin' && onBackToDashboard && (
                <button onClick={onBackToDashboard} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <Home className="w-6 h-6 text-gray-600" />
                </button>
              )}
              <User className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Profil Pegawai</h1>
                <p className="text-sm text-gray-600">
                  {currentUser?.nokp === nokpToView ? 'Profil anda' : 'Melihat profil pegawai'}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <LogOut className="w-5 h-5" />
              Log Keluar
            </button>
          </div>

          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-5 h-5" />
              Profil
            </button>
            <button
              onClick={() => setActiveTab('pasangan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                activeTab === 'pasangan' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className="w-5 h-5" />
              Pasangan
            </button>
            <button
              onClick={() => setActiveTab('anak')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                activeTab === 'anak' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Baby className="w-5 h-5" />
              Anak
            </button>
            <button
              onClick={() => setActiveTab('penempatan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                activeTab === 'penempatan' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MapPin className="w-5 h-5" />
              Penempatan
            </button>
            <button
              onClick={() => setActiveTab('pangkat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                activeTab === 'pangkat' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Kenaikan Pangkat
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* PROFILE TAB - FIXED TO SHOW PEGAWAI DATA */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Maklumat Profil</h2>
                {canEdit && (
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Edit2 className="w-5 h-5" />
                    {isEditingProfile ? 'Batal' : 'Edit'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex items-start gap-2">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Nama</p>
                    <p className="text-gray-800 font-medium">{profileData?.nama || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">No. KP</p>
                    <p className="text-gray-800 font-medium">{profileData?.nokp || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Jawatan</p>
                    <p className="text-gray-800 font-medium">{profileData?.jawatan || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Jabatan</p>
                    <p className="text-gray-800 font-medium">{profileData?.jabatan || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800 font-medium">{profileData?.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">No. Telefon</p>
                    <p className="text-gray-800 font-medium">{profileData?.notel || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASANGAN TAB - FIXED WITH ADD BUTTON */}
          {activeTab === 'pasangan' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Maklumat Pasangan</h2>
                {canEdit && (
                  <button
                    onClick={() => setIsEditingPasangan(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Pasangan
                  </button>
                )}
              </div>

              {/* Add New Pasangan Form */}
              {isEditingPasangan && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
                  <h3 className="font-bold text-lg text-blue-900">Tambah Pasangan Baru</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pasangan</label>
                      <input
                        type="text"
                        value={newPasanganForm.nama}
                        onChange={(e) => setNewPasanganForm({ ...newPasanganForm, nama: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. Pengenalan</label>
                      <input
                        type="text"
                        value={newPasanganForm.noPengenalan}
                        onChange={(e) => setNewPasanganForm({ ...newPasanganForm, noPengenalan: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Bertugas</label>
                      <input
                        type="text"
                        value={newPasanganForm.tempatBertugas}
                        onChange={(e) => setNewPasanganForm({ ...newPasanganForm, tempatBertugas: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                      <input
                        type="text"
                        value={newPasanganForm.jabatan}
                        onChange={(e) => setNewPasanganForm({ ...newPasanganForm, jabatan: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddPasangan}
                      className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      <Save className="w-5 h-5" />
                      Simpan
                    </button>
                    <button
                      onClick={() => setIsEditingPasangan(false)}
                      className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* List of Pasangan */}
              {pasanganList.length > 0 ? (
                pasanganList.map((pasangan, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">Pasangan {pasanganList.length > 1 ? `#${index + 1}` : ''}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 flex items-start gap-2">
                        <User className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Nama Pasangan</p>
                          <p className="text-gray-800 font-medium">{pasangan.nama || '-'}</p>
                        </div>
                      </div>
                      <div className="md:col-span-2 flex items-start gap-2">
                        <FileText className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">No. Pengenalan</p>
                          <p className="text-gray-800 font-medium">{pasangan.noPengenalan || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Building className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Tempat Bertugas</p>
                          <p className="text-gray-800 font-medium">{pasangan.tempatKerja || pasangan.tempatBertugas || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Jabatan</p>
                          <p className="text-gray-800 font-medium">{pasangan.jabatan || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Tiada maklumat pasangan</p>
                </div>
              )}
            </div>
          )}

          {/* ANAK, PENEMPATAN, KENAIKAN PANGKAT - PLACEHOLDER WITH EDIT BUTTONS */}
          {activeTab === 'anak' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Maklumat Anak</h2>
                {canEdit && (
                  <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    <Plus className="w-5 h-5" />
                    Tambah Anak
                  </button>
                )}
              </div>
              <div className="text-center py-12 text-gray-500">
                <Baby className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Tab Anak</p>
                <p className="text-sm mt-2">Coming soon - Next update</p>
              </div>
            </div>
          )}

          {activeTab === 'penempatan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Sejarah Penempatan</h2>
                {canEdit && (
                  <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    <Plus className="w-5 h-5" />
                    Tambah Penempatan
                  </button>
                )}
              </div>
              <div className="text-center py-12 text-gray-500">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Tab Penempatan</p>
                <p className="text-sm mt-2">Coming soon - Next update</p>
              </div>
            </div>
          )}

          {activeTab === 'pangkat' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Sejarah Kenaikan Pangkat</h2>
                {canEdit && (
                  <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    <Plus className="w-5 h-5" />
                    Tambah Kenaikan Pangkat
                  </button>
                )}
              </div>
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Tab Kenaikan Pangkat</p>
                <p className="text-sm mt-2">Coming soon - Next update</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}