const pool = require('../../config/db');

const linkModel = {
    // 링크 추가
    addLink: async (shareCode, linkData) => {
        const { linkType, linkUrl, linkTitle, linkDescription, thumbnailUrl } = linkData;
        const query = `
            INSERT INTO app_links (trip_id, link_type, link_url, link_title, link_description, thumbnail_url)
            SELECT trip_id, $2, $3, $4, $5, $6
            FROM trips WHERE share_code = $1
            RETURNING *
        `;
        const result = await pool.query(query, [
            shareCode, linkType, linkUrl, linkTitle, linkDescription, thumbnailUrl
        ]);
        return result.rows[0];
    },
    
    // 링크 조회
    getLinks: async (shareCode) => {
        const query = `
            SELECT l.*
            FROM trips t
            JOIN app_links l ON t.trip_id = l.trip_id
            WHERE t.share_code = $1
            ORDER BY l.created_at DESC
        `;
        const result = await pool.query(query, [shareCode]);
        return result.rows;
    },
    
    // 링크 삭제
    deleteLink: async (linkId) => {
        const query = 'DELETE FROM app_links WHERE link_id = $1 RETURNING *';
        const result = await pool.query(query, [linkId]);
        return result.rows[0];
    }
};

module.exports = linkModel;
