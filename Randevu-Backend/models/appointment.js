// Mongoose kütüphanesini içe aktar
const mongoose = require("mongoose");

// Randevu şeması oluşturuluyor
const appointmentSchema = new mongoose.Schema({
    // Randevuyu alan doktorun referansı (Doctor koleksiyonundaki ObjectId)
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },

    // Randevuyu alan kullanıcının referansı (User koleksiyonundaki ObjectId)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Randevu tarihi
    date: { type: Date, required: true },

    // Randevu saati (örneğin "08:30" formatında string)
    time: { type: String, required: true }, // Örneğin "08:30"

    // Randevu durumu: Beklenen, İptal Edildi ya da Tamamlandı olabilir
    status: { 
        type: String, 
        enum: ["Beklenen", "İptal Edildi", "Tamamlandı","Gidilmedi"], 
        default: "Beklenen" 
    }
});

// Yukarıda tanımlanan şemaya göre "Appointment" modelini oluştur
const Appointment = mongoose.model("Appointment", appointmentSchema);

// Appointment modelini dışa aktar (başka dosyalarda kullanılmak üzere)
module.exports = Appointment;
