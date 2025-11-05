const tripModel = require('./../models/tripModel');
const responseFormatter = require('./../utils/responseFormatter');

const tripController = {
    createTrip: async (req, res, next) => {
        try {
            const trip = await tripModel.create(req.body);
            res.status(201).json(responseFormatter.success(trip));
        } catch (err) {
            next(err);
        }
    },
    getTripByShareCode: async (req, res, next) => {
        try {
            const trip = await tripModel.findByShareCode(req.params.shareCode);
            if (!trip) return res.status(404).json(responseFormatter.error('Trip not found'));
            res.json(responseFormatter.success(trip));
        } catch (err) {
            next(err);
        }
    },
    updateTrip: async (req, res, next) => {
        try {
            const trip = await tripModel.update(req.params.shareCode, req.body);
            res.json(responseFormatter.success(trip));
        } catch (err) {
            next(err);
        }
    },
    deleteTrip: async (req, res, next) => {
        try {
            const trip = await tripModel.delete(req.params.shareCode);
            res.json(responseFormatter.success(trip));
        } catch (err) {
            next(err);
        }
    }
}

module.exports = tripController;
