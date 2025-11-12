const tripModel = require('../models/tripModel');
const responseFormatter = require('../utils/responseFormatter');

function applyShareCodeValidation(router) {
    router.param('shareCode', async (req, res, next, shareCode) => {
        try {
            const trip = await tripModel.findByShareCode(shareCode);
            if (!trip) {
                return responseFormatter.error(res, '유효하지 않은 공유 코드입니다.', 404);
            }
            // The trip exists, proceed to the actual route handler
            next();
        } catch (err) {
            console.error('Param Share Code Error:', err);
            return responseFormatter.error(res, '서버 오류', 500);
        }
    });
}

module.exports = applyShareCodeValidation;
