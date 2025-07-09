import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./ResetPassword.css";

const ResetPassword = () => {
  // URL parametresinden token'ı alıyoruz
  const { token } = useParams();  // Doğru yöntem
  const [password, setPassword] = useState("");  // Yeni şifre
  const [confirmPassword, setConfirmPassword] = useState("");  // Şifreyi onaylama
  const [error, setError] = useState("");  // Hata mesajı
  const [success, setSuccess] = useState("");  // Başarı mesajı

  // Şifre sıfırlama işlemini gerçekleştiren fonksiyon
  const handlePasswordReset = async () => {
    // Şifrelerin eşleşip eşleşmediğini kontrol ediyoruz
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;  // Hata durumunda işlemi sonlandırıyoruz
    }

    try {
      // API'ye POST isteği gönderiyoruz
      const response = await fetch(`http://localhost:3000/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),  // Şifreyi body'e ekliyoruz
      });

      const result = await response.json();  // Sunucudan gelen yanıtı alıyoruz
      if (response.status === 200) {
        // Başarılı olduğunda mesajı gösteriyoruz
        setSuccess("Şifreniz başarıyla güncellendi");
        setError("");  // Hata mesajını sıfırlıyoruz
      } else {
        // Başarısız olduğunda hata mesajını gösteriyoruz
        setError(result.message || "Bir hata oluştu");
        setSuccess("");  // Başarı mesajını sıfırlıyoruz
      }
    } catch (err) {
      // Sunucuya bağlanma hatası durumunda kullanıcıya bilgi veriyoruz
      setError("Sunucuya bağlanılamadı");
      setSuccess("");  // Başarı mesajını sıfırlıyoruz
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Şifrenizi Sıfırlayın</h2>
      
      {/* Hata veya başarı durumlarına göre mesaj gösteriyoruz */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* Şifre inputları */}
      <input
        type="password"
        placeholder="Yeni Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}  // Şifreyi state'e kaydediyoruz
      />
      <input
        type="password"
        placeholder="Şifreyi Onayla"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}  // Onay şifresini state'e kaydediyoruz
      />

      {/* Şifre sıfırlama butonu */}
      <button onClick={handlePasswordReset}>Şifreyi Güncelle</button>
    </div>
  );
};

export default ResetPassword;
