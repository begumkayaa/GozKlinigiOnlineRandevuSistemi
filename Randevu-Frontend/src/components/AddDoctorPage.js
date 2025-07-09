import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // <-- useNavigate import edildi
import "./AddDoctorPage.css";

const AddDoctorPage = () => {
  const navigate = useNavigate();  // <-- burada useNavigate çağrıldı

  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialty: "",
    email: "",
    fee: "",
    title: "",
    description: "",
    image: "",
    tc: "",
    birthDate: "",
  });

  const doctor = JSON.parse(localStorage.getItem("doctor"));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // birthDate: "2025-05-25" formatında geliyor
  // bunu "25052025" formatına çeviriyoruz
  const rawDate = newDoctor.birthDate; // "2025-05-25"
  const formattedDate = rawDate.split("-").reverse().join(""); // ["2025","05","25"] -> ["25","05","2025"] -> "25052025"

  try {
    const res = await axios.post("http://localhost:3000/doctor", {
      ...newDoctor,
      birthDate: formattedDate,  // dönüştürülmüş tarih
      isAdmin: doctor?.isAdmin,
    });
    alert(res.data.message);
    setNewDoctor({
      name: "",
      specialty: "",
      email: "",
      fee: "",
      title: "",
      description: "",
      image: "",
      tc: "",
      birthDate: "",
    });
    navigate("/doctor-panel");
  } catch (err) {
    alert(err.response?.data?.message || "Doktor eklenemedi.");
  }
};


  return (
    <div className="add-doctor-page">
      <h2>Yeni Doktor Ekle</h2>
      <form onSubmit={handleSubmit} className="doctor-form">
        <input name="name" placeholder="Ad" value={newDoctor.name} onChange={handleChange} required />
        <input name="specialty" placeholder="Branş" value={newDoctor.specialty} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={newDoctor.email} onChange={handleChange} required />
        <input name="fee" type="number" placeholder="Ücret" value={newDoctor.fee} onChange={handleChange} required />
        <input name="title" placeholder="Unvan" value={newDoctor.title} onChange={handleChange} />
        <textarea name="description" placeholder="Açıklama" value={newDoctor.description} onChange={handleChange} />
        <input name="image" placeholder="Resim URL" value={newDoctor.image} onChange={handleChange} />
        <input name="tc" placeholder="TC Kimlik No" value={newDoctor.tc} onChange={handleChange} required />
        <input name="birthDate" type="date" value={newDoctor.birthDate} onChange={handleChange} required />
        <button type="submit">Doktoru Ekle</button>
      </form>
    </div>
  );
};

export default AddDoctorPage;
