const express = require('express');
const db = require('../utils/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM public.tasks');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching tasks: ', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
})

module.exports = router;