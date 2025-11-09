const checklistModel = require('../models/checklistModel');
const responseFormatter = require('../utils/responseFormatter');

// 체크리스트 아이템 완료 토글 (장소의 is_completed 토글)
exports.toggleChecklistItem = async (req, res) => {
    const { itemId } = req.params; // 여기서 itemId는 place_id 입니다.
    try {
        const updatedItem = await checklistModel.toggleComplete(itemId);
        if (!updatedItem) {
            return responseFormatter.error(res, '항목을 찾을 수 없습니다.', 404);
        }
        responseFormatter.success(res, updatedItem, '체크리스트 상태 변경 성공');
    } catch (err) {
        console.error('Toggle Checklist Item Error:', err);
        responseFormatter.error(res, '서버 오류', 500);
    }
};

