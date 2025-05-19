const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
const taskRoutes = require('./routes/tasks');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000',
    credentials: true
}));

app.use(
    '/api/auth',
    createProxyMiddleware({
        target: process.env.AUTH_SERVICE_URL || 'http://auth-service:5001',
        changeOrigin: true,
        pathRewrite: { '^/api/auth': '/auth' },
        logLevel: 'debug',
        timeout: 30000,
        proxyTimeout: 30000,
        ws: true,
        onError: (err, req, res) => {
            console.error('Proxy Error:', err);
            res.status(500).json({ error: 'Proxy error occurred' });
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log('Proxying request:', req.method, req.path);
        }
    })
);

app.use(express.json());

app.use(authMiddleware);
app.use('/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
});