import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  // Kullanıcı bilgilerini tutan state
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // Profil menüsünün açık/kapalı durumu
  const navigate = useNavigate(); // Sayfa yönlendirme için hook

  // Kullanıcıyı localStorage'dan alıyoruz
  useEffect(() => {
    const savedUser = localStorage.getItem('user'); // LocalStorage'dan kullanıcıyı al
    if (savedUser) {
      setUser(JSON.parse(savedUser)); // Eğer kullanıcı varsa, state'e set et
    }
  }, []); // Bu effect yalnızca component mount olduğunda çalışacak

  // Çıkış işlemi
  const handleLogout = () => {
    localStorage.removeItem('user'); // LocalStorage'dan kullanıcıyı sil
    setUser(null); // State'i sıfırla
    setMenuOpen(false); // Menü kapanacak
    navigate('/');  // Ana sayfaya yönlendir
  };

  return (
    <div className="home-wrapper">
      {/* Arka planda video oynatılıyor */}
      <video className="background-video" autoPlay loop muted>
        <source src="/videos/background-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      

      {/* Ana sayfa içeriği */}
      <div className="hero-text">
        <h1>Vita Online Sağlık – Hızlı ve Güvenli Randevu Sistemi</h1>
        <p>
          Vita Online Sağlık, Sağlık Bakanlığı onaylı altyapısıyla, anlaşmalı sağlık
          kuruluşlarında kolayca doktor randevusu almanızı sağlayan güvenilir bir online platformdur.
        </p>
        {/* Atatürk'ün alıntısı */}
        <p className="atatürk-quote">“Beni Türk hekimlerine emanet ediniz.” – Mustafa Kemal Atatürk</p>
      </div>
    </div>
  );
}

export default Home; // Bileşeni dışa aktar
