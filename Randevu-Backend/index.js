// Gerekli kütüphaneleri içe aktar
const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const sendMail = require("./models/mailler"); // Mail gönderim fonksiyonu
const AppointmentNote = require("./models/appointmentNote"); // Yeni modelini dahil et
const app = express();
const cors = require('cors'); // CORS desteği için

// CORS'u aktif et (her yerden istek kabul edilir)
app.use(cors());

// JSON verileri alabilmek için middleware
app.use(express.json());

// Mongoose modellerini içe aktar
const User = require("./models/user");
const Doctor = require("./models/doctor");
const Appointment = require("./models/appointment");

// MongoDB bağlantısını kur
mongoose.connect("mongodb://localhost:27017/randevuDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB'ye başarılı bir şekilde bağlanıldı"))
.catch(err => console.log("❌ MongoDB bağlantı hatası:", err));

// Uygulama portu
const PORT = 3000;

// Ana sayfa (test amaçlı)
app.get("/", (req, res) => {
  res.send("Randevu Sistemi API Çalışıyor 🚀");
});

// Holiday.js
const holidayRoutes = require("./models/holiday");
app.use("/holidays", holidayRoutes);


// Kullanıcı kayıt işlemi (email doğrulamalı)
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu email zaten kayıtlı!" });
    }

    // Doğrulama token'ı üret
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const verificationUrl = `http://localhost:${PORT}/verify/${verificationToken}`;

    // Doğrulama mailini gönder
    await sendMail(
      email,
      "Hesabınızı Doğrulayın",
      `Merhaba ${name},\n\nLütfen hesabınızı aktifleştirmek için aşağıdaki linke tıklayın:\n${verificationUrl}`
    );

    // Yeni kullanıcı oluştur ve kaydet
    const newUser = new User({ name, email, password, verificationToken, isVerified: false });
    await newUser.save();

    res.status(201).json({ message: "Kayıt başarılı! Lütfen e-postanızı doğrulayın." });
  } catch (error) {
    console.error("Kayıt sırasında oluşan hata:", error);
    res.status(500).json({ message: "Kayıt sırasında hata oluştu", error });
  }
});

// Email doğrulama işlemi
app.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).send("Geçersiz veya süresi dolmuş doğrulama linki.");

    // Token süresi kontrolü yapılabilir (eklenmemişse çıkarılmalı)
    if (Date.now() > user.tokenExpiration) {
      return res.status(400).send("Doğrulama linkinizin süresi dolmuş.");
    }

    // Kullanıcıyı doğrula
    user.isVerified = true;
    user.verificationToken = undefined;
    user.tokenExpiration = undefined;
    await user.save();

    res.send("Email adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.");
  } catch (error) {
    res.status(500).send("Doğrulama sırasında hata oluştu.");
  }
});

// Kullanıcı Giriş işlemi
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Kullanıcı bulunamadı!" });
    if (user.password !== password) return res.status(400).json({ message: "Şifre yanlış!" });

    res.status(200).json({ message: "Giriş başarılı", user });
  } catch (error) {
    res.status(500).json({ message: "Giriş yapılırken hata oluştu", error });
  }
});

//Doktor ekleme
app.post("/doctor", (req, res) => {
  const { isAdmin } = req.body;

  if (!isAdmin) {
    return res.status(403).json({ message: "Bu işlem için admin olmanız gerekir." });
  }

  const {
    name,
    specialty,
    email,
    fee,
    title,
    description,
    image,
    tc,
    birthDate,
  } = req.body;

  const newDoctor = new Doctor({
    name,
    specialty,
    email,
    fee,
    title,
    description,
    image,
    tc,
    birthDate,
    isAdmin
  });

  newDoctor.save()
    .then(() => res.status(201).json({ message: "Yeni doktor eklendi." }))
    .catch(err => res.status(500).json({ message: "Kayıt sırasında hata oluştu", error: err }));
});

// Doktor silme
app.delete("/doctor/:id", async (req, res) => {
  try {
    const doctorId = req.params.id;

    const hasAppointments = await Appointment.exists({
      doctor: doctorId,
      status: { $ne: "İptal Edildi" },
    });

    if (hasAppointments) {
      return res.status(400).json({
        message: "Aktif randevusu olan doktor silinemez.",
      });
    }

    await Doctor.findByIdAndDelete(doctorId);

    res.status(200).json({ message: "Doktor başarıyla silindi." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});



//Doktor fiyat ve admin durummu güncelleme 
app.patch("/doctor/:id", async (req, res) => {
  const doctorId = req.params.id;
  const { fee, isAdmin } = req.body; // Sadece bu iki alanı güncellemek için

  try {
    // Güncellenecek alanları sadece gelen request içeriğine göre belirle
    const updateData = {};
    if (fee !== undefined) updateData.fee = fee;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doktor bulunamadı" });
    }

    res.status(200).json({ message: "Doktor başarıyla güncellendi", doctor: updatedDoctor });
  } catch (error) {
    res.status(500).json({ message: "Doktor güncellenirken hata oluştu", error });
  }
});


// Doktor Giriş
app.post("/doctor-login", async (req, res) => {
  const { tc, birthDate } = req.body;

  try {
    const doctor = await Doctor.findOne({ tc, birthDate });

    if (!doctor) {
      return res.status(400).json({ message: "Doktor bulunamadı veya bilgiler yanlış!" });
    }

    res.status(200).json({ message: "Giriş başarılı", doctor });
  } catch (error) {
    res.status(500).json({ message: "Giriş yapılırken hata oluştu", error });
  }
});



// Doktorları listeleme
app.get("/doctor", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Doktorlar alınamadı", error });
  }
});

// Randevu oluşturma
app.post("/appointment", async (req, res) => {
  const { doctorId, userId, date, time } = req.body;

  try {
    // Tarihi UTC farkı olmadan yerel zamana sabitle
    const [year, month, day] = date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day); // Saat 00:00, ay 0-indexli

    // Çakışan randevu kontrolü
    const existingApt = await Appointment.findOne({
      doctor: doctorId,
      date: localDate,
      time,
    });

    if (existingApt) {
      return res.status(400).json({
        message: "Bu tarih ve saatte zaten bir randevu var.",
      });
    }

    // Yeni randevu oluştur
    const newApt = new Appointment({
      doctor: doctorId,
      user: userId,
      date: localDate,
      time,
    });
    await newApt.save();

    // Bilgilendirme maili gönder
    try {
      const doctor = await Doctor.findById(doctorId);
      const user = await User.findById(userId);
      if (doctor && user) {
        await sendMail(
          user.email,
          "Randevunuz Başarıyla Oluşturuldu",
          `Merhaba ${user.name},\n\n${doctor.name} ile olan randevunuz başarıyla oluşturulmuştur.\nRandevu Tarihi: ${localDate.toLocaleDateString()} ${time}\n\nSağlıklı günler dileriz!`
        );
      }
    } catch (mailError) {
      console.error("📧 Mail gönderilemedi:", mailError.message);
    }

    res.status(201).json({
      message: "Randevu başarıyla oluşturuldu",
      appointment: newApt,
    });
  } catch (error) {
    console.error("❌ Randevu oluşturma hatası:", error.message);
    res.status(400).json({ message: "Randevu oluşturulamadı", error });
  }
});


// Kullanıcının geçmiş randevularını getirme
app.get("/appointments/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Bugünün tarihi (sadece yıl-ay-gün, saat 00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Geçmiş tarihli ve hâlâ "Beklenen" statüsünde olanları "Gidilmedi" yap
    await Appointment.updateMany(
      {
        user: userId,
        date: { $lt: today },
        status: "Beklenen"
      },
      { $set: { status: "Gidilmedi" } }
    );

    // Güncellenmiş randevuları getir
    const appointments = await Appointment.find({ user: userId })
      .populate("doctor", "name specialty")
      .sort({ date: -1 });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: "Geçmiş randevularınız bulunamadı." });
    }

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Randevular alınırken hata oluştu", error });
  }
});


// Şifremi unuttum: token üret ve mail gönder
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Bu email ile kayıtlı kullanıcı bulunamadı." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 dk geçerli
    await user.save();

    const resetLink = `http://localhost:3001/reset-password/${token}`;
    await sendMail(
      email,
      "Şifre Sıfırlama Bağlantısı",
      `Merhaba ${user.name},\n\nŞifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n\n${resetLink}\n\nBu bağlantı 30 dakika boyunca geçerlidir.`
    );

    res.json({ message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
  } catch (err) {
    res.status(500).json({ message: "Bir hata oluştu", error: err.message });
  }
});

// Yeni şifreyi kaydetme
app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token geçersiz veya süresi dolmuş." });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Şifreniz başarıyla güncellendi." });
  } catch (err) {
    res.status(500).json({ message: "Şifre sıfırlanırken hata oluştu", error: err.message });
  }
});

// Şifre değiştirme (kullanıcı giriş yapmış olmalı)
app.post("/change-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    if (user.password !== oldPassword) {
      return res.status(400).json({ message: "Eski şifre yanlış!" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Şifre başarıyla değiştirildi." });
  } catch (err) {
    res.status(500).json({ message: "Şifre değiştirilirken bir hata oluştu.", error: err.message });
  }
});

// Randevu iptali
app.patch("/appointments/cancel/:appointmentId", async (req, res) => {
  const { appointmentId } = req.params;
  const { userId } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId).populate('doctor user');
    if (!appointment) return res.status(404).json({ message: "Randevu bulunamadı." });

    if (appointment.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Bu randevuyu iptal etme yetkiniz yok." });
    }

    appointment.status = 'İptal Edildi';
    await appointment.save();

    try {
      await sendMail(
        appointment.user.email,
        "Randevunuz İptal Edildi",
        `Merhaba ${appointment.user.name},\n\nMaalesef ${appointment.doctor.name} ile olan randevunuz iptal edilmiştir.\n\nSağlıklı günler dileriz!`
      );
    } catch (emailError) {
      console.error("E-posta gönderimi sırasında hata oluştu:", emailError);
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Randevu iptal edilirken bir hata oluştu:", error);
    res.status(500).json({ message: "Randevu iptal edilirken bir hata oluştu", error });
  }
});

// Belirli bir doktor ve tarih için alınmış saatleri getir
app.get("/appointments/doctor/:doctorId/date/:date", async (req, res) => {
  const { doctorId, date } = req.params;

  try {
    // Tarih parametresi tam ISO formatta gelebilir, sadece tarih kısmını al
    const dateOnly = date.split("T")[0]; // "2025-05-21"

    const start = new Date(dateOnly + "T00:00:00.000Z");
    const end = new Date(dateOnly + "T23:59:59.999Z");

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Geçersiz tarih formatı" });
    }

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: start, $lte: end },
      status: { $ne: "İptal Edildi" },
    });

    const takenTimes = appointments.map((app) => {
      const [hour, min] = app.time.split(":").map((part) => part.toString().padStart(2, "0"));
      return `${hour}:${min}`;
    });

    res.json({ takenTimes });
  } catch (error) {
    console.error("Saatler getirilirken hata oluştu:", error);
    res.status(500).json({ message: "Saatler getirilirken hata oluştu", error });
  }
});


// Doktorun belirli bir gün için randevularını getir (status hariç iptal olanlar dahil değil)
app.get("/doctor/:doctorId/appointments/:date", async (req, res) => {
  const { doctorId, date } = req.params;

  try {
    // Buradaki start ve end satırlarını değiştir
    const start = new Date(date + "T00:00:00.000+03:00"); // Türkiye saati başlangıcı
    const end = new Date(date + "T23:59:59.999+03:00");   // Türkiye saati bitişi

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: start, $lte: end },
      status: { $ne: "İptal Edildi" },
    })
    .populate("user", "name email")
    .sort({ time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error("Doktorun randevuları getirilirken hata:", error);
    res.status(500).json({ message: "Randevular getirilirken hata oluştu", error });
  }
});



// Doktorun Randevuyu Güncellemesi
app.patch("/doctor/appointment/:appointmentId/status", async (req, res) => {
  const { appointmentId } = req.params;
  const { status, noteContent, doctorId } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Randevu bulunamadı." });

    // Sadece doktor kendine ait randevuyu güncelleyebilir
    if (appointment.doctor.toString() !== doctorId) {
      return res.status(403).json({ message: "Bu randevuyu değiştirme yetkiniz yok." });
    }

    appointment.status = status;
    await appointment.save();

    // Eğer tamamlandıysa ve not varsa notu ekle
    if (status === "Tamamlandı" && noteContent) {
      const newNote = new AppointmentNote({
        appointment: appointmentId,
        doctor: doctorId,
        user: appointment.user, // 👈 Kullanıcı bilgisi randevudan alınıyor
        content: noteContent,
      });
      await newNote.save();
    }

    res.json({ message: "Randevu durumu güncellendi", appointment });
  } catch (error) {
    console.error("Randevu durumu güncelleme hatası:", error);
    res.status(500).json({ message: "Randevu durumu güncellenirken hata oluştu", error });
  }
});



// Kullanıcının tüm notlarını listeleme
app.get("/user/:userId/notes", async (req, res) => {
  const { userId } = req.params;

  try {
    const notes = await AppointmentNote.find({ user: userId })
      .populate("doctor", "name") // Doktorun sadece adını getir
      .populate("user", "name surname") // Kullanıcının ad ve soyadını getir
      .populate("appointment", "date time") // Randevu tarihi ve saati
      .sort({ createdAt: -1 }); // En yeni not en üstte olsun

    res.json(notes);
  } catch (error) {
    console.error("Kullanıcı notları getirilirken hata:", error);
    res.status(500).json({ message: "Notlar getirilirken hata oluştu", error });
  }
});



// Doktorun randevu iptal etmesi
app.patch("/doctor/appointment/:appointmentId/cancel", async (req, res) => {
  const { appointmentId } = req.params;
  const { doctorId } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId).populate("user doctor");
    if (!appointment) return res.status(404).json({ message: "Randevu bulunamadı." });

    if (appointment.doctor._id.toString() !== doctorId) {
      return res.status(403).json({ message: "Bu randevuyu iptal etme yetkiniz yok." });
    }

    appointment.status = "İptal Edildi";
    await appointment.save();

    try {
      await sendMail(
        appointment.user.email,
        "Randevunuz Doktor Tarafından İptal Edildi",
        `Merhaba ${appointment.user.name},\n\n${appointment.doctor.name} tarafından randevunuz iptal edilmiştir.\n\nİyi günler dileriz.`
      );
    } catch (mailError) {
      console.error("Mail gönderilirken hata:", mailError);
    }

    res.json({ message: "Randevu iptal edildi.", appointment });
  } catch (error) {
    console.error("Randevu iptal hatası:", error);
    res.status(500).json({ message: "Randevu iptal edilirken hata oluştu", error });
  }
});

// Doktorun belirli bir gündeki tüm randevularını iptal etmesi
app.patch("/doctor/:doctorId/appointments/cancel/:date", async (req, res) => {
  const { doctorId, date } = req.params;

  try {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: start, $lte: end },
      status: { $ne: "İptal Edildi" }
    }).populate("user doctor");

    if (appointments.length === 0) {
      return res.status(404).json({ message: "İptal edilecek randevu bulunamadı." });
    }

    for (const appointment of appointments) {
      appointment.status = "İptal Edildi";
      await appointment.save();

      try {
        await sendMail(
          appointment.user.email,
          "Randevunuz Doktor Tarafından İptal Edildi",
          `Merhaba ${appointment.user.name},\n\n${appointment.doctor.name} tarafından ${date} tarihli randevunuz iptal edilmiştir.\n\nİyi günler dileriz.`
        );
      } catch (mailError) {
        console.error(`Mail gönderim hatası (${appointment.user.email}):`, mailError);
      }
    }

    res.json({ message: `${appointments.length} randevu iptal edildi.` });
  } catch (error) {
    console.error("Toplu iptal hatası:", error);
    res.status(500).json({ message: "Toplu iptal sırasında hata oluştu.", error });
  }
});




// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`✅ Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
