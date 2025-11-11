const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');

// DELETE /api/links/:linkId
router.delete('/:linkId', linkController.deleteLink);

module.exports = router;
