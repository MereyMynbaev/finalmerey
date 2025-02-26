const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("bmi", { bmi: null });
});

router.post("/", (req, res) => {
    const { weight, height } = req.body;

    console.log("Received:", weight, height); // Debugging

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!weightNum || !heightNum || heightNum <= 0) {
        return res.render("bmi", { bmi: "Invalid input" });
    }

    const bmi = (weightNum / (heightNum * heightNum)).toFixed(2);
    res.render("bmi", { bmi });
});

module.exports = router;
