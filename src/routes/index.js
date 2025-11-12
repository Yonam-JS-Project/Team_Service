const express = require('express');
const router = express.Router();

const applyShareCodeValidation = require('../middlewares/shareCodeValidator');
const tripRoutes = require('./tripRoutes');
const checklistRoutes = require('./checklistRoutes');
const albumRoutes = require('./albumRoutes');

// Apply the centralized shareCode validation middleware to the router instance
applyShareCodeValidation(router);

// Mount the routers for each feature
router.use('/trips', tripRoutes);
router.use('/checklist', checklistRoutes);
router.use('/album', albumRoutes);

module.exports = router;