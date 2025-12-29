import React, { useState, useEffect } from 'react';
import { Users, LogIn, UserPlus, RefreshCw } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import UserProfile from './UserProfile';

export default function App() {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx_2JX5c1CUIwkHdUUBgVNFOFHYy_2HGI5GhpH-EkURUZSTYzNR4czArmL4xifvjGs/exec';
  
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'dashboard', 'profile'
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedNokp, setSelectedNokp] = useState(null); // For admin viewing other profiles
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({ nokp: '', password: '' });
  const [registerData, setRegisterData] = useState({
    nama: '',
    nokp: '',
    password: '',
    confirmPassword: ''
  });

  // Check if user already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      
      // Route based on role
      if (user.role === 'admin') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('profile');
      }
    }
  }, []);

  // Format IC to only numbers, max 12 digits
  const formatIC = (value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 12);
  };

  // Handle IC input for both login and register
  const handleICInput = (e, isRegister = false) => {
    const formatted = formatIC(e.target.value);
    if (isRegister) {
      setRegisterData({ ...registerData, nokp: formatted });
    } else {
      setLoginData({ ...loginData, nokp: formatted });
    }
  };

  // LOGIN FUNCTION - FIXED CORS ISSUE
  const handleLogin = async () => {
    if (!loginData.nokp || !loginData.password) {
      alert('Sila isi No. KP dan Password');
      return;
    }

    if (loginData.nokp.length !== 12) {
      alert('No. KP mestilah 12 digit');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔵 Sending login request...'); 
      console.log('📤 Data:', { nokp: loginData.nokp, password: loginData.password });
      
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        // NO headers - to avoid CORS preflight
        body: JSON.stringify({
          action: 'login',
          nokp: loginData.nokp,
          password: loginData.password
        })
      });
      
      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success) {
        console.log('✅ Login success!');
        setCurrentUser(data.data);
        localStorage.setItem('currentUser', JSON.stringify(data.data));
        setLoginData({ nokp: '', password: '' });
        
        // Route based on role
        if (data.data.role === 'admin') {
          setCurrentView('dashboard');
        } else {
          setCurrentView('profile');
        }
      } else {
        console.log('❌ Login failed:', data.message);
        alert(data.message || 'No. KP atau Password salah!');
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      alert('Gagal log masuk. Sila cuba lagi.');
    }
    
    setIsLoading(false);
  };

  // REGISTER FUNCTION - FIXED CORS ISSUE
  const handleRegister = async () => {
    if (!registerData.nama || !registerData.nokp || !registerData.password || !registerData.confirmPassword) {
      alert('Sila isi semua medan');
      return;
    }

    if (registerData.nokp.length !== 12) {
      alert('No. KP mestilah 12 digit');
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

    setIsLoading(true);
    
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        // NO headers - to avoid CORS preflight
        body: JSON.stringify({
          action: 'register',
          nama: registerData.nama,
          nokp: registerData.nokp,
          password: registerData.password
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Pendaftaran berjaya! Sila log masuk.');
        setCurrentView('login');
        setRegisterData({ nama: '', nokp: '', password: '', confirmPassword: '' });
      } else {
        alert(data.message || 'Gagal mendaftar. Mungkin No. KP sudah wujud.');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Gagal mendaftar. Sila cuba lagi.');
    }
    
    setIsLoading(false);
  };

  // LOGOUT FUNCTION
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedNokp(null);
    localStorage.removeItem('currentUser');
    setCurrentView('login');
    setLoginData({ nokp: '', password: '' });
  };

  // VIEW PROFILE FUNCTION (for admin)
  const handleViewProfile = (nokp) => {
    setSelectedNokp(nokp);
    setCurrentView('profile');
  };

  // BACK TO DASHBOARD FUNCTION
  const handleBackToDashboard = () => {
    setSelectedNokp(null);
    setCurrentView('dashboard');
  };

  // RENDER BASED ON CURRENT VIEW
  
  // LOGIN VIEW
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Users className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">e-Jejak</h1>
            <p className="text-gray-600 mt-2">Sejarah Penempatan Pegawai Syariah</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Kad Pengenalan
              </label>
              <input
                type="text"
                value={loginData.nokp}
                onChange={(e) => handleICInput(e, false)}
                placeholder="840311035035"
                maxLength="12"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {loginData.nokp.length}/12 digit (tanpa dash)
              </p>
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
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sedang log masuk...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Log Masuk
                </>
              )}
            </button>

            <div className="text-center pt-4 border-t">
              <p className="text-gray-600 mb-3">Belum ada akaun?</p>
              <button
                onClick={() => setCurrentView('register')}
                disabled={isLoading}
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

  // REGISTER VIEW
  if (currentView === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <UserPlus className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Daftar Akaun</h1>
            <p className="text-gray-600 mt-2">Cipta akaun baharu untuk e-Jejak</p>
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
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Kad Pengenalan
              </label>
              <input
                type="text"
                value={registerData.nokp}
                onChange={(e) => handleICInput(e, true)}
                placeholder="840311035035"
                maxLength="12"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {registerData.nokp.length}/12 digit (tanpa dash)
              </p>
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
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {registerData.password.length}/6 aksara minimum
              </p>
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
                disabled={isLoading}
              />
              {registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">❌ Password tidak sama</p>
              )}
              {registerData.confirmPassword && registerData.password === registerData.confirmPassword && (
                <p className="text-xs text-green-500 mt-1">✓ Password sama</p>
              )}
            </div>

            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sedang mendaftar...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Daftar Akaun
                </>
              )}
            </button>

            <div className="text-center pt-4 border-t">
              <p className="text-gray-600 mb-3">Sudah ada akaun?</p>
              <button
                onClick={() => setCurrentView('login')}
                disabled={isLoading}
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

  // DASHBOARD VIEW (Admin only)
  if (currentView === 'dashboard') {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onLogout={handleLogout}
        onViewProfile={handleViewProfile}
      />
    );
  }

  // PROFILE VIEW (User sees own profile, Admin can see any profile)
  if (currentView === 'profile') {
    return (
      <UserProfile
        currentUser={currentUser}
        selectedNokp={selectedNokp}
        onBackToDashboard={currentUser?.role === 'admin' ? handleBackToDashboard : null}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}