const express = require('express');
const router = express.Router();
const tripController = require('./../controllers/tripController');

router.post('/', tripController.createTrip);
router.get('/:shareCode', tripController.getTripByShareCode);
router.put('/:shareCode', tripController.updateTrip);
router.delete('/:shareCode', tripController.deleteTrip);

module.exports = router;
