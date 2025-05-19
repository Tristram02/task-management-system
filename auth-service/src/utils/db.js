const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const AUTH_DB_PASSWORD = fs.readFileSync(process.env.AUTH_DB_PASSWORD_FILE, 'utf8').trim();

const pool = new Pool({
    host: process.env.AUTH_DB_HOST,
    user: process.env.AUTH_DB_USER,
    database: process.env.AUTH_DB_NAME,
    password: AUTH_DB_PASSWORD,
    port: 5432
});

const initializeDatabase = async () => {
    try {
        await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Auth database initialized');
    } catch (err) {
        console.error('Database initialization error:', err);
    }
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    initializeDatabase
};