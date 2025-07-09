import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import ChangePassword from "./components/ChangePassword";
import AppointmentHistory from "./components/AppointmentHistory";
import Appointment from "./components/Appointment";
import Header from "./components/Header";
import DoctorLogin from "./components/DoctorLogin";
import DoctorPanel from "./components/DoctorPanel";
import AddDoctorPage from "./components/AddDoctorPage";  // <-- burası eklendi
import About from "./components/About";


import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const storedDoctor = localStorage.getItem("doctor");
    if (storedDoctor) {
      setDoctor(JSON.parse(storedDoctor));
    }
  }, []);

  return (
    <Router>
      <Header user={user} setUser={setUser} doctor={doctor} setDoctor={setDoctor} />
      <Routes>
        <Route path="/" element={<Home user={user} doctor={doctor} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/doctor-login" element={<DoctorLogin setDoctor={setDoctor} />} />
        <Route path="/doctor-panel" element={<DoctorPanel />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/appointments" element={<AppointmentHistory />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/add-doctor" element={<AddDoctorPage />} />  {/* <-- burası eklendi */}
        <Route path="/about" element={<About />} />

      </Routes>
    </Router>
  );
};

export default App;
