// Mongoose kütüphanesini içe aktar
const mongoose = require("mongoose");

// AppointmentNote için şema tanımlanıyor
const appointmentNoteSchema = new mongoose.Schema({
  // Notun ait olduğu randevuya referans (Appointment koleksiyonundaki ObjectId)
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },

  // Notu yazan doktorun referansı (Doctor koleksiyonundaki ObjectId)
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },

  // Notun ait olduğu kullanıcı (Appointment üzerinden ulaşmak yerine doğrudan tanımlıyoruz)
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Notun içeriği
  content: { type: String, required: true },

  // Notun oluşturulma tarihi
  createdAt: { type: Date, default: Date.now }
});

// Şemaya göre "AppointmentNote" modeli oluşturuluyor
const AppointmentNote = mongoose.model("AppointmentNote", appointmentNoteSchema);

// Model dışa aktarılıyor
module.exports = AppointmentNote;
