const multer = require('multer');
const fs = require('fs');
const path = require('path');

// 파일 저장 경로 및 파일명 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // shareCode를 기반으로 폴더 경로를 동적으로 생성
        const shareCode = req.params.shareCode;
        const dir = path.join('uploads', 'img', shareCode);

        // 디렉토리가 존재하지 않으면 생성
        fs.mkdirSync(dir, { recursive: true });
        
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // 파일명 중복을 피하기 위해 타임스탬프와 원본 파일명을 조합
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 파일 필터 (이미지 파일만 허용)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('이미지 파일만 업로드할 수 있습니다.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 } // 10MB 파일 크기 제한
});

module.exports = upload;
