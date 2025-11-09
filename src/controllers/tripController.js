const tripModel = require('./../models/tripModel');
const responseFormatter = require('../utils/responseFormatter');
const crypto = require('crypto');

// 여행 생성
exports.createTrip = async (req, res) => {
    try {
        // 1. share_code 생성
        const shareCode = crypto.randomBytes(4).toString('hex');

        // 2. 요청 데이터에 share_code 추가
        const tripData = {
            ...req.body,
            share_code: shareCode,
        };

        // 3. 데이터베이스에 여행 정보 저장
        const trip = await tripModel.create(tripData);

        // 4. 성공 응답
        responseFormatter.success(res, trip, '여행 생성 성공', 201);
    } catch (err) {
        console.error('Create Trip Error:', err);

        // 5. 오류 처리 (예: 중복된 share_code)
        if (err.code === '23505' && err.constraint === 'trips_share_code_key') {
            // share_code가 중복될 경우, 새로운 코드로 다시 시도할 수 있습니다.
            // 이 예제에서는 간단하게 클라이언트에게 재시도를 요청합니다.
            return responseFormatter.error(res, '코드 생성 실패, 다시 시도해주세요.', 500);
        }

        responseFormatter.error(res, '서버 오류', 500);
    }
};

// 여행 조회
exports.getTripByShareCode = async (req, res) => {
    const { shareCode } = req.params;
    try {
        const trip = await tripModel.findByShareCode(shareCode);
        if (!trip) {
            return responseFormatter.error(res, '여행을 찾을 수 없습니다.', 404);
        }
        responseFormatter.success(res, trip, '여행 조회 성공');
    } catch (err) {
        console.error('Get Trip Error:', err);
        responseFormatter.error(res, '서버 오류', 500);
    }
};

// 수정용 데이터 조회
exports.getTripForEdit = async (req, res) => {
    const { shareCode } = req.params;
    try {
        const editData = await tripModel.findForEdit(shareCode);
        if (!editData) {
            return responseFormatter.error(res, '여행을 찾을 수 없습니다.', 404);
        }
        responseFormatter.success(res, editData, '수정용 데이터 조회 성공');
    } catch (err) {
        console.error('Get Trip For Edit Error:', err);
        responseFormatter.error(res, '서버 오류', 500);
    }
};

// 여행 수정
exports.updateTrip = async (req, res) => {
    const { shareCode } = req.params;
    try {
        const updatedTrip = await tripModel.update(shareCode, req.body);
        if (!updatedTrip) {
            return responseFormatter.error(res, '여행을 찾을 수 없습니다.', 404);
        }
        responseFormatter.success(res, updatedTrip, '여행 수정 성공');
    } catch (err) {
        console.error('Update Trip Error:', err);
        responseFormatter.error(res, '서버 오류', 500);
    }
};

// 여행 삭제
exports.deleteTrip = async (req, res) => {
    const { shareCode } = req.params;
    try {
        const deletedTrip = await tripModel.delete(shareCode);
        if (!deletedTrip) {
            return responseFormatter.error(res, '여행을 찾을 수 없습니다.', 404);
        }
        responseFormatter.success(res, deletedTrip, '여행 삭제 성공');
    } catch (err) {
        console.error('Delete Trip Error:', err);
        responseFormatter.error(res, '서버 오류', 500);
    }
};

// 여행 상세 정보 조회
exports.getDetailedInfo = async (req, res) => {
    const { shareCode } = req.params;
    try {
        const detail = await tripModel.getDetailedInfo(shareCode);
        if (!detail) {
            return responseFormatter.error(res, '상세 정보를 찾을 수 없습니다.', 404);
        }
        responseFormatter.success(res, detail, '여행 상세 조회 성공');
    } catch (err) {
        console.error('Get Detailed Info Error:', err);
        responseFormatter.error(res, '서버 오류', 500);
    }
};
