const express = require('express');
const router = express.Router();
const apiControllers = require('./../controllers/api.controllers');

router.get('/', apiControllers.getLexemes);
router.get('/clear-data', apiControllers.clearData);

module.exports = router;