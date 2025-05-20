const { Pool } = require('pg');
const fs = require('fs');
const nodemailer = require('nodemailer');

let taskDbPassword = process.env.DB_PASSWORD;
if (!taskDbPassword && process.env.DB_PASSWORD_FILE) {
    taskDbPassword = fs.readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim();
}
let userDbPassword = process.env.AUTH_DB_PASSWORD;
if (!userDbPassword && process.env.AUTH_DB_PASSWORD_FILE) {
    userDbPassword = fs.readFileSync(process.env.AUTH_DB_PASSWORD_FILE, 'utf8').trim();
}

const taskPool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: taskDbPassword,
    database: process.env.DB_NAME,
    port: 5432
});

const userPool = new Pool({
    host: process.env.AUTH_DB_HOST,
    user: process.env.AUTH_DB_USER,
    password: userDbPassword,
    database: process.env.AUTH_DB_NAME,
    port: 5432
});
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'notification-service',
    port: process.env.SMTP_PORT || 1025,
    secure: false
});

async function sendReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const dueDateStr = `${yyyy}-${mm}-${dd}`;

    const { rows: tasks } = await taskPool.query(
        `SELECT id, title, due_date, user_id FROM public.tasks WHERE due_date = $1`,
        [dueDateStr]
    );

    for (const task of tasks) {
        const { rows: users } = await userPool.query(
            `SELECT email FROM users WHERE id = $1`,
            [task.user_id]
        );
        if (users.length === 0) continue;
        const email = users[0].email;

        await transporter.sendMail({
            from: '"Task Manager" <noreply@taskmanager.local>',
            to: email,
            subject: `Reminder: Task "${task.title}" is due tomorrow`,
            text: `Hi! Your task "${task.title}" is due on ${task.due_date}. Don't forget!`
        });
        console.log(`Sent reminder to ${email} for task "${task.title}"`);
    }
}

async function main() {
    while (true) {
        try {
            await sendReminders();
        } catch (err) {
            console.error('Error sending reminders:', err);
        }
        await new Promise(res => setTimeout(res, 2 * 60 * 1000));
    }
}

main();