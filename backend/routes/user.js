const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../config/db');

// Get Profile
router.get('/profile', auth, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT name, email, avatar, address, createdAt FROM users WHERE id = ?',
            [req.userData.userId]
        );
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Update Profile (Address)
router.put('/profile', auth, async (req, res) => {
    try {
        const { address } = req.body;
        await pool.execute(
            'UPDATE users SET address = ? WHERE id = ?',
            [address, req.userData.userId]
        );

        const [users] = await pool.execute(
            'SELECT name, email, avatar, address, createdAt FROM users WHERE id = ?',
            [req.userData.userId]
        );
        res.status(200).json(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

module.exports = router;
