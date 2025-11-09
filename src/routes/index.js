const express = require('express');
const router = express.Router();

const tripRoutes = require('./tripRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const checklistRoutes = require('./checklistRoutes');
const memoRoutes = require('./memoRoutes');
const linkRoutes = require('./linkRoutes');

// Mount the routers for each feature
router.use('/trips', tripRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/checklist', checklistRoutes);
router.use('/memos', memoRoutes);
router.use('/links', linkRoutes);

module.exports = router;