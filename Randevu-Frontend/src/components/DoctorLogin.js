import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import './Login.css';

const DoctorLogin = ({ setDoctor }) => {
  const [tc, setTc] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleDoctorLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/doctor-login', { tc, birthDate });
      
      setMessage(response.data.message);
      const loggedDoctor = response.data.doctor;
      localStorage.setItem('doctor', JSON.stringify(loggedDoctor));
      localStorage.setItem('doctorId', loggedDoctor._id);
      setDoctor(loggedDoctor);
      navigate('/doctor-panel'); // İstersen doktor ana sayfa route'u burası olabilir
    } catch (error) {
      setMessage("Giriş işlemi sırasında bir hata oluştu veya bilgiler yanlış.");
    }
  };

  return (
    <div className="app-container">
      <div className="form-container">
        <h2>Doktor Girişi</h2>
        <form onSubmit={handleDoctorLogin}>
          <div>
            <label>TC Kimlik No</label>
            <input
              type="text"
              value={tc}
              onChange={(e) => setTc(e.target.value)}
              required
              maxLength={11}
              pattern="\d{11}" // 11 haneli sayı kontrolü
              title="11 haneli TC Kimlik numarası giriniz"
            />
          </div>
          <div>
            <label>Şifre</label>
            <input
              type="text"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              maxLength={8}
              pattern="\d{8}" // 8 haneli sayı kontrolü
              title="Doğum tarihi 8 haneli olarak (ör. 19750821) giriniz"
            />
          </div>
          <button type="submit">Giriş Yap</button>
        </form>

        {message && <p>{message}</p>}

        {/* Kullanıcı girişi için link */}
        <p>Kullanıcı girişi için <Link to="/login">tıklayın</Link></p>
      </div>
    </div>
  );
};

export default DoctorLogin;
