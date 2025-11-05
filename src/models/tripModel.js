const pool = require('../../config/db');

const tripModel = {
    create: async (tripData) => {
        const { tripName, destination, startDate, endDate, creatorName } = tripData;
        const query = `
            INSERT INTO trips (trip_name, destination, start_date, end_date, share_code, creator_name)
            VALUES ($1, $2, $3, $4, generate_share_code(), $5)
            RETURNING *
        `;
        const result = await pool.query(query, [tripName, destination, startDate, endDate, creatorName]);
        return result.rows[0];
    },

    findByShareCode: async (shareCode) => {
        const query = 'SELECT * FROM trips WHERE share_code = $1';
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