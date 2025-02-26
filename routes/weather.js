const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_KEY = "YOUR_OPENWEATHER_API_KEY"; // Replace with your API key

router.get("/", (req, res) => {
    res.render("weather", { weatherData: null });
});

router.post("/", async (req, res) => {
    const { city } = req.body;
    if (!city) return res.redirect("/weather");

    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        res.render("weather", { weatherData: response.data });
    } catch (err) {
        res.send("City not found.");
    }
});



module.exports = router;
