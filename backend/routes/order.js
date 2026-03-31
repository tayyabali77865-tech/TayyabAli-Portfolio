const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Create Order (Simulated)
router.post('/create', async (req, res) => {
    try {
        const { service, features, totalPrice, userId } = req.body;
        const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();

        await pool.execute(
            'INSERT INTO orders (orderId, userId, service, features, totalPrice) VALUES (?, ?, ?, ?, ?)',
            [orderId, userId, service, JSON.stringify(features), totalPrice]
        );

        const [orders] = await pool.execute('SELECT * FROM orders WHERE orderId = ?', [orderId]);
        res.status(201).json(orders[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating order' });
    }
});

// Track Order
router.get('/track/:id', async (req, res) => {
    try {
        const [orders] = await pool.execute('SELECT * FROM orders WHERE orderId = ?', [req.params.id]);
        if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

        const order = orders[0];
        // Parse features if it exists and is a string
        if (order.features && typeof order.features === 'string') {
            order.features = JSON.parse(order.features);
        }

        res.status(200).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error tracking order' });
    }
});

module.exports = router;
