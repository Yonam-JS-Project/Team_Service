const express = require('express');
const router = express.Router();

const tripRoutes = require('./tripRoutes');
const checklistRoutes = require('./checklistRoutes');
// const linkRoutes = require('./linkRoutes');

// Mount the routers for each feature
router.use('/trips', tripRoutes);
router.use('/checklist', checklistRoutes);
// router.use('/links', linkRoutes);

module.exports = router;