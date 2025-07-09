const express = require("express");
const router = express.Router();

// GET /holidays?year=2025
router.get("/", async (req, res) => {
  const year = req.query.year || new Date().getFullYear();

  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/TR`);

    if (!response.ok) {
      // Dış API hata dönerse burası çalışır
      console.error(`External API error: ${response.status} ${response.statusText}`);
      return res.status(500).json({ error: "Dış API'dan tatiller alınamadı" });
    }

    const holidays = await response.json();
    const holidayDates = holidays.map(h => h.date);
    res.json(holidayDates);

  } catch (err) {
    console.error("Holidays API error:", err);
    res.status(500).json({ error: "Tatiller alınamadı" });
  }
});

module.exports = router;

