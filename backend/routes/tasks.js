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
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows, rowCount } = await db.query('SELECT * FROM public.tasks WHERE id = $1', [id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(`Error fetching task ${id}:`, error);
        if (error.code === '22P02') {
             return res.status(400).json({ error: 'Invalid task ID format' });
        }
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});

router.post('/', async (req, res) => {
    const { title, description, status } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    if (!status) {
        return res.status(400).json({ error: 'Status is required' }); // Or set a default below
    }

    const allowedStatuses = ['pending', 'on progress', 'done'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    const finalStatus = status || 'pending';

    try {
        const query = `
            INSERT INTO public.tasks (title, description, status)
            VALUES ($1, $2, $3)
            RETURNING *; -- Return the created row
        `;
        const values = [title, description, finalStatus];

        const { rows } = await db.query(query, values);

        res.status(201).json(rows[0]); // 201 Created
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (title === undefined && description === undefined && status === undefined) {
        return res.status(400).json({ error: 'No update fields provided (title, description, status)' });
    }

    if (status !== undefined) {
        const allowedStatuses = ['pending', 'on progress', 'done'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
        }
    }

    try {
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramIndex++}`);
            values.push(title);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(description);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            values.push(status);
        }

        values.push(id);

        const query = `
            UPDATE public.tasks
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *; -- Return the updated row
        `;

        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Task not found or no changes made' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(`Error updating task ${id}:`, error);
         if (error.code === '22P02') { 
             return res.status(400).json({ error: 'Invalid task ID format' });
        }
        res.status(500).json({ error: 'Failed to update task' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await db.query('DELETE FROM public.tasks WHERE id = $1 RETURNING id', [id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({ message: `Task ${id} deleted successfully` });

    } catch (error) {
        console.error(`Error deleting task ${id}:`, error);
         if (error.code === '22P02') {
             return res.status(400).json({ error: 'Invalid task ID format' });
        }
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

module.exports = router;