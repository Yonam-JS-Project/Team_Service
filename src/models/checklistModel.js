const pool = require('../../config/db');

const checklistModel = {
    // 체크리스트 아이템 완료 토글 (실제로는 '장소'의 is_completed를 토글)
    toggleComplete: async (placeId) => {
        const query = `
            UPDATE places
            SET is_completed = NOT is_completed
            WHERE place_id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [placeId]);
        return result.rows[0];
    }
};

module.exports = checklistModel;

