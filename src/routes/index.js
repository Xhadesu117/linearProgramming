const express = require('express');
const router = express.Router();

// Import Controller
const pl = require('../controllers/index');

router.get('/', pl.render);

router.post('/solve', pl.post);

module.exports = router;