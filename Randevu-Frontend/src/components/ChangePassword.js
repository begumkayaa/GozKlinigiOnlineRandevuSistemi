import React, { useState } from 'react';
import './ChangePassword.css';
import { useNavigate } from 'react-router-dom'; // ← yönlendirme için eklendi

function ChangePassword() {
  // Şifre alanları ve hata mesajı için state tanımları
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // ← yönlendirme hook'u

  // Form gönderildiğinde çalışacak fonksiyon
  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfanın yeniden yüklenmesini engelle

    // Yeni şifreler aynı değilse hata göster
    if (newPassword !== confirmPassword) {
      setErrorMessage('Yeni şifreler uyuşmuyor.');
      return;
    }

    // LocalStorage'dan kullanıcı bilgilerini al
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    const email = loggedUser ? loggedUser.email : null;
    console.log("localStorage'dan alınan email:", email);

    // Eğer kullanıcı oturum bilgisi yoksa hata göster
    if (!email) {
      setErrorMessage("Kullanıcı bilgileri bulunamadı. Lütfen giriş yapın.");
      return;
    }

    try {
      // Sunucuya şifre değiştirme isteği gönder
      const response = await fetch('http://localhost:3000/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          oldPassword,
          newPassword,
        }),
      });

      // Yanıtı işle
      const data = await response.json();
      if (response.status === 200) {
        alert('Şifreniz başarıyla değiştirildi.');
        navigate('/'); // ← Ana sayfaya yönlendir
      } else {
        // Sunucudan dönen hata mesajını göster
        setErrorMessage(data.message);
      }
    } catch (error) {
      // Ağ hatası durumunda genel hata mesajı göster
      setErrorMessage('Bir hata oluştu, lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="app-container">
      <div className="change-password-container">
        <h2>Şifre Değiştir</h2>
        <form onSubmit={handleSubmit}>
          {/* Eski şifre girişi */}
          <div>
            <input
              type="password"
              placeholder="Eski Şifre"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          {/* Yeni şifre girişi */}
          <div>
            <input
              type="password"
              placeholder="Yeni Şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Yeni şifre tekrar girişi */}
          <div>
            <input
              type="password"
              placeholder="Yeni Şifreyi Tekrar Girin"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Hata mesajı gösterimi */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* Gönder butonu */}
          <button type="submit">Şifreyi Değiştir</button>
        </form>

        {/* Şifremi unuttum bağlantısı */}
        <p>
          Şifrenizi unuttuysanız, <a href="/forgot-password">şifre sıfırlama</a> bağlantısını kullanın.
        </p>
      </div>
    </div>
  );
}

export default ChangePassword; // Bileşeni dışa aktar
