const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("nodemailer", { message: null });
});

router.post("/", async (req, res) => {
    const { email, subject, text } = req.body;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "adiko7634@gmail.com",  // Must match the sender
            pass: "yxpqnkxyitqxbbty", // Generate App Password from Google
        },
    });

    const mailOptions = {
        from: "adiko7634@gmail.com",  // Must match the `user` in auth
        to: email,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.render("nodemailer", { message: "Email sent successfully!" });
    } catch (err) {
        console.error(err);
        res.render("nodemailer", { message: "Failed to send email." });
    }
});

module.exports = router;
