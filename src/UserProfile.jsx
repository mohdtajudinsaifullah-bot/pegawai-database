import React, { useState, useEffect } from 'react';
import { User, Home, LogOut, FileText, Heart, Baby, MapPin, TrendingUp, Calendar, Briefcase, Building, Map, RefreshCw, Edit2, Save, Plus, Trash2, Mail, Phone, Award } from 'lucide-react';

export default function UserProfile({ currentUser, selectedNokp, onBackToDashboard, onLogout }) {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_wVex_2Gosx8QivW8jdWeVOrhFjCf5yzgGcSEP7nzUw2vZZHtgBmyVWIZF8_fUgki/exec';
  
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [profileForm, setProfileForm] = useState({
    nama: '',
    nokp: '',
    jawatan: '',
    jabatan: '',
    email: '',
    notel: '',
    gambarPasport: '',
    gredSemasa: '',
    tarikhLantikLS: '',
    alamatSemasa: ''
  });
  
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

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      console.log('🔵 Loading profile data from PEGAWAI sheet...');
      console.log('📤 user_content_key:', currentUser.user_content_key);
      
      const response = await fetch(
        `${SCRIPT_URL}?action=getPegawai&user_content_key=${currentUser.user_content_key}`
      );
      
      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Pegawai API response:', data);
      
      if (data.success && data.data) {
        console.log('✅ Profile data loaded:', data.data);
        setProfileData(data.data);
        setProfileForm({
          nama: data.data?.nama || '',
          nokp: data.data?.nokp || '',
          jawatan: data.data?.jawatan || '',
          jabatan: data.data?.jabatan || '',
          email: data.data?.email || '',
          notel: data.data?.notel || '',
          gambarPasport: data.data?.gambarPasport || '',
          gredSemasa: data.data?.gredSemasa || '',
          tarikhLantikLS: data.data?.tarikhLantikLS || '',
          alamatSemasa: data.data?.alamatSemasa || ''
        });
      } else {
        console.log('⚠️ No profile data found, using currentUser fallback');
        const userData = {
          nama: currentUser?.nama || '',
          nokp: currentUser?.nokp || currentUser?.user_content_key || '',
          jawatan: '',
          jabatan: '',
          email: '',
          notel: '',
          gambarPasport: '',
          gredSemasa: '',
          tarikhLantikLS: '',
          alamatSemasa: ''
        };
        setProfileData(userData);
        setProfileForm(userData);
      }
    } catch (error) {
      console.error('💥 Error loading profile:', error);
      const userData = {
        nama: currentUser?.nama || '',
        nokp: currentUser?.nokp || currentUser?.user_content_key || '',
        jawatan: '',
        jabatan: '',
        email: '',
        notel: '',
        gambarPasport: '',
        gredSemasa: '',
        tarikhLantikLS: '',
        alamatSemasa: ''
      };
      setProfileData(userData);
      setProfileForm(userData);
    }
    setIsLoading(false);
  };

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Saiz gambar terlalu besar! Maksimum 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      let imageUrl = profileForm.gambarPasport;
      
      // Upload image if selected
      if (selectedImage) {
        console.log('🔵 Uploading image...');
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        
        const base64Data = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
        });
        
        const uploadResponse = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'uploadImage',
            imageData: base64Data,
            fileName: `${profileForm.nokp}_${Date.now()}.jpg`,
            nokp: profileForm.nokp
          })
        });
        
        const uploadResult = await uploadResponse.json();
        console.log('📦 Upload response:', uploadResult);
        
        if (uploadResult.success) {
          imageUrl = uploadResult.imageUrl;
          console.log('✅ Image uploaded:', imageUrl);
        } else {
          throw new Error(uploadResult.message || 'Gagal memuat naik gambar');
        }
      }
      
      // Update profile data
      console.log('🔵 Updating profile...');
      const updateResponse = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'updatePegawai',
          nokp: currentUser.user_content_key,
          data: {
            ...profileForm,
            gambarPasport: imageUrl
          }
        })
      });
      
      const updateResult = await updateResponse.json();
      console.log('📦 Update response:', updateResult);
      
      if (updateResult.success) {
        console.log('✅ Profile updated successfully');
        alert('Profil berjaya dikemaskini!');
        setIsEditingProfile(false);
        setSelectedImage(null);
        setImagePreview(null);
        // Reload profile data
        await loadProfileData();
      } else {
        throw new Error(updateResult.message || 'Gagal mengemaskini profil');
      }
      
    } catch (error) {
      console.error('💥 Error saving profile:', error);
      alert('Ralat: ' + error.message);
    }
    setIsSaving(false);
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
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Maklumat Pegawai</h2>
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

              {/* EDIT MODAL */}
              {isEditingProfile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-gray-800">Kemaskini Profil</h3>
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Image Upload */}
                      <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg">
                        <div className="relative">
                          {imagePreview || profileForm.gambarPasport ? (
                            <img 
                              src={imagePreview || profileForm.gambarPasport} 
                              alt="Preview" 
                              className="w-32 h-32 rounded-lg object-cover border-4 border-indigo-200"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center border-4 border-indigo-200">
                              <User className="w-16 h-16 text-indigo-400" />
                            </div>
                          )}
                        </div>
                        <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Pilih Gambar
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500">Max 5MB (JPG, PNG)</p>
                      </div>

                      {/* Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Penuh</label>
                          <input
                            type="text"
                            value={profileForm.nama}
                            onChange={(e) => setProfileForm({...profileForm, nama: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">No. KP</label>
                          <input
                            type="text"
                            value={profileForm.nokp}
                            onChange={(e) => setProfileForm({...profileForm, nokp: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gred Semasa</label>
                          <input
                            type="text"
                            value={profileForm.gredSemasa}
                            onChange={(e) => setProfileForm({...profileForm, gredSemasa: e.target.value})}
                            placeholder="Contoh: LS41, LS44"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Jawatan Semasa</label>
                          <input
                            type="text"
                            value={profileForm.jawatan}
                            onChange={(e) => setProfileForm({...profileForm, jawatan: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan Semasa</label>
                          <input
                            type="text"
                            value={profileForm.jabatan}
                            onChange={(e) => setProfileForm({...profileForm, jabatan: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tarikh Lantik Skim LS</label>
                          <input
                            type="date"
                            value={profileForm.tarikhLantikLS}
                            onChange={(e) => setProfileForm({...profileForm, tarikhLantikLS: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">No. Telefon</label>
                          <input
                            type="tel"
                            value={profileForm.notel}
                            onChange={(e) => setProfileForm({...profileForm, notel: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Semasa</label>
                          <textarea
                            value={profileForm.alamatSemasa}
                            onChange={(e) => setProfileForm({...profileForm, alamatSemasa: e.target.value})}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        disabled={isSaving}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Simpan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Photo Section */}
              <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border-2 border-indigo-100">
                <div className="flex-shrink-0">
                  {profileData?.gambarPasport ? (
                    <img 
                      src={profileData.gambarPasport} 
                      alt="Gambar Pasport" 
                      className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%23e5e7eb" width="128" height="128"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="%239ca3af"%3E?%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="w-16 h-16 text-indigo-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{profileData?.nama || '-'}</h3>
                  <p className="text-gray-600 mb-2">{profileData?.jawatan || '-'}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-700">
                      <FileText className="w-4 h-4" />
                      {profileData?.nokp || '-'}
                    </span>
                    {profileData?.gredSemasa && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                        <Award className="w-4 h-4" />
                        {profileData.gredSemasa}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Jawatan Semasa</p>
                    <p className="text-gray-800 font-medium">{profileData?.jawatan || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Building className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Jabatan Semasa</p>
                    <p className="text-gray-800 font-medium">{profileData?.jabatan || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Award className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Gred Semasa</p>
                    <p className="text-gray-800 font-medium">{profileData?.gredSemasa || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Tarikh Lantik Skim LS</p>
                    <p className="text-gray-800 font-medium">{profileData?.tarikhLantikLS || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <p className="text-gray-800 font-medium break-all">{profileData?.email || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">No. Telefon</p>
                    <p className="text-gray-800 font-medium">{profileData?.notel || '-'}</p>
                  </div>
                </div>

                <div className="md:col-span-2 flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Alamat Semasa</p>
                    <p className="text-gray-800 font-medium whitespace-pre-wrap">{profileData?.alamatSemasa || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

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