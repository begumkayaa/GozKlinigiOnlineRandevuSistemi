import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';
import { UserCircle } from 'lucide-react'; // Modern kullanıcı ikonu

function Header({ user, setUser }) {
  // Menü açılıp kapanma durumu
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); // Sayfa yönlendirme işlemleri için

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('user'); // Kullanıcı bilgilerini localStorage'dan sil
    setUser(null); // Kullanıcı state'ini sıfırla
    setMenuOpen(false); // Profil menüsünü kapat
    navigate('/'); // Ana sayfaya yönlendir
  };

  return (
    <header className="main-header">
      {/* Logo */}
      <div className="logo">Vita Online Sağlık</div>
      
      {/* Menü */}
      <nav className="main-nav">
        <ul>
          <li><Link to="/" className="menu-item">Ana Sayfa</Link></li>
          <li><Link to="/about" className="menu-item">Genel Bilgiler</Link></li>
          <li><Link to="/appointment" className="menu-item">Uzmanlar / Randevu</Link></li>
          
          {/* Kullanıcı giriş yapmamışsa */}
          {!user ? (
            <li><Link to="/login" className="menu-item">Giriş Yap / Üye Ol</Link></li>
          ) : (
            <li className="profile-wrapper">
              {/* Profil ikonu, tıklanabilir */}
              <div
                className="profile-icon"
                title={user.email} // Kullanıcı emaili, üzerine gelince görülecek
                onClick={() => setMenuOpen(!menuOpen)} // Menü açılıp kapanması için
              >
                <UserCircle size={28} color="#fff" /> {/* Kullanıcı ikonu */}
              </div>
              
              {/* Menü açıldığında gösterilecek seçenekler */}
              {menuOpen && (
                <div className="profile-menu">
                  {/* Randevu geçmişi */}
                  <button
                    onClick={() => {
                      navigate('/appointments'); // Geçmişe git
                      setMenuOpen(false); // Menüyü kapat
                    }}
                  >
                    📅 Randevu Geçmişim
                  </button>
                  
                  {/* Şifre değiştir */}
                  <button
                    onClick={() => {
                      navigate('/change-password'); // Şifre değiştir sayfasına git
                      setMenuOpen(false); // Menüyü kapat
                    }}
                  >
                    🔒 Şifre Değiştir
                  </button>
                  
                  {/* Çıkış yap */}
                  <button
                    onClick={() => {
                      handleLogout(); // Çıkış işlemini yap
                      localStorage.removeItem("userId");
                      setMenuOpen(false); // Menüyü kapat
                    }}
                  >
                    🚪 Çıkış Yap
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header; // Bileşeni dışa aktar
