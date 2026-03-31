require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');
const contactRoutes = require('./routes/contact');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/contact', contactRoutes);

// Test MySQL Connection
const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL Database');
        connection.release();
    } catch (err) {
        console.error('MySQL connection error:', err.message);
        console.log('TIP: Ensure XAMPP MySQL is started and the database "portfolio_db" exists.');
    }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
