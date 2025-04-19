const { Pool } = require('pg');
const fs = require('fs');

const DB_PASSWORD = fs.readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};