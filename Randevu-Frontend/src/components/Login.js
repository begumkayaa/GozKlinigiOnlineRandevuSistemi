import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import './Login.css';

const Login = ({ setUser }) => {
  // Kullanıcı email, şifre ve mesaj state'lerini tanımlıyoruz
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Sayfa yönlendirme için hook

  // Giriş işlemini gerçekleştiren fonksiyon
  const handleLogin = async (e) => {
    e.preventDefault(); // Formun sayfa yenilenmesini engelle

    try {
      // Backend'e giriş bilgilerini gönderiyoruz
      const response = await axios.post('http://localhost:3000/login', { email, password });
      
      setMessage(response.data.message); // Backend'den gelen mesajı set et
      const loggedUser = response.data.user; // Kullanıcı bilgisini al
      localStorage.setItem('user', JSON.stringify(loggedUser)); // Kullanıcıyı localStorage'a kaydet
      localStorage.setItem('userId', loggedUser._id);
      setUser(loggedUser); // Parent component'e kullanıcı bilgisini ilet
      navigate('/'); // Ana sayfaya yönlendir
    } catch (error) {
      // Hata durumunda mesajı göster
      setMessage("Giriş işlemi sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="app-container">
      <div className="form-container">
        <h2>Giriş Yap</h2>
        <form onSubmit={handleLogin}> {/* Formu gönderdiğinde handleLogin çalışacak */}
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Email inputu değiştikçe state güncellenir
              required
            />
          </div>
          <div>
            <label>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Şifre inputu değiştikçe state güncellenir
              required
            />
          </div>
          <button type="submit">Giriş Yap</button> {/* Formu gönder butonu */}
        </form>

        {/* Eğer mesaj varsa (başarı veya hata) göster */}
        {message && <p>{message}</p>}
        
        {/* Hesabınız yoksa kayıt sayfasına yönlendiren link */}
        <p>Hesabınız yok mu? <Link to="/register">Kayıt ol</Link></p>  
        
        {/* Şifremi unuttum sayfasına yönlendiren link */}
        <p>Şifrenizi mi unuttunuz? <Link to="/forgot-password">Şifremi Unuttum</Link></p>
        {/*Doktor Girişi linki*/}
        <p>Doktor girişi için <Link to="/doctor-login">buraya tıklayın</Link></p>

      </div>
    </div>
  );
};

export default Login;
