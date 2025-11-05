const pool = require("../config/db")
const fs = require('fs');
const path = require('path');
require('dotenv').config();


async function initDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🔄 데이터베이스 연결 중...');
        
        const schemaPath = path.join(__dirname, 'schema.sql');
        console.log(__dirname)
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📄 schema.sql 파일을 읽었습니다.');
        
        await client.query('BEGIN');
        console.log('🚀 스키마 생성 시작...');
        
        await client.query(schemaSQL);
        
        await client.query('COMMIT');
        
        console.log('✅ 데이터베이스 초기화 완료!');
        console.log('📊 생성된 테이블:');
        console.log('   - trips (여행 일정)');
        console.log('   - daily_schedules (일자별 일정)');
        console.log('   - places (장소)');
        console.log('   - checklists (체크리스트)');
        console.log('   - map_memos (지도 메모)');
        console.log('   - app_links (앱 링크)');
        
    } catch (error) {
        // 롤백
        await client.query('ROLLBACK');
        console.error('❌ 데이터베이스 초기화 실패:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

if (require.main === module) {
    initDatabase()
        .then(() => {
            console.log('\n🎉 완료!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 실패:', error);
            process.exit(1);
        });
}

module.exports = { initDatabase };