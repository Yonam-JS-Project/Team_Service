const pool = require('../../config/db');

const albumModel = {
    // 모든 앨범 이미지와 관련 여행 정보 조회
    getAllImagesWithTripInfo: async () => {
        const query = `
            SELECT
                p.photo_id,
                p.photo_url,
                p.created_at,
                t.trip_name,
                t.share_code
            FROM
                photos p
            JOIN
                trips t ON p.trip_id = t.trip_id
            ORDER BY
                p.created_at DESC;
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    // 앨범에 이미지 추가 (shareCode로 trip_id 찾아서 추가)
    addAlbumImage: async (shareCode, photoUrl) => {
        const query = `
            INSERT INTO photos (trip_id, photo_url)
            SELECT t.trip_id, $2
            FROM trips t
            WHERE t.share_code = $1
            RETURNING *;
        `;
        const result = await pool.query(query, [shareCode, photoUrl]);
        return result.rows[0] || null;
    },

    // 특정 여행의 앨범 이미지 조회
    getAlbumImagesByTrip: async (shareCode) => {
        const query = `
            SELECT
                p.photo_id,
                p.photo_url,
                p.created_at,
                t.trip_name,
                t.share_code
            FROM
                trips t
            JOIN
                photos p ON t.trip_id = p.trip_id
            WHERE
                t.share_code = $1
            ORDER BY
                p.created_at DESC;
        `;
        const result = await pool.query(query, [shareCode]);
        return result.rows;
    },

    // 앨범에서 이미지 삭제
    deleteAlbumImage: async (photoId) => {
        const query = `
            DELETE FROM photos
            WHERE photo_id = $1
            RETURNING *;
        `;
        const result = await pool.query(query, [photoId]);
        return result.rows[0];
    }
};

module.exports = albumModel;
