-- 여행 일정 테이블 (메인 엔티티)
CREATE TABLE trips (
    trip_id SERIAL PRIMARY KEY,
    trip_name VARCHAR(255) NOT NULL,
    destination VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    share_code VARCHAR(50) UNIQUE NOT NULL,
    creator_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 일자별 일정 테이블
CREATE TABLE daily_schedules (
    schedule_id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(trip_id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    day_number INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_id, schedule_date)
);

-- 장소 테이블 (POI, 지도 API 정보 포함)
CREATE TABLE places (
    place_id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES daily_schedules(schedule_id) ON DELETE CASCADE,
    place_name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    category VARCHAR(50),
    visit_time TIME,
    duration_minutes INTEGER,
    notes TEXT,
    order_index INTEGER NOT NULL,
    -- 외부 API 정보 (Kakao, Naver 등)
    external_api_id VARCHAR(255),
    external_api_type VARCHAR(50),
    poi_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 체크리스트 테이블
CREATE TABLE checklists (
    checklist_id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(trip_id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    category VARCHAR(50),
    priority INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 지도 메모 테이블 (주소 마커 표시용)
CREATE TABLE map_memos (
    memo_id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(trip_id) ON DELETE CASCADE,
    place_name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    memo_content TEXT,
    marker_color VARCHAR(20) DEFAULT 'red',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 앱 링크 테이블 (외부 앱북 링크, 사진 업로드 등)
CREATE TABLE app_links (
    link_id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(trip_id) ON DELETE CASCADE,
    link_type VARCHAR(50) NOT NULL,
    link_url TEXT NOT NULL,
    link_title VARCHAR(255),
    link_description TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_trips_share_code ON trips(share_code);
CREATE INDEX idx_daily_schedules_trip_id ON daily_schedules(trip_id);
CREATE INDEX idx_daily_schedules_date ON daily_schedules(schedule_date);
CREATE INDEX idx_places_schedule_id ON places(schedule_id);
CREATE INDEX idx_places_coordinates ON places(latitude, longitude);
CREATE INDEX idx_checklists_trip_id ON checklists(trip_id);
CREATE INDEX idx_map_memos_trip_id ON map_memos(trip_id);
CREATE INDEX idx_app_links_trip_id ON app_links(trip_id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_schedules_updated_at BEFORE UPDATE ON daily_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON checklists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_map_memos_updated_at BEFORE UPDATE ON map_memos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
