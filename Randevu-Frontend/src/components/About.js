import React from 'react';
import { motion } from 'framer-motion';
import './About.css';

const About = () => {
  return (
    <div className="about-section">
      <div className="about-left">
        <img src="/images/Genel_Bilgiler.png" alt="Klinik Görseli" />
      </div>

      <div className="about-right">
        <motion.h2
          className="about-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Genel Bilgiler
        </motion.h2>

        <ul className="about-list">
          <motion.li
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Klinik modern tıbbi cihazlarla donatılmıştır.
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Alanlarında uzman doktorlarla düzenli hizmet.
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            Hafta içi her gün 08.00-17.00 arası randevu alımı.
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            7/24 kesintisiz online işlem.
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            Doktorların kişiselleştirilmiş not sistemi ile düzenli tedavi.
          </motion.li>
        </ul>

        <div className="contact-info">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <strong>Adres:</strong> Atatürk Mah. Sağlık Sk. No:5, Elazığ
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.6 }}
          >
            <strong>Telefon:</strong> (0424) 123 45 67
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default About;
