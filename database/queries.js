const pool = require('../config/db');

// 여행 일정 관련
const tripQueries = {
    // 새 여행 일정 생성 (공유 코드 자동 생성)
    createTrip: async (tripName, destination, startDate, endDate, creatorName) => {
        const query = `
            INSERT INTO trips (trip_name, destination, start_date, end_date, share_code, creator_name)
            VALUES ($1, $2, $3, $4, generate_share_code(), $5)
            RETURNING *
        `;
        const result = await pool.query(query, [tripName, destination, startDate, endDate, creatorName]);
        return result.rows[0];
    },
    
    // 공유 코드로 여행 찾기
    findByShareCode: async (shareCode) => {
        const query = 'SELECT * FROM trips WHERE share_code = $1';
        const result = await pool.query(query, [shareCode]);
        return result.rows[0];
    },
    
    // 여행 정보 업데이트
    updateTrip: async (shareCode, updates) => {
        const { tripName, destination, startDate, endDate } = updates;
        const query = `
            UPDATE trips 
            SET trip_name = COALESCE($1, trip_name),
                destination = COALESCE($2, destination),
                start_date = COALESCE($3, start_date),
                end_date = COALESCE($4, end_date)
            WHERE share_code = $5
            RETURNING *
        `;
        const result = await pool.query(query, [tripName, destination, startDate, endDate, shareCode]);
        return result.rows[0];
    },
    
    // 여행 삭제
    deleteTrip: async (shareCode) => {
        const query = 'DELETE FROM trips WHERE share_code = $1 RETURNING *';
        const result = await pool.query(query, [shareCode]);
        return result.rows[0];
    }
};

// 일자별 일정 관련
const scheduleQueries = {
    // 일자별 일정 생성
    createDailySchedule: async (shareCode, scheduleDate, dayNumber, notes) => {
        const query = `
            INSERT INTO daily_schedules (trip_id, schedule_date, day_number, notes)
            SELECT trip_id, $2, $3, $4
            FROM trips WHERE share_code = $1
            RETURNING *
        `;
        const result = await pool.query(query, [shareCode, scheduleDate, dayNumber, notes]);
        return result.rows[0];
    },
    
    // 여행의 모든 일정 조회 (장소 포함)
    getTripSchedules: async (shareCode) => {
        const query = `
            SELECT 
                ds.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'place_id', p.place_id,
                            'place_name', p.place_name,
                            'address', p.address,
                            'latitude', p.latitude,
                            'longitude', p.longitude,
                            'category', p.category,
                            'visit_time', p.visit_time,
                            'duration_minutes', p.duration_minutes,
                            'notes', p.notes,
                            'order_index', p.order_index,
                            'poi_data', p.poi_data
                        ) ORDER BY p.order_index
                    ) FILTER (WHERE p.place_id IS NOT NULL),
                    '[]'
                ) as places
            FROM trips t
            JOIN daily_schedules ds ON t.trip_id = ds.trip_id
            LEFT JOIN places p ON ds.schedule_id = p.schedule_id
            WHERE t.share_code = $1
            GROUP BY ds.schedule_id
            ORDER BY ds.schedule_date
        `;
        const result = await pool.query(query, [shareCode]);
        return result.rows;
    },
    
    // 특정 일정 업데이트
    updateSchedule: async (scheduleId, notes) => {
        const query = `
            UPDATE daily_schedules 
            SET notes = $1
            WHERE schedule_id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [notes, scheduleId]);
        return result.rows[0];
    },
    
    // 일정 삭제
    deleteSchedule: async (scheduleId) => {
        const query = 'DELETE FROM daily_schedules WHERE schedule_id = $1 RETURNING *';
        const result = await pool.query(query, [scheduleId]);
        return result.rows[0];
    }
};

// 장소 관련
const placeQueries = {
    // 장소 추가
    addPlace: async (scheduleId, placeData) => {
        const {
            placeName, address, latitude, longitude, category,
            visitTime, durationMinutes, notes, orderIndex,
            externalApiId, externalApiType, poiData
        } = placeData;
        
        const query = `
            INSERT INTO places (
                schedule_id, place_name, address, latitude, longitude,
                category, visit_time, duration_minutes, notes, order_index,
                external_api_id, external_api_type, poi_data
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;
        const result = await pool.query(query, [
            scheduleId, placeName, address, latitude, longitude,
            category, visitTime, durationMinutes, notes, orderIndex,
            externalApiId, externalApiType, poiData
        ]);
        return result.rows[0];
    },
    
    // 장소 업데이트
    updatePlace: async (placeId, placeData) => {
        const {
            placeName, address, latitude, longitude,
            visitTime, durationMinutes, notes, orderIndex
        } = placeData;
        
        const query = `
            UPDATE places
            SET place_name = COALESCE($1, place_name),
                address = COALESCE($2, address),
                latitude = COALESCE($3, latitude),
                longitude = COALESCE($4, longitude),
                visit_time = COALESCE($5, visit_time),
                duration_minutes = COALESCE($6, duration_minutes),
                notes = COALESCE($7, notes),
                order_index = COALESCE($8, order_index)
            WHERE place_id = $9
            RETURNING *
        `;
        const result = await pool.query(query, [
            placeName, address, latitude, longitude,
            visitTime, durationMinutes, notes, orderIndex, placeId
        ]);
        return result.rows[0];
    },
    
    // 장소 삭제
    deletePlace: async (placeId) => {
        const query = 'DELETE FROM places WHERE place_id = $1 RETURNING *';
        const result = await pool.query(query, [placeId]);
        return result.rows[0];
    }
};

// 체크리스트 관련
const checklistQueries = {
    // 체크리스트 아이템 추가
    addItem: async (shareCode, itemName, category, priority) => {
        const query = `
            INSERT INTO checklists (trip_id, item_name, category, priority)
            SELECT trip_id, $2, $3, $4
            FROM trips WHERE share_code = $1
            RETURNING *
        `;
        const result = await pool.query(query, [shareCode, itemName, category, priority]);
        return result.rows[0];
    },
    
    // 체크리스트 조회
    getItems: async (shareCode) => {
        const query = `
            SELECT c.*
            FROM trips t
            JOIN checklists c ON t.trip_id = c.trip_id
            WHERE t.share_code = $1
            ORDER BY c.priority DESC, c.created_at
        `;
        const result = await pool.query(query, [shareCode]);
        return result.rows;
    },
    
    // 체크리스트 완료 토글
    toggleComplete: async (checklistId) => {
        const query = `
            UPDATE checklists
            SET is_completed = NOT is_completed,
                completed_at = CASE 
                    WHEN is_completed = false THEN NOW()
                    ELSE NULL
                END
            WHERE checklist_id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [checklistId]);
        return result.rows[0];
    },
    
    // 체크리스트 삭제
    deleteItem: async (checklistId) => {
        const query = 'DELETE FROM checklists WHERE checklist_id = $1 RETURNING *';
        const result = await pool.query(query, [checklistId]);
        return result.rows[0];
    }
};

// 지도 메모 관련
const memoQueries = {
    // 메모 추가
    addMemo: async (shareCode, memoData) => {
        const { placeName, address, latitude, longitude, memoContent, markerColor } = memoData;
        const query = `
            INSERT INTO map_memos (trip_id, place_name, address, latitude, longitude, memo_content, marker_color)
            SELECT trip_id, $2, $3, $4, $5, $6, $7
            FROM trips WHERE share_code = $1
            RETURNING *
        `;
        const result = await pool.query(query, [
            shareCode, placeName, address, latitude, longitude, memoContent, markerColor
        ]);
        return result.rows[0];
    },
    
    // 메모 조회
    getMemos: async (shareCode) => {
        const query = `
            SELECT m.*
            FROM trips t
            JOIN map_memos m ON t.trip_id = m.trip_id
            WHERE t.share_code = $1
            ORDER BY m.created_at DESC
        `;
        const result = await pool.query(query, [shareCode]);
        return result.rows;
    },
    
    // 메모 삭제
    deleteMemo: async (memoId) => {
        const query = 'DELETE FROM map_memos WHERE memo_id = $1 RETURNING *';
        const result = await pool.query(query, [memoId]);
        return result.rows[0];
    }
};

// 앱 링크 관련
const linkQueries = {
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

module.exports = {
    pool,
    tripQueries,
    scheduleQueries,
    placeQueries,
    checklistQueries,
    memoQueries,
    linkQueries
};