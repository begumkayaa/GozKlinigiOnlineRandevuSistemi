// Mongoose kütüphanesini içe aktar
const mongoose = require("mongoose");

// Doktor şeması tanımlanıyor
const doctorSchema = new mongoose.Schema({
  // Doktorun adı (zorunlu alan)
  name: { type: String, required: true },

  // Doktorun unvanı (örn. Prof. Dr.) - isteğe bağlı
  title: { type: String }, // 👈 Ünvan eklendi (örn. Prof. Dr.)

  // Doktorun uzmanlık alanı (zorunlu alan)
  specialty: { type: String, required: true },

  // Doktorun e-posta adresi (zorunlu ve benzersiz olmalı)
  email: { type: String, required: true, unique: true },

  // Muayene ücreti (zorunlu alan)
  fee: { type: Number, required: true },

  // Doktorun açıklaması veya profil bilgisi (isteğe bağlı)
  description: { type: String }, // Açıklama (profil)

  // Doktorun profil resmi (isteğe bağlı)
  image: { type: String },

  // Doktorun T.C. kimlik numarası (zorunlu ve benzersiz olmalı)
  tc: { type: String, required: true, unique: true }, // 👈 Giriş için kullanılacak

  // Doktorun doğum tarihi (şifre olarak kullanılacak), örnek: "19750821"
  birthDate: { type: String, required: true }, // 👈 Şifre olarak kullanılacak

  // doctorSchema içine ekle:
  isAdmin: { type: Boolean, default: false },

});

// Yukarıdaki şemaya göre "Doctor" modelini oluştur
const Doctor = mongoose.model("Doctor", doctorSchema);

// Doctor modelini dışa aktar (başka dosyalarda kullanılmak üzere)
module.exports = Doctor;
