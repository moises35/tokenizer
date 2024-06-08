const express = require('express');
const router = express.Router();
const apiControllers = require('./../controllers/api.controllers');

router.get('/', apiControllers.home);

module.exports = router;