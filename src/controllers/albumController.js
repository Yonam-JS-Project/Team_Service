const albumModel = require('../models/albumModel');
const tripModel = require('../models/tripModel');
const responseFormatter = require('../utils/responseFormatter');


const serverUrl = process.env.SERVER_HOST 
  ? `http://${process.env.SERVER_HOST}` 
  : 'http://localhost:3000';

// 모든 앨범 이미지 조회
exports.getAllPublicImages = async (req, res) => {
    try {
        const images = await albumModel.getAllImagesWithTripInfo();
        responseFormatter.success(res, images, '모든 앨범 이미지 조회 성공');
    } catch (err) {
        console.error('Get All Public Images Error:', err);
        responseFormatter.error(res, '서버 오류', 500);
    }
};

// 앨범 이미지 조회
exports.getAlbumImages = async (req, res) => {
    const { shareCode } = req.params;
    try {
        const images = await albumModel.getAlbumImagesByTrip(shareCode);
        responseFormatter.success(res, images, '앨범 이미지 조회 성공');
    } catch (err) {
        console.error('Get Album Images Error:', err);
        responseFormatter.error(res, '서버 오류', 500);
    }
};

// 앨범 이미지 업로드 (여러 파일 처리)
exports.uploadAlbumImages = async (req, res) => {
    const { shareCode } = req.params;

    try {
        // shareCodeValidator가 이미 처리했어야 하지만, 혹시 모를 경우를 대비한 이중 확인
        const trip = await tripModel.findByShareCode(shareCode);
        if (!trip) {
            return responseFormatter.error(res, '유효하지 않은 공유 코드입니다.', 404);
        }

        if (!req.files || req.files.length === 0) {
            return responseFormatter.error(res, '이미지 파일이 없습니다.', 400);
        }

        // 여러 파일 정보를 동시에 처리
        const imagePromises = req.files.map(file => {
            const imageUrl = `${serverUrl}${file.path.replace(/\\/g, '/').replace('uploads', '')}`;

            return albumModel.addAlbumImage(shareCode, imageUrl);
        });

        const newImages = await Promise.all(imagePromises);
        const successfulImages = newImages.filter(image => image !== null);

        if (successfulImages.length === 0) {
            // 이 경우는 trip이 유효하지만, 어떤 이유로 이미지 추가에 실패한 경우를 대비
            return responseFormatter.error(res, '이미지 추가에 실패했습니다.', 500);
        }

        responseFormatter.success(res, successfulImages, '앨범 이미지 추가 성공', 201);

    } catch (err) {
        console.error('Upload Album Image Error:', err);
        responseFormatter.error(res, '서버 오류', 500);
    }
};


// 앨범 이미지 삭제
exports.deleteAlbumImage = async (req, res) => {
    const { imageId } = req.params;
    try {
        const deletedImage = await albumModel.deleteAlbumImage(imageId);
        if (!deletedImage) {
            return responseFormatter.error(res, '이미지를 찾을 수 없습니다.', 404);
        }
        responseFormatter.success(res, deletedImage, '이미지 삭제 성공');
    } catch (err) {
        console.error('Delete Album Image Error:', err);
        responseFormatter.error(res, '서버 오류', 500);
    }
};