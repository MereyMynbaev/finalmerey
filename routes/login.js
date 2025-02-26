const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();
const nodemailer = require("nodemailer");

// Email Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your_email@gmail.com",  // Change this
        pass: "your_email_password"    // Change this (use App Password)
    }
});

// Render Login Page
router.get("/", (req, res) => {
    res.render("login", { error: null });
});

// Handle Registration
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("login", { error: "Email already exists" });
        }

        const user = new User({ email, password });
        await user.save();

        // Send confirmation email
        await transporter.sendMail({
            from: "your_email@gmail.com",
            to: email,
            subject: "Registration Successful",
            text: "Welcome! Your account has been created successfully."
        });

        res.redirect("/login");
    } catch (err) {
        res.render("login", { error: "Error registering user" });
    }
});

// Handle Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render("login", { error: "Invalid credentials" });
        }

        req.session.user = user;
        res.redirect("/dashboard");
    } catch (err) {
        res.render("login", { error: "Login error" });
    }
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

module.exports = router;
