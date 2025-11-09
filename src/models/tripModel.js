const pool = require('../../config/db');

const tripModel = {
    // 여행 생성
    create: async (tripData) => {
        const { tripName, startDate, endDate, share_code, dailySchedules } = tripData;

        const tripQuery = `
            INSERT INTO trips (trip_name, start_date, end_date, share_code)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const tripResult = await pool.query(tripQuery, [tripName, startDate, endDate, share_code]);
        const tripId = tripResult.rows[0].trip_id;

        for (let i = 0; i < dailySchedules.length; i++) {
            const day = dailySchedules[i];
            const dsQuery = `
                INSERT INTO daily_schedules (trip_id, schedule_date, day_number)
                VALUES ($1, $2, $3) RETURNING schedule_id
            `;
            const dsResult = await pool.query(dsQuery, [tripId, day.schedule_date, i + 1]);
            const scheduleId = dsResult.rows[0].schedule_id;

            for (let j = 0; j < day.places.length; j++) {
                const place = day.places[j];
                const placeQuery = `
                    INSERT INTO places (schedule_id, place_name, address, latitude, longitude, visit_time, order_index, is_completed, memo)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `;
                await pool.query(placeQuery, [
                    scheduleId, 
                    place.place_name, 
                    place.address || null,
                    place.latitude || null,
                    place.longitude || null,
                    place.visit_time || null,
                    j + 1,
                    place.is_completed || false,
                    place.memo
                ]);
            }
        }

        return tripResult.rows[0];
    },

    // 여행 조회 (공유코드)
    findByShareCode: async (shareCode) => {
        const query = `
            SELECT 
                t.*,
                json_agg(
                    json_build_object(
                        'schedule_id', ds.schedule_id,
                        'day_number', ds.day_number,
                        'schedule_date', ds.schedule_date,
                        'places', (
                            SELECT json_agg(
                                json_build_object(
                                    'place_id', p.place_id,
                                    'place_name', p.place_name,
                                    'address', p.address,
                                    'latitude', p.latitude,
                                    'longitude', p.longitude,
                                    'visit_time', p.visit_time,
                                    'order_index', p.order_index,
                                    'is_completed', p.is_completed,
                                    'memo', p.memo
                                ) ORDER BY p.order_index
                            )
                            FROM places p
                            WHERE p.schedule_id = ds.schedule_id
                        )
                    ) ORDER BY ds.day_number
                ) as daily_schedules
            FROM trips t
            LEFT JOIN daily_schedules ds ON t.trip_id = ds.trip_id
            WHERE t.share_code = $1
            GROUP BY t.trip_id
        `;
        const result = await pool.query(query, [shareCode]);
        return result.rows[0];
    },

    // 여행 전체 수정 (PUT)
    update: async (shareCode, updates) => {
        const { tripName, startDate, endDate, dailySchedules } = updates;

        const tripQuery = `
            UPDATE trips
            SET trip_name = COALESCE($1, trip_name),
                start_date = COALESCE($2, start_date),
                end_date = COALESCE($3, end_date)
            WHERE share_code = $4
            RETURNING *
        `;
        const tripResult = await pool.query(tripQuery, [tripName, startDate, endDate, shareCode]);
        const tripId = tripResult.rows[0].trip_id;

        await pool.query('DELETE FROM places WHERE schedule_id IN (SELECT schedule_id FROM daily_schedules WHERE trip_id = $1)', [tripId]);
        await pool.query('DELETE FROM daily_schedules WHERE trip_id = $1', [tripId]);

        for (let i = 0; i < dailySchedules.length; i++) {
            const day = dailySchedules[i];
            const dsResult = await pool.query(
                `INSERT INTO daily_schedules (trip_id, schedule_date, day_number)
                VALUES ($1, $2, $3) RETURNING schedule_id`,
                [tripId, day.schedule_date, i + 1]
            );
            const scheduleId = dsResult.rows[0].schedule_id;

            for (let j = 0; j < day.places.length; j++) {
                const place = day.places[j];
                await pool.query(
                    `INSERT INTO places (schedule_id, place_name, address, latitude, longitude, visit_time, order_index, is_completed, memo)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        scheduleId, 
                        place.place_name, 
                        place.address || null,
                        place.latitude || null,
                        place.longitude || null,
                        place.visit_time || null,
                        j + 1,
                        place.is_completed || false,
                        place.memo
                    ]
                );
            }
        }

        return tripResult.rows[0];
    },

    // 여행 삭제
    delete: async (shareCode) => {
        const query = 'DELETE FROM trips WHERE share_code = $1 RETURNING *';
        const result = await pool.query(query, [shareCode]);
        return result.rows[0];
    },

    // 여행 상세 정보
    getDetailedInfo: async (shareCode) => {
        const query = `
            SELECT 
                t.*,
                COUNT(DISTINCT ds.schedule_id) as total_days,
                COUNT(DISTINCT p.place_id) as total_places,
                COUNT(DISTINCT CASE WHEN p.is_completed = true THEN p.place_id END) as completed_items
            FROM trips t
            LEFT JOIN daily_schedules ds ON t.trip_id = ds.trip_id
            LEFT JOIN places p ON ds.schedule_id = p.schedule_id
            WHERE t.share_code = $1
            GROUP BY t.trip_id
        `;
        const result = await pool.query(query, [shareCode]);
        return result.rows[0];
    }
};

module.exports = tripModel;