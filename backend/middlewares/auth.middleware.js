const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid.' });
    if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Akses khusus Admin.' });
    req.user = user;
    next();
  });
};

module.exports = { verifyAdmin };