const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../config/env');
const { getLocations, checkOngkir, trackResi } = require('../controllers/shipping.controller');

router.get('/locations', apiLimiter, getLocations);
router.post('/check-ongkir', apiLimiter, checkOngkir);
router.get('/track-resi', trackResi);

module.exports = router;