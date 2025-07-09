import React, { useEffect, useState } from "react";
import axios from "axios";
import './AppointmentHistory.css'; // Stil dosyası

const AppointmentHistory = () => {
  // Randevular için state'ler
  const [appointments, setAppointments] = useState([]); // Geçmiş ve iptal edilenler
  const [upcomingAppointments, setUpcomingAppointments] = useState([]); // Gelecek randevular

  // LocalStorage'dan kullanıcı bilgisi al
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const userId = savedUser?._id;

  // Tarih ve saati birleştirip Date objesi döndüren fonksiyon
  const getFullDateTime = (dateStr, timeStr) => {
    const datePart = new Date(dateStr);
    if (isNaN(datePart)) return "Geçersiz tarih";
    const [hour, minute] = timeStr.split(":").map(Number);
    datePart.setHours(hour, minute);
    return datePart;
  };

  // Sayfa yüklendiğinde kullanıcının randevularını getir
  useEffect(() => {
    axios.get(`http://localhost:3000/appointments/user/${userId}`)
      .then((response) => {
        const now = new Date();

        // Gelecek randevular: bugünden sonraki ve iptal edilmemiş
        const upcoming = response.data.filter(appointment => {
          const appointmentDate = getFullDateTime(appointment.date, appointment.time);
          return appointmentDate > now && appointment.status !== 'İptal Edildi';
        });

        // Geçmiş randevular: bugünden önceki veya iptal edilmiş
        const past = response.data.filter(appointment => {
          const appointmentDate = getFullDateTime(appointment.date, appointment.time);
          return appointmentDate <= now || appointment.status === 'İptal Edildi' || appointment.status === 'Tamamlandı';
        });

        setUpcomingAppointments(upcoming);
        setAppointments(past);
      })
      .catch((error) => {
        console.error("Randevular alınırken hata oluştu:", error);
      });
  }, [userId]);

  // Randevuyu iptal etme fonksiyonu
  const cancelAppointment = (appointmentId) => {
    const confirmCancel = window.confirm("Bu randevuyu iptal etmek istediğinizden emin misiniz?");
    if (confirmCancel) {
      axios.patch(`http://localhost:3000/appointments/cancel/${appointmentId}`, { userId })
        .then(response => {
          alert("Randevunuz başarıyla iptal edildi!");
          setUpcomingAppointments(prev => prev.filter(a => a._id !== appointmentId));
          setAppointments(prev => [...prev, { ...response.data, status: 'İptal Edildi' }]);
        })
        .catch(error => {
          console.error("Randevu iptal edilirken bir hata oluştu:", error);
        });
    }
  };

  // Duruma göre CSS sınıfı belirleyen yardımcı fonksiyon
  const getStatusClass = (status) => {
    if (status === "Tamamlandı") return "completed";
    if (status === "İptal Edildi") return "cancelled";
    return "pending";
  };

  return (
    <div className="appointment-history-container">
      {/* Gelecek Randevular */}
      <div className="appointments-left">
        <h2 className="section-title">Gelecek Randevular</h2>
        <div className="appointments-scroll">
          {upcomingAppointments.length === 0 ? (
            <p>Henüz bir randevunuz yok.</p>
          ) : (
            <ul>
              {upcomingAppointments.map((appointment) => (
                <li key={appointment._id} className="appointment-item">
                  <h3>{appointment.doctor?.name || "Doktor bilgisi yok"}</h3>
                  <p><strong>Branş:</strong> {appointment.doctor?.specialty || "Branş bilgisi yok"}</p>
                  <p>
                    <strong>Tarih:</strong>{" "}
                    {typeof getFullDateTime(appointment.date, appointment.time) === "string"
                      ? getFullDateTime(appointment.date, appointment.time)
                      : getFullDateTime(appointment.date, appointment.time).toLocaleString('tr-TR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                  </p>
                  <p><strong>Durum:</strong> {appointment.status}</p>
                  <button onClick={() => cancelAppointment(appointment._id)}>İptal Et</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Geçmiş ve İptal Edilen Randevular */}
      <div className="appointments-right">
        <h2 className="section-title">Geçmiş ve İptal Edilen Randevular</h2>
        <div className="appointments-scroll">
          {appointments.length === 0 ? (
            <p>Henüz geçmiş randevularınız yok.</p>
          ) : (
            <ul>
              {appointments.map((appointment) => (
                <li key={appointment._id} className="appointment-item">
                  <h3>{appointment.doctor?.name || "Doktor bilgisi yok"}</h3>
                  <p><strong>Branş:</strong> {appointment.doctor?.specialty || "Branş bilgisi yok"}</p>
                  <p>
                    <strong>Tarih:</strong>{" "}
                    {typeof getFullDateTime(appointment.date, appointment.time) === "string"
                      ? getFullDateTime(appointment.date, appointment.time)
                      : getFullDateTime(appointment.date, appointment.time).toLocaleString('tr-TR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                  </p>
                  <p>
                    <strong>Durum:</strong>{" "}
                    <span className={`status ${getStatusClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentHistory;
