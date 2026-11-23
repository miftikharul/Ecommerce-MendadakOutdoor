const notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
};

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
};

module.exports = { notFoundHandler, errorHandler };