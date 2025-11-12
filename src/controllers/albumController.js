const albumModel = require('../models/albumModel');
const responseFormatter = require('../utils/responseFormatter');

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
        if (!req.files || req.files.length === 0) {
            return responseFormatter.error(res, '이미지 파일이 없습니다.', 400);
        }

        // 여러 파일 정보를 동시에 처리
        const imagePromises = req.files.map(file => {
            const imageUrl = file.path.replace(/\\/g, '/').replace('uploads', '/');

            return albumModel.addAlbumImage(shareCode, imageUrl);
        });

        const newImages = await Promise.all(imagePromises);
        responseFormatter.success(res, newImages, '앨범 이미지 추가 성공', 201);

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