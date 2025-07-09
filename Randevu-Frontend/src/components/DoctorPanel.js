import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DoctorPanel.css";
import { useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';

const DoctorPanel = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [updating, setUpdating] = useState(false);

  const [selectedNotes, setSelectedNotes] = useState([]);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [showDoctors, setShowDoctors] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  const doctorId = localStorage.getItem("doctorId");
  const doctor = JSON.parse(localStorage.getItem("doctor"));
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/doctor/${doctorId}/appointments/${selectedDate}`);
      setAppointments(res.data);
    } catch (err) {
      console.error("Randevular getirilirken hata:", err);
    }
  };

  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/doctor`);
      setDoctors(res.data);
    } catch (err) {
      console.error("Doktorlar getirilirken hata:", err);
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const toggleDoctorsView = () => {
    if (!showDoctors) {
      fetchDoctors();
    }
    setShowDoctors(!showDoctors);
  };

  const handleLogout = () => {
    localStorage.removeItem("doctorId");
    localStorage.removeItem("doctor");
    window.location.href = "/";
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    const appointment = appointments.find(a => a._id === appointmentId);
    if (!appointment) return;

    const appointmentDate = new Date(appointment.date).toLocaleDateString("tr-TR");
    const today = new Date().toLocaleDateString("tr-TR");

    if (newStatus === "Tamamlandı" && appointmentDate !== today) {
      alert("Randevunun durumu sadece randevu günü tamamlandı olarak işaretlenebilir.");
      return;
    }

    if (appointment.status === "Tamamlandı") return;

    const noteContent = newStatus === "Tamamlandı"
      ? prompt("Tamamlanan randevu için bir not girin (isteğe bağlı):", "")
      : "";

    try {
      setUpdating(true);
      await axios.patch(`http://localhost:3000/doctor/appointment/${appointmentId}/status`, {
        status: newStatus,
        doctorId,
        noteContent,
      });
      await fetchAppointments();
    } catch (error) {
      console.error("Durum güncellenirken hata:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) return;

    try {
      setUpdating(true);
      await axios.patch(`http://localhost:3000/doctor/appointment/${appointmentId}/cancel`, {
        doctorId,
      });
      await fetchAppointments();
    } catch (error) {
      console.error("İptal sırasında hata:", error);
      alert("Randevu iptal edilemedi.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelAllAppointments = async () => {
    if (!window.confirm(`${selectedDate} tarihindeki tüm randevuları iptal etmek istiyor musunuz?`)) return;

    try {
      setUpdating(true);
      const res = await axios.patch(`http://localhost:3000/doctor/${doctorId}/appointments/cancel/${selectedDate}`);
      alert(res.data.message);
      await fetchAppointments();
    } catch (error) {
      console.error("Toplu iptal hatası:", error?.response?.data || error.message);
      alert("Tüm randevular iptal edilemedi.");
    } finally {
      setUpdating(false);
    }
  };

  const fetchUserNotes = async (userId) => {
    setNoteLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/user/${userId}/notes`);
      setSelectedNotes(res.data);
    } catch (err) {
      console.error("Notlar getirilirken hata:", err);
      setSelectedNotes([]);
    } finally {
      setNoteLoading(false);
      setNotesModalVisible(true);
    }
  };

  const handleDeleteDoctor = async (doctorIdToDelete) => {
    if (!window.confirm("Bu doktoru silmek istediğinize emin misiniz?")) return;

    try {
      setDoctorsLoading(true);
      const res = await axios.delete(`http://localhost:3000/doctor/${doctorIdToDelete}`);
      alert(res.data.message);
      fetchDoctors();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Doktor silinemedi.";
      alert(errorMessage);
      console.error("Doktor silinirken hata:", error);
    } finally {
      setDoctorsLoading(false);
    }
  };

  // Yeni eklenen fonksiyonlar:

  const handleUpdatePrice = async (doctorId) => {
    const newPrice = prompt("Yeni fiyatı giriniz (TL):");
    if (newPrice === null) return;

    const priceNumber = Number(newPrice);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      alert("Geçerli bir fiyat giriniz!");
      return;
    }

    try {
      setDoctorsLoading(true);
      await axios.patch(`http://localhost:3000/doctor/${doctorId}`, {
        fee: priceNumber, 
      });
      alert("Fiyat başarıyla güncellendi.");
      fetchDoctors();
    } catch (error) {
      console.error("Fiyat güncellenirken hata:", error);
      alert("Fiyat güncellenemedi.");
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleToggleAdmin = async (doctorId, currentAdminStatus) => {
    const confirmMsg = currentAdminStatus
      ? "Bu doktorun adminliğini kaldırmak istediğinize emin misiniz?"
      : "Bu doktoru admin yapmak istediğinize emin misiniz?";

    if (!window.confirm(confirmMsg)) return;

    try {
      setDoctorsLoading(true);
      await axios.patch(`http://localhost:3000/doctor/${doctorId}`, {
        isAdmin: !currentAdminStatus,
      });
      alert("Admin durumu başarıyla güncellendi.");
      fetchDoctors();
    } catch (error) {
      console.error("Admin durumu güncellenirken hata:", error);
      alert("Admin durumu güncellenemedi.");
    } finally {
      setDoctorsLoading(false);
    }
  };

  return (
    <div className="doctor-panel">

      {/* --- SOL TARAFTAKİ SIDEBAR --- */}
      <div className="sidebar">
        <h3>{doctor?.name} {doctor?.surname}</h3>

        <button className="logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Çıkış Yap
        </button>

        {doctor?.isAdmin && (
          <>
            <button className="toggle-doctors-button" onClick={toggleDoctorsView}>
              <i className="fas fa-user-md"></i> {showDoctors ? "Doktorları Gizle" : "Doktorları Güncelle"}
            </button>

            <button className="add-doctor-button" onClick={() => navigate("/add-doctor")}>
              <i className="fas fa-user-plus"></i> Yeni Doktor Ekle
            </button>
          </>
        )}

        <button
          className="cancel-all-button"
          onClick={handleCancelAllAppointments}
          disabled={updating || appointments.length === 0}
        >
          <i className="fas fa-calendar-times"></i> Tüm Randevuları İptal Et
        </button>
      </div>

      {/* --- ANA İÇERİK --- */}
      <div className="main-content">
        <h2 className="doctor-name">
          İyi Günler, {doctor?.name} {doctor?.surname}
        </h2>

        {showDoctors && (
          <div className="doctors-list">
            {doctorsLoading ? (
              <p>Doktorlar yükleniyor...</p>
            ) : doctors.length === 0 ? (
              <p>Doktor bulunamadı.</p>
            ) : (
              <div className="doctor-cards-container">
                {doctors.map((doc) => (
                  <div key={doc._id} className="doctor-card">
                    <img
                      src={doc.image ? `/${doc.image}` : "https://via.placeholder.com/150"}
                      alt={`${doc.name} ${doc.surname}`}
                      className="doctor-photo"
                    />
                    <h4>{doc.name} {doc.surname}</h4>
                    <p>{doc.email}</p>
                    <p>Fiyat: {doc.fee ?? "Belirtilmemiş"} ₺</p>
                    <p>Admin: {doc.isAdmin ? "Evet" : "Hayır"}</p>

                    <button
                      onClick={() => handleUpdatePrice(doc._id)}
                      disabled={doctorsLoading}
                      className="update-price-button"
                    >
                      <i className="fas fa-dollar-sign"></i> Fiyatı Güncelle
                    </button>

                    <button
                      onClick={() => handleToggleAdmin(doc._id, doc.isAdmin)}
                      disabled={doctorsLoading}
                      className="toggle-admin-button"
                    >
                      <i className="fas fa-user-shield"></i> Admin Durumunu Değiştir
                    </button>

                    <button
                      onClick={() => handleDeleteDoctor(doc._id)}
                      disabled={doctorsLoading}
                      className="delete-doctor-button"
                    >
                      <i className="fas fa-trash-alt"></i> Doktoru Sistemden Sil
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tarih seçici */}
        <div className="date-picker">
          <label>Tarih: </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Randevular */}
        <div className="appointments">
          {appointments.length === 0 ? (
            <p>Bu tarihte randevu bulunamadı.</p>
          ) : (
            <ul>
              {appointments.map((appointment) => (
                <li key={appointment._id} className="appointment-card">
                  <p><strong>Hasta:</strong> {appointment.user?.name}</p>
                  <p><strong>Email:</strong> {appointment.user?.email}</p>
                  <p><strong>Saat:</strong> {appointment.time}</p>
                  <p><strong>Durum:</strong> {appointment.status}</p>

                  <select
                    value={appointment.status}
                    onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                    disabled={updating || appointment.status === "Tamamlandı"}
                  >
                    <option value="Beklenen">Beklenen</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                  </select>

                  {appointment.status === "Tamamlandı" ? (
                    <button disabled className="completed-button">Randevu Tamamlandı</button>
                  ) : (
                    appointment.status !== "İptal Edildi" && (
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        disabled={updating}
                        className="cancel-button"
                      >
                        Randevuyu İptal Et
                      </button>
                    )
                  )}

                  <button
                    className="notes-button"
                    onClick={() => fetchUserNotes(appointment.user?._id)}
                  >
                    Notları Görüntüle
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notlar Modal */}
        {notesModalVisible && (
          <div className="notes-modal">
            <div className="notes-modal-content">
              <h3>Kullanıcı Notları</h3>
              {noteLoading ? (
                <p>Yükleniyor...</p>
              ) : selectedNotes.length === 0 ? (
                <p>Not bulunamadı.</p>
              ) : (
                <ul>
                  {selectedNotes.map((note, index) => (
                    <li key={index}>
                      <p><strong>Not:</strong> {note.content}</p>
                      <p><strong>Doktor:</strong> {note.doctor?.name || "Bilinmiyor"}</p>
                      <p><strong>Tarih:</strong> {new Date(note.createdAt).toLocaleString("tr-TR")}</p>
                    </li>
                  ))}
                </ul>
              )}
              <button
                className="close-modal-button"
                onClick={() => setNotesModalVisible(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorPanel;
