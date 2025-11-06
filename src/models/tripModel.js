const pool = require('../../config/db');

const tripModel = {
    create: async (tripData) => {
        const { tripName, destination, startDate, endDate, creatorName, dailySchedules } = tripData;

        const tripQuery = `
            INSERT INTO trips (trip_name, destination, start_date, end_date, share_code, creator_name)
            VALUES ($1, $2, $3, $4, generate_share_code(), $5)
            RETURNING *
        `;
        const tripResult = await pool.query(tripQuery, [tripName, destination, startDate, endDate, creatorName]);
        const tripId = tripResult.rows[0].trip_id;

        for (let i = 0; i < dailySchedules.length; i++) {
            const day = dailySchedules[i];
            const dsQuery = `
                INSERT INTO daily_schedules (trip_id, schedule_date, day_number, notes)
                VALUES ($1, $2, $3, $4) RETURNING schedule_id
            `;
            const dsResult = await pool.query(dsQuery, [tripId, day.schedule_date, i + 1, day.notes]);
            const scheduleId = dsResult.rows[0].schedule_id;

            for (let j = 0; j < day.places.length; j++) {
                const place = day.places[j];
                const placeQuery = `
                    INSERT INTO places (schedule_id, place_name, visit_time, duration_minutes, order_index)
                    VALUES ($1, $2, $3, $4, $5)
                `;
                await pool.query(placeQuery, [scheduleId, place.place_name, place.visit_time, place.duration_minutes, j + 1]);
            }
        }

        return tripResult.rows[0];
    },

    findByShareCode: async (shareCode) => {
        const query = `
            SELECT 
                t.*,
                json_agg(
                    json_build_object(
                        'day_number', ds.day_number,
                        'schedule_date', ds.schedule_date,
                        'notes', ds.notes,
                        'places', (
                            SELECT json_agg(
                                json_build_object(
                                    'place_name', p.place_name,
                                    'address', p.address,
                                    'latitude', p.latitude,
                                    'longitude', p.longitude,
                                    'visit_time', p.visit_time,
                                    'duration_minutes', p.duration_minutes,
                                    'order_index', p.order_index
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

    update: async (shareCode, updates) => {
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
    delete: async (shareCode) => {
        const query = 'DELETE FROM trips WHERE share_code = $1 RETURNING *';
        const result = await pool.query(query, [shareCode]);
        return result.rows[0];
    },

    getDetailedInfo: async (shareCode) => {
        const query = `
            SELECT 
                t.*,
                COUNT(DISTINCT ds.schedule_id) as total_days,
                COUNT(DISTINCT p.place_id) as total_places,
                COUNT(DISTINCT c.checklist_id) as total_checklist_items,
                COUNT(DISTINCT CASE WHEN c.is_completed = true THEN c.checklist_id END) as completed_items
            FROM trips t
            LEFT JOIN daily_schedules ds ON t.trip_id = ds.trip_id
            LEFT JOIN places p ON ds.schedule_id = p.schedule_id
            LEFT JOIN checklists c ON t.trip_id = c.trip_id
            WHERE t.share_code = $1
            GROUP BY t.trip_id
        `;
        const result = await pool.query(query, [shareCode]);
        return result.rows[0];
    }
};

module.exports = tripModel;