const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
const upload = require('../../middlewares/uploadMiddleware');

// 모든 앨범 이미지 조회
router.get('/', albumController.getAllPublicImages);

// 앨범 이미지 조회
router.get('/:shareCode', albumController.getAlbumImages);

// 앨범 이미지 업로드 (여러 파일)
router.post('/:shareCode', upload.array('albumImages', 10), albumController.uploadAlbumImages);

// 앨범 이미지 삭제
router.delete('/:imageId', albumController.deleteAlbumImage);

module.exports = router;