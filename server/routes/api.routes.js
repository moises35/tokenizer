const express = require('express');
const router = express.Router();
const apiControllers = require('./../controllers/api.controllers');

router.get('/', apiControllers.getDictionary);
router.post('/', apiControllers.setDictionary);
router.get('/clear-data', apiControllers.clearData);

module.exports = router;