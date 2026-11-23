const { binderbyteConfig } = require('../config/env');

const BB = binderbyteConfig.baseUrl;
const KEY = binderbyteConfig.apiKey;

const getLocations = async (req, res) => {
  try {
    const url = `${BB}/v1/locations?api_key=${KEY}&search=${encodeURIComponent(req.query.q || '')}`;
    const response = await fetch(url);
    const r = await response.json();
    res.json(r.data || []);
  } catch (e) {
    console.error('Locations error:', e);
    res.status(502).json({ message: 'Gagal mencari lokasi' });
  }
};

const checkOngkir = async (req, res) => {
  try {
    const { destinationId, weightGram, courier } = req.body;
    if (!destinationId || !weightGram || !courier) {
      return res.status(400).json({ message: 'Destinasi, berat, dan kurir wajib diisi.' });
    }

    const body = new URLSearchParams({
      api_key: KEY,
      origin: binderbyteConfig.originId,
      destination: destinationId,
      weight: String(weightGram / 1000),
      courier: courier
    });

    const response = await fetch(`${BB}/v1/cost`, {
      method: 'POST',
      body
    });
    const r = await response.json();

    if (r.code !== '200') {
      return res.status(400).json({ message: r.message || 'Gagal menghitung ongkir' });
    }

    const options = r.data.results.flatMap((k) =>
      k.costs.map((c) => ({
        courier: k.code.toUpperCase(),
        service: c.service,
        price: Number(c.price),
        estimated: c.estimated,
      }))
    );

    res.json(options);
  } catch (e) {
    console.error('Check ongkir error:', e);
    res.status(502).json({ message: 'Gagal menghitung ongkir' });
  }
};

const trackResi = async (req, res) => {
  try {
    const { courier, awb } = req.query;
    if (!courier || !awb) {
      return res.status(400).json({ status: 400, message: 'Kurir dan nomor resi (awb) wajib diisi.' });
    }

    const url = `${BB}/v1/track?api_key=${KEY}&courier=${courier}&awb=${encodeURIComponent(awb)}`;
    const response = await fetch(url);
    const r = await response.json();

    if (r.status !== 200) {
      return res.status(400).json({ status: r.status, message: r.message || 'Resi tidak ditemukan' });
    }

    res.json(r.data);
  } catch (e) {
    console.error('Tracking error:', e);
    res.status(502).json({ status: 502, message: 'Gagal melacak resi' });
  }
};

module.exports = {
  getLocations,
  checkOngkir,
  trackResi
};