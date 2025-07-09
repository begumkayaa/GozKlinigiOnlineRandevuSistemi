import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css'; // CSS dosyasını da hazırladık

const ForgotPassword = () => {
  // Email ve mesaj durumu için state tanımları
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Şifre sıfırlama formu gönderildiğinde çalışacak fonksiyon
  const handleForgotPassword = async (e) => {
    e.preventDefault(); // Sayfanın yeniden yüklenmesini engelle
    try {
      // E-posta ile şifre sıfırlama isteği gönder
      const response = await axios.post("http://localhost:3000/forgot-password", { email });
      
      // Yanıt mesajını ekranda göster
      setMessage(response.data.message);
    } catch (error) {
      // Hata durumunda kullanıcıya mesaj göster
      setMessage("E-posta gönderilemedi, lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="app-container"> {/* Arka plan için kapsayıcı */}
      <div className="form-wrapper">
        <div className="forgot-password-container">
          <h2>Şifrenizi Sıfırlayın</h2>
          <form onSubmit={handleForgotPassword}>
            <div>
              <label>Email</label> {/* E-posta alanı */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // E-posta değişikliklerini güncelle
                required // Bu alan zorunlu
              />
            </div>
            {/* Şifre sıfırlama butonu */}
            <button type="submit">Şifreyi Sıfırla</button>
          </form>
          {/* Kullanıcıya gösterilecek mesaj */}
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; // Bileşeni dışa aktar
