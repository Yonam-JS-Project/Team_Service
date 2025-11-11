const linkModel = require('../models/linkModel');
const responseFormatter = require('../utils/responseFormatter');

// 링크 조회
exports.getLinks = async (req, res) => {
    const { shareCode } = req.params;
    try {
        const links = await linkModel.getLinks(shareCode);
        responseFormatter.success(res, links, '링크 조회 성공');
    } catch (err) {
        console.error('Get Links Error:', err);
        responseFormatter.error(res, '서버 오류', 500);
    }
};

// 링크 추가
exports.addLink = async (req, res) => {
    const { shareCode } = req.params;
    try {
        const newLink = await linkModel.addLink(shareCode, req.body);
        responseFormatter.success(res, newLink, '링크 추가 성공', 201);
    } catch (err) {
        console.error('Add Link Error:', err);
        responseFormatter.error(res, '서버 오류', 500);
    }
};

// 링크 삭제
exports.deleteLink = async (req, res) => {
    const { linkId } = req.params;
    try {
        const deletedLink = await linkModel.deleteLink(linkId);
        if (!deletedLink) {
            return responseFormatter.error(res, '링크를 찾을 수 없습니다.', 404);
        }
        responseFormatter.success(res, deletedLink, '링크 삭제 성공');
    } catch (err) {
        console.error('Delete Link Error:', err);
        responseFormatter.error(res, '서버 오류', 500);
    }
};
