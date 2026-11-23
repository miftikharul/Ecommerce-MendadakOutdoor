const normalizeWhatsApp = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  let cleaned = phone.replace(/[\s\-()]/g, '').trim();
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }
  if (cleaned.startsWith('08')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
};

module.exports = { normalizeWhatsApp };