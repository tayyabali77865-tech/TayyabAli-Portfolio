const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    // Connect without database first
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS
    });

    try {
        // Create database
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`Database "${process.env.DB_NAME}" created or already exists.`);

        // Switch to the database
        await connection.query(`USE ${process.env.DB_NAME}`);

        // Create Users Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NULL,
                avatar TEXT NULL,
                address TEXT NULL,
                googleId VARCHAR(255) NULL,
                facebookId VARCHAR(255) NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created or already exists.');

        // Create Orders Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                orderId VARCHAR(50) NOT NULL UNIQUE,
                userId INT NULL,
                service VARCHAR(255) NOT NULL,
                features JSON NULL,
                totalPrice DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                estimatedDelivery VARCHAR(100) DEFAULT '7-10 Days',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('Orders table created or already exists.');

        console.log('Database initialization complete!');
    } catch (err) {
        console.error('Error during database initialization:', err.message);
    } finally {
        await connection.end();
    }
}

initDB();
