const express = require("express");
const QRCode = require("qrcode");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("qr_code", { qrImage: null });
});

router.post("/", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.redirect("/qr");

    try {
        const qrImage = await QRCode.toDataURL(text);
        res.render("qr_code", { qrImage });
    } catch (err) {
        res.send("Error generating QR Code.");
    }
});

module.exports = router;
