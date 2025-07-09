import React, { useState } from 'react';
import { Link } from 'react-router-dom';  
import axios from 'axios';
import './Register.css';

const Register = () => {
  // State değişkenlerini tanımlıyoruz
  const [name, setName] = useState("");  // Kullanıcı adı
  const [email, setEmail] = useState("");  // Kullanıcı emaili
  const [password, setPassword] = useState("");  // Kullanıcı şifresi
  const [message, setMessage] = useState("");  // Backend'den gelen mesaj

  // Kayıt işlemi sırasında yapılacakları tanımlayan fonksiyon
  const handleRegister = async (e) => {
    e.preventDefault(); // Formun sayfayı yenilemesini engeller

    try {
      // Backend'e kayıt verilerini gönderiyoruz
      const response = await axios.post('http://localhost:3000/register', { name, email, password });
      setMessage(response.data.message); // Backend'den gelen mesajı state'e kaydet
    } catch (error) {
      // Hata durumunda kullanıcıya mesaj göster
      setMessage("Kayıt işlemi sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="app-container">
      <div className="form-container">
        <h2>Kayıt Ol</h2>
        {/* Kayıt formunu oluşturuyoruz */}
        <form onSubmit={handleRegister}>
          <div>
            <label>Ad Soyad</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}  // Ad soyad değiştikçe state güncellenir
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}  // Email değiştikçe state güncellenir
              required
            />
          </div>
          <div>
            <label>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}  // Şifre değiştikçe state güncellenir
              required
            />
          </div>
          <button type="submit">Kayıt Ol</button> {/* Kayıt ol butonu */}
        </form>

        {/* Backend'den gelen mesajı göster */}
        {message && <p>{message}</p>}

        {/* Zaten hesabı olanlar için giriş yapma bağlantısı */}
        <p>Zaten hesabınız var mı? <Link to="/login">Giriş yap</Link></p>
      </div>
    </div>
  );
};

export default Register;
