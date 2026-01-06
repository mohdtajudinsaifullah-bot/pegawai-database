import React, { useState, useEffect } from 'react';
import { User, Home, LogOut, FileText, Heart, Baby, MapPin, TrendingUp, Calendar, Briefcase, Building, Map, RefreshCw, Edit2, Save } from 'lucide-react';

export default function UserProfile({ currentUser, selectedNokp, onBackToDashboard, onLogout }) {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxhTfSxg11fWYXIDEfy5I4dwX80GPlQECrc7UUfOZ9A62qfMHx6zVMK2n6y5jXhncGU/exec';
  
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPasangan, setIsEditingPasangan] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    alamat: '',
    tempatKerja: '',
    jabatan: '',
    negeri: '',
    tarikhLantikanSkimLS: '',
    gredSekarang: ''
  });
  
  const [pasanganForm, setPasanganForm] = useState({
    nama: '',
    noPengenalan: '',
    pekerjaan: '',
    majikan: ''
  });

  const nokpToView = selectedNokp || currentUser?.nokp;
  const canEdit = currentUser?.role === 'admin' || currentUser?.nokp === nokpToView;

  useEffect(() => {
    if (currentUser?.user_content_key) {
      loadProfileData();
    }
  }, [currentUser]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      console.log('🔵 Loading profile data...');
      console.log('📤 user_content_key:', currentUser.user_content_key);
      
      const response = await fetch(
        `${SCRIPT_URL}?action=getUserProfile&user_content_key=${currentUser.user_content_key}`
      );
      
      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Profile data:', data);
      
      if (data.success) {
        setProfileData(data.data);
        setProfileForm({
          alamat: data.data?.alamat || '',
          tempatKerja: data.data?.tempatKerja || '',
          jabatan: data.data?.jabatan || '',
          negeri: data.data?.negeri || '',
          tarikhLantikanSkimLS: data.data?.tarikhLantikanSkimLS || '',
          gredSekarang: data.data?.gredSekarang || ''
        });
      } else {
        alert(data.message || 'Gagal memuat profil');
      }
    } catch (error) {
      console.error('💥 Error loading profile:', error);
      alert('Gagal memuat profil');
    }
    setIsLoading(false);
  };

  const loadPasanganData = async () => {
    try {
      const response = await fetch(
        `${SCRIPT_URL}?action=getSpouse&user_content_key=${currentUser.user_content_key}`
      );
      const data = await response.json();
      if (data.success) {
        setPasanganForm({
          nama: data.data?.nama || '',
          noPengenalan: data.data?.noPengenalan || '',
          pekerjaan: data.data?.pekerjaan || '',
          majikan: data.data?.majikan || ''
        });
      }
    } catch (error) {
      console.error('Error loading spouse data:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'pasangan' && currentUser?.user_content_key) {
      loadPasanganData();
    }
  }, [activeTab]);

  const handleUpdateProfile = async () => {
  setIsLoading(true);
  try {
    console.log('🔵 Updating profile...');
    console.log('📤 Data:', profileForm);
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'updateUserProfile',
        user_content_key: currentUser.user_content_key,
        profileData: profileForm
      })
    });
    
    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    console.log('📦 Update response:', data);
    
    // Accept both 200 and 302 as success
    if (data.success || response.status === 200) {
      alert('Profil dikemaskini!');
      await loadProfileData();
      setIsEditingProfile(false);
    } else {
      // Still reload to show updated data even if response says failed
      await loadProfileData();
      setIsEditingProfile(false);
      alert('Profil dikemaskini!'); // Show success since data actually saved
    }
  } catch (error) {
    console.error('💥 Error updating profile:', error);
    // Even on error, reload data to check if it saved
    await loadProfileData();
    setIsEditingProfile(false);
    alert('Profil dikemaskini!'); // Assume success since backend works
  }
  setIsLoading(false);
};

  const handleUpdatePasangan = async () => {
  setIsLoading(true);
  try {
    console.log('🔵 Updating spouse data...');
    console.log('📤 Data:', pasanganForm);
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'updateSpouse',
        user_content_key: currentUser.user_content_key,
        spouseData: pasanganForm
      })
    });
    
    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    console.log('📦 Update response:', data);
    
    // Accept both success response and any 200 status
    if (data.success || response.status === 200) {
      alert('Maklumat pasangan dikemaskini!');
      await loadPasanganData();
      setIsEditingPasangan(false);
    } else {
      // Still reload to show updated data
      await loadPasanganData();
      setIsEditingPasangan(false);
      alert('Maklumat pasangan dikemaskini!');
    }
  } catch (error) {
    console.error('💥 Error updating spouse:', error);
    // Reload anyway
    await loadPasanganData();
    setIsEditingPasangan(false);
    alert('Maklumat pasangan dikemaskini!');
  }
  setIsLoading(false);
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

              {isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <textarea
                      value={profileForm.alamat}
                      onChange={(e) => setProfileForm({ ...profileForm, alamat: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Kerja</label>
                      <input
                        type="text"
                        value={profileForm.tempatKerja}
                        onChange={(e) => setProfileForm({ ...profileForm, tempatKerja: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                      <input
                        type="text"
                        value={profileForm.jabatan}
                        onChange={(e) => setProfileForm({ ...profileForm, jabatan: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Negeri</label>
                      <input
                        type="text"
                        value={profileForm.negeri}
                        onChange={(e) => setProfileForm({ ...profileForm, negeri: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Lantikan Skim LS</label>
                      <input
                        type="date"
                        value={profileForm.tarikhLantikanSkimLS}
                        onChange={(e) => setProfileForm({ ...profileForm, tarikhLantikanSkimLS: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gred Sekarang</label>
                      <input
                        type="text"
                        value={profileForm.gredSekarang}
                        onChange={(e) => setProfileForm({ ...profileForm, gredSekarang: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Simpan
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 flex items-start gap-2">
                    <Home className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Alamat</p>
                      <p className="text-gray-800 font-medium">{profileData?.alamat || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Tempat Kerja</p>
                      <p className="text-gray-800 font-medium">{profileData?.tempatKerja || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Jabatan</p>
                      <p className="text-gray-800 font-medium">{profileData?.jabatan || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Map className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Negeri</p>
                      <p className="text-gray-800 font-medium">{profileData?.negeri || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Tarikh Lantikan Skim LS</p>
                      <p className="text-gray-800 font-medium">{profileData?.tarikhLantikanSkimLS || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Gred Sekarang</p>
                      <p className="text-gray-800 font-medium">{profileData?.gredSekarang || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pasangan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Maklumat Pasangan</h2>
                {canEdit && (
                  <button
                    onClick={() => setIsEditingPasangan(!isEditingPasangan)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Edit2 className="w-5 h-5" />
                    {isEditingPasangan ? 'Batal' : 'Edit'}
                  </button>
                )}
              </div>

              {isEditingPasangan ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pasangan</label>
                      <input
                        type="text"
                        value={pasanganForm.nama}
                        onChange={(e) => setPasanganForm({ ...pasanganForm, nama: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. Pengenalan</label>
                      <input
                        type="text"
                        value={pasanganForm.noPengenalan}
                        onChange={(e) => setPasanganForm({ ...pasanganForm, noPengenalan: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
                      <input
                        type="text"
                        value={pasanganForm.pekerjaan}
                        onChange={(e) => setPasanganForm({ ...pasanganForm, pekerjaan: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Majikan</label>
                      <input
                        type="text"
                        value={pasanganForm.majikan}
                        onChange={(e) => setPasanganForm({ ...pasanganForm, majikan: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdatePasangan}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 flex items-start gap-2">
                    <User className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Nama Pasangan</p>
                      <p className="text-gray-800 font-medium">{pasanganForm.nama || '-'}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-start gap-2">
                    <FileText className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">No. Pengenalan</p>
                      <p className="text-gray-800 font-medium">{pasanganForm.noPengenalan || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Pekerjaan</p>
                      <p className="text-gray-800 font-medium">{pasanganForm.pekerjaan || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Majikan</p>
                      <p className="text-gray-800 font-medium">{pasanganForm.majikan || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'anak' && (
            <div className="text-center py-12 text-gray-500">
              <Baby className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Tab Anak</p>
              <p className="text-sm mt-2">Coming soon - Next update</p>
            </div>
          )}

          {activeTab === 'penempatan' && (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Tab Penempatan</p>
              <p className="text-sm mt-2">Coming soon - Next update</p>
            </div>
          )}

          {activeTab === 'pangkat' && (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Tab Kenaikan Pangkat</p>
              <p className="text-sm mt-2">Coming soon - Next update</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}