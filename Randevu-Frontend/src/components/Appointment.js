import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Appointment.css";
import { registerLocale } from "react-datepicker";
import tr from "date-fns/locale/tr";

registerLocale("tr", tr);

// Basit modal bileşeni
const Modal = ({ children, onClose }) => (
  <div className="appointment-modal-overlay" onClick={onClose}>
    <div className="appointment-modal-content panel" onClick={(e) => e.stopPropagation()}>
      <button className="appointment-modal-close-btn" onClick={onClose} aria-label="Kapat">
        &times;
      </button>
      {children}
    </div>
  </div>
);

const Appointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [disabledDates, setDisabledDates] = useState([]);
  const [selectedHour, setSelectedHour] = useState(null);
  const [showCalendar, setShowCalendar] = useState(true);
  const [takenTimes, setTakenTimes] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3000/doctor")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error(err));

    const year = new Date().getFullYear();
    axios.get(`http://localhost:3000/holidays?year=${year}`)
      .then((res) => {
        const dates = res.data.map((dateStr) => new Date(dateStr));
        setDisabledDates(dates);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const fetchTakenTimes = async () => {
      if (selectedDoctor && selectedDate) {
        const isoDate = selectedDate.toISOString().split("T")[0];
        try {
          const res = await axios.get(
            `http://localhost:3000/appointments/doctor/${selectedDoctor._id}/date/${isoDate}`
          );
          const times = Array.isArray(res.data.takenTimes)
            ? res.data.takenTimes.map(time => {
                const [h, m] = time.split(":").map(Number);
                return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
              })
            : [];
          setTakenTimes(times);
        } catch (err) {
          console.error("Alınmış saatler getirilirken hata:", err);
          setTakenTimes([]);
        }
      }
    };
    fetchTakenTimes();
  }, [selectedDoctor, selectedDate]);

  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  const handleRandevuClick = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedHour(null);
    setShowCalendar(true);
  };

  const closeModal = () => {
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedHour(null);
    setShowCalendar(true);
  };

  const handleAppointmentSubmit = async (hour, min) => {
    if (!selectedDoctor || !selectedDate) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Lütfen giriş yapın.");
      return;
    }

    const formatted = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const day = selectedDate.getDate().toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    const appointmentData = {
      doctorId: selectedDoctor._id,
      userId,
      date: formattedDate,
      time: formatted,
    };

    try {
      await axios.post("http://localhost:3000/appointment", appointmentData);
      alert("✅ Randevunuz başarıyla oluşturuldu!");
      setTakenTimes(prev => [...prev, formatted]);
      closeModal();
    } catch (err) {
      console.error(err);
      alert("❌ Randevu oluşturulamadı: " + (err.response?.data?.message || err.message));
    }
  };

  const hours = Array.from({ length: 9 }, (_, i) => 8 + i);
  const minutes = [10, 20, 30, 40, 50];

  const handleImageClick = (imageSrc) => setZoomedImage(imageSrc);
  const closeZoomModal = () => setZoomedImage(null);

  return (
    <div className="appointment-container">
      <h1>Doktorlar</h1>
      <div className="appointment-doctor-list">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="appointment-doctor-card">
            <img
              src={`${process.env.PUBLIC_URL}/${doctor.image}`}
              alt={doctor.name}
              className="appointment-doctor-img"
              style={{ cursor: "pointer" }}
              onClick={() => handleImageClick(`${process.env.PUBLIC_URL}/${doctor.image}`)}
            />
            <div className="appointment-doctor-info">
              <h2>{doctor.title} {doctor.name}</h2>
              <p><strong>Uzmanlık:</strong> {doctor.specialty}</p>
              {doctor.description && <p className="appointment-doctor-desc">{doctor.description}</p>}
            </div>
            <div className="appointment-doctor-side">
              <p className="appointment-doctor-fee">{doctor.fee}₺</p>
              <button className="appointment-randevu-button" onClick={() => handleRandevuClick(doctor)}>
                Randevu Al
              </button>
            </div>
          </div>
        ))}
      </div>

      {zoomedImage && (
        <div className="appointment-image-modal-overlay" onClick={closeZoomModal}>
          <div className="appointment-image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="appointment-modal-close-btn" onClick={closeZoomModal} aria-label="Kapat">
              &times;
            </button>
            <img src={zoomedImage} alt="Büyük Doktor Görseli" className="appointment-zoomed-image" />
          </div>
        </div>
      )}

      {selectedDoctor && (
        <Modal onClose={closeModal}>
          {showCalendar ? (
            <div>
              <h2>{selectedDoctor.title} {selectedDoctor.name} için randevu tarihi seçin:</h2>
              <DatePicker
                locale="tr"
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedHour(null);
                  setShowCalendar(false);
                }}
                filterDate={(date) =>
                  isWeekday(date) &&
                  !disabledDates.some(d => d.toDateString() === date.toDateString())
                }
                minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                maxDate={new Date(new Date().setMonth(new Date().getMonth() + 1))}
                placeholderText="Tarih seçin"
                inline
              />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <button
                  onClick={() => setShowCalendar(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#1d4ed8",
                    fontWeight: "bold",
                    cursor: "pointer",
                    marginBottom: "10px",
                    fontSize: "1rem",
                  }}
                >
                  ← Geri
                </button>
                <p>
                  <strong>Seçilen tarih:</strong>{" "}
                  {selectedDate.toLocaleDateString("tr-TR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="appointment-hour-selection">
                <h3>Saat Seç:</h3>
                {hours.map((hour) => (
                  <div key={hour}>
                    <button
                      className={`appointment-hour-button ${selectedHour === hour ? "appointment-selected" : ""}`}
                      onClick={() => setSelectedHour(hour)}
                    >
                      {hour}:00
                    </button>

                    {selectedHour === hour && (
                      <div className="appointment-minutes-list">
                        {minutes.map((min) => {
                          const formattedTime = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
                          const isTaken = takenTimes.includes(formattedTime);

                          return (
                            <div
                              key={min}
                              className={`appointment-minute-item ${isTaken ? "appointment-disabled" : ""}`}
                              onClick={() => {
                                if (isTaken) return;
                                const confirmed = window.confirm(
                                  `${selectedDate.toLocaleDateString()} ${formattedTime} için randevuyu onaylıyor musunuz?`
                                );
                                if (confirmed) handleAppointmentSubmit(hour, min);
                              }}
                            >
                              {formattedTime}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Appointment;
