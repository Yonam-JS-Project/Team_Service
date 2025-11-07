-- 기존 테이블 삭제 (dev)
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS daily_schedules CASCADE;
DROP TABLE IF EXISTS trips CASCADE;

-- 여행 일정
CREATE TABLE trips (
    trip_id SERIAL PRIMARY KEY,
    trip_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    share_code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 일자별 일정
CREATE TABLE daily_schedules (
    schedule_id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(trip_id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    day_number INTEGER NOT NULL,
    UNIQUE(trip_id, schedule_date)
);

-- 장소
CREATE TABLE places (
    place_id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES daily_schedules(schedule_id) ON DELETE CASCADE,
    place_name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    visit_time TIME,
    order_index INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    memo TEXT NOT NULL
);

-- 사진
CREATE TABLE photos (
    photo_id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(trip_id) ON DELETE CASCADE,
    place_id INTEGER REFERENCES places(place_id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_daily_schedules_trip_id ON daily_schedules(trip_id);
CREATE INDEX idx_places_schedule_id ON places(schedule_id);
CREATE INDEX idx_photos_trip_id ON photos(trip_id);
CREATE INDEX idx_photos_place_id ON photos(place_id);