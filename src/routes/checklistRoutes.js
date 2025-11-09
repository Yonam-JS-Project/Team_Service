const express = require('express');
const router = express.Router();
const checklistController = require('../controllers/checklistController');

// PUT /api/checklist/:itemId
router.put('/:itemId', checklistController.toggleChecklistItem);

module.exports = router;
