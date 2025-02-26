const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const qr = require('qr-image');
const fs = require('fs');
const nodemailer = require('nodemailer');
const axios = require('axios');
const QRCode = require('qrcode');
const app = express();
const PORT = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/final_exam', { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, default: "user" },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

const TaskSchema = new mongoose.Schema({ task: String });
const Task = mongoose.model('Task', TaskSchema);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    return res.status(403).send('Access denied. Admins only.');
};

// Home Page (Login Required)
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

// Register
app.get('/register', (req, res) => res.render('register'));
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).send("Username already taken. Please choose another one.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    try {
        await newUser.save();
        res.redirect("/login");
    } catch (err) {
        res.status(500).send("Error registering user.");
    }
});

// Dashboard
app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('dashboard', { user: req.session.user });
});

// Login
app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
        req.session.user = user;
        res.redirect('/');
    } else {
        res.send('Invalid login credentials.');
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// QR Code Generator
app.get('/qr', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('qr', { qrCode: null });
});
app.post('/qr', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    try {
        const qrCode = await QRCode.toDataURL(req.body.text);
        res.render('qr', { qrCode });
    } catch (err) {
        res.send('Error generating QR Code: ' + err.message);
    }
});

// Email Sending
app.get('/email', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('email');
});
app.post('/email', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const { to, subject, message } = req.body;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'adiko7634@gmail.com', pass: 'yxpq nkxy itqx bbty' }
    });
    const mailOptions = { from: 'adiko7634@gmail.com', to, subject, text: message };
    try {
        await transporter.sendMail(mailOptions);
        res.send('Email sent successfully!');
    } catch (err) {
        res.send('Error sending email: ' + err.message);
    }
});

// BMI Calculator
app.get('/bmi', (req, res) => res.render('bmi', { bmi: null }));
app.post('/bmi', (req, res) => {
    let { weight, height } = req.body;
    height = height / 100;
    if (!weight || !height) {
        return res.render('bmi', { bmi: null, error: 'Please enter both weight and height' });
    }
    const bmi = (weight / (height * height)).toFixed(2);
    res.render('bmi', { bmi });
});

// Weather API
app.get('/weather', (req, res) => res.render('weather', { weather: null, error: null }));
app.post('/weather', async (req, res) => {
    const { city } = req.body;
    const apiKey = '707b8020babf50d1d594330f2cdd3c08';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    try {
        const response = await axios.get(url);
        res.render('weather', { weather: response.data, error: null });
    } catch (error) {
        res.render('weather', { weather: null, error: 'City not found!' });
    }
});

// CRUD Operations (Admin Only)
app.get('/crud', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const tasks = await Task.find();
    res.render('crud', { tasks });
});
app.post('/add-task', isAdmin, async (req, res) => {
    await Task.create({ task: req.body.task });
    res.redirect('/crud');
});
app.post('/delete-task', isAdmin, async (req, res) => {
    await Task.findByIdAndDelete(req.body.taskId);
    res.redirect('/crud');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
