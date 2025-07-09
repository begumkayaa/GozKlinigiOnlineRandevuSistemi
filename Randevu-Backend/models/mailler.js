// Nodemailer kütüphanesini içe aktar
const nodemailer = require("nodemailer");

// E-posta gönderme işlemini gerçekleştiren asenkron fonksiyon
async function sendMail(to, subject, text) {
  // Gmail servisi kullanılarak bir mail transporter (taşıyıcı) oluşturuluyor
  const transporter = nodemailer.createTransport({
    service: "gmail", // Gmail servisi kullanılacak
    auth: {
      user: "ahmetsarraf1@gmail.com",    // Gönderenin e-posta adresi (kendi Gmail hesabın)
      pass: "uqnf tzhn nkzw tlvp"        // Gmail için oluşturulan uygulama şifresi
    }
  });

  // Mail gönderme işlemi gerçekleştirilir
  await transporter.sendMail({
    from: '"Randevu Sistemi" <ahmetsarraf1@gmail.com>', // Gönderen bilgisi
    to,      // Alıcının e-posta adresi
    subject, // E-posta konusu
    text     // E-posta içeriği (düz metin)
  });
}

// Bu fonksiyon dışa aktarılır, böylece diğer dosyalarda kullanılabilir
module.exports = sendMail;
