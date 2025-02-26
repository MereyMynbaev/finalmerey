const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

router.get("/", (req, res) => res.render("index"));
router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const userExists = await User.findOne({ username });
    if (userExists) return res.send("User already exists");

    const user = new User({ username, password });
    await user.save();
    res.redirect("/login");
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.send("Invalid credentials");
    }

    req.session.user = user;
    res.redirect("/dashboard");
});

router.get("/dashboard", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.render("index");
});

module.exports = router;
