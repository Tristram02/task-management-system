const jwt = require('jsonwebtoken');
const fs = require('fs');

let jwtSecret;
if (process.env.JWT_SECRET_FILE) {
    jwtSecret = fs.readFileSync(process.env.JWT_SECRET_FILE, 'utf8').trim();
} else {
    jwtSecret = process.env.JWT_SECRET;
}

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = { id: decoded.sub };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}