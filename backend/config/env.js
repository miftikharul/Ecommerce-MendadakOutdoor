const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET belum didefinisikan di environment variables.");
}

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:3000', 'https://mendadak-outdoor.com'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Ditolak oleh kebijakan CORS.'));
    }
  },
  credentials: true
};

const binderbyteConfig = {
  baseUrl: 'https://api.binderbyte.com',
  apiKey: process.env.BINDERBYTE_API_KEY,
  originId: process.env.BINDERBYTE_ORIGIN_ID
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan. Silakan coba lagi beberapa saat lagi.' }
});

const prisma = new PrismaClient();

module.exports = {
  PORT,
  JWT_SECRET,
  allowedOrigins,
  corsOptions,
  binderbyteConfig,
  apiLimiter,
  prisma
};