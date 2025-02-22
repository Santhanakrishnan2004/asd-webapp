const express = require('express');
const bcrypt = require('bcryptjs'); // Ensure bcrypt is required
const User = require('../models/User');
const router = express.Router();

// Signup Page
router.get('/signup', (req, res) => {
    res.render('signup');
});

// Handle Signup
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        res.send('User already exists or error occurred');
    }
});

// Login Page
router.get('/login', (req, res) => {
    res.render('login');
});

// Handle Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                req.session.user = username; // Store username in session
                res.redirect('/home');
            } else {
                res.send('Invalid credentials');
            }
        } else {
            res.send('User not found');
        }
    } catch (err) {
        res.status(500).send('Error occurred during login');
    }
});

// Community Page
router.get('/community', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('community', { username: req.session.user });
});

// About Page
router.get('/about', (req, res) => {
    res.render('about');
});

router.get('/home', (req, res) => {
    const user = req.session.user; // Retrieve user from session
    res.render('home', { user }); // Pass user to EJS template
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
