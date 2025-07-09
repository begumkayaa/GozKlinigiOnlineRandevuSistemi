// Mongoose kütüphanesini içe aktar
const mongoose = require("mongoose");

// Kullanıcı şeması tanımlanıyor
const userSchema = new mongoose.Schema({
  // Kullanıcının adı (zorunlu alan)
  name: { type: String, required: true },

  // Kullanıcının e-posta adresi (zorunlu ve benzersiz)
  email: { type: String, required: true, unique: true },

  // Kullanıcının şifresi (hashlenmiş hali saklanmalı)
  password: { type: String, required: true },

  // Kullanıcının e-posta doğrulama durumu (default olarak false)
  isVerified: { type: Boolean, default: false }, // ✅ Yeni eklenen alan

  // E-posta doğrulaması için gönderilen token
  verificationToken: { type: String }, // ✅ Yeni eklenen alan

  // Şifre sıfırlama işlemi için oluşturulan token
  resetPasswordToken: { type: String }, // ✅ Şifre sıfırlama token'ı

  // Şifre sıfırlama token'ının geçerlilik süresi
  resetPasswordExpires: { type: Date }, // ✅ Şifre sıfırlama token geçerlilik süresi
});

// "User" modelini oluşturup dışa aktar
module.exports = mongoose.model("User", userSchema);
