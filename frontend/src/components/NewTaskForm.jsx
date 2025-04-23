import React, { useState } from 'react';

const priorities = [1, 2, 3];
const statuses = ['pending', 'on progress', 'done'];

export const NewTaskForm = ({ onSubmitTask, onClose }) => {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState(priorities[0]);
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState(statuses[0]);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Title is required.');
            return;
        }

        const newTaskData = {
            title: title.trim(),
            priority,
            due_date: dueDate || null,
            status,
            description: description.trim(),
        };

        try {
            await onSubmitTask(newTaskData);
        } catch (apiError) {
            console.error("Failed to create task:", apiError);
            setError(apiError.message || 'Failed to create task. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create New Task</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <label>
                Title: *
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </label>

            <label>
                Priority:
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    {priorities.map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </label>

            <label>
                Due Date:
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
            </label>

            <label>
                Status:
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                     {statuses.map((s) => (
                        <option key={s} value={s}>
                           {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Description:
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </label>

            <button type="submit">Create Task</button>
        </form>
    );
};