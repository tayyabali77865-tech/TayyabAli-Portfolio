const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const pool = require('../config/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. Local Register
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 12);

        await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 2. Local Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { email: user.email, userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token,
            userId: user.id,
            user: { name: user.name, email: user.email, avatar: user.avatar }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 3. Google OAuth
router.post('/google', async (req, res) => {
    const { idToken } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, email, picture, sub } = ticket.getPayload();

        let [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        let user;

        if (users.length === 0) {
            const [result] = await pool.query(
                'INSERT INTO users (name, email, avatar, googleId) VALUES (?, ?, ?, ?)',
                [name, email, picture, sub]
            );
            user = { id: result.insertId, name, email, avatar: picture };
        } else {
            user = users[0];
        }

        const token = jwt.sign(
            { email: user.email, userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, userId: user.id, user });
    } catch (err) {
        console.error('Google Auth Error Detail:', err);
        res.status(500).json({ message: 'Google auth failed' });
    }
});

// 4. Facebook Login
router.post('/facebook', async (req, res) => {
    const { accessToken, userID } = req.body;
    try {
        const url = `https://graph.facebook.com/me?fields=name,email,picture&access_token=${accessToken}`;
        const response = await axios.get(url);
        const { name, email, picture } = response.data;

        let [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        let user;

        if (users.length === 0) {
            const [result] = await pool.query(
                'INSERT INTO users (name, email, avatar, facebookId) VALUES (?, ?, ?, ?)',
                [name, email, picture.data.url, userID]
            );
            user = { id: result.insertId, name, email, avatar: picture.data.url };
        } else {
            user = users[0];
        }

        const token = jwt.sign(
            { email: user.email, userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, userId: user.id, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Facebook auth failed' });
    }
});

module.exports = router;
