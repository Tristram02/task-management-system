import React, { useState, useEffect } from 'react';

const priorities = [1, 2, 3];
const statuses = ['pending', 'on progress', 'done'];

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return '';
    }
};


export const EditTaskForm = ({ initialTaskData, onSubmitTask, onClose }) => {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState(priorities[0]);
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState(statuses[0]);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialTaskData) {
            setTitle(initialTaskData.title || '');
            setPriority(initialTaskData.priority || priorities[0]);
            setDueDate(formatDateForInput(initialTaskData.due_date));
            setStatus(initialTaskData.status || statuses[0]);
            setDescription(initialTaskData.description || '');
        }
    }, [initialTaskData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Title is required.');
            return;
        }

        const updatedTaskData = {
            title: title.trim(),
            priority,
            due_date: dueDate || null,
            status,
            description: description.trim(),
        };

        try {
            await onSubmitTask(updatedTaskData);
        } catch (apiError) {
            console.error("Failed to update task:", apiError);
            setError(apiError.message || 'Failed to update task. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Edit Task</h2>
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

            <button type="submit">Update Task</button>
        </form>
    );
};