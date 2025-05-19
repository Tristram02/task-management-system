const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../utils/db');
const fs = require('fs');

let jwtSecret;
if (process.env.JWT_SECRET_FILE) {
    try {
        jwtSecret = fs.readFileSync(process.env.JWT_SECRET_FILE, 'utf8').trim();
    } catch (err) {
        console.error('Failed to read JWT secret file:', err);
        jwtSecret = null;
    }
} else {
    jwtSecret = process.env.JWT_SECRET;
}

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const result = await db.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
            [email, hashedPassword]
        );

        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0 || !await bcrypt.compare(password, result.rows[0].password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!jwtSecret) {
            return res.status(500).json({ error: 'JWT secret not configured' });
        }

        const user = result.rows[0];
        const token = jwt.sign(
            { sub: user.id, email: user.email },
            jwtSecret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        res.json({
            status: 'success',
            token,
            user: { id: user.id, email: user.email }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;