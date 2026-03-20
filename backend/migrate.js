const db = require('./config/db');

async function migrate() {
  const queries = [
    'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS nearest_station_name VARCHAR(255)',
    'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS nearest_station_lat DECIMAL(10,7)',
    'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS nearest_station_lon DECIMAL(10,7)',
    'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS image_path VARCHAR(500)',
    'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS category VARCHAR(100)',
    "ALTER TABLE complaints ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending'"
  ];

  for (const q of queries) {
    try {
      await db.execute(q);
      console.log('OK:', q.substring(0, 70));
    } catch (e) {
      console.log('SKIP (already exists or error):', e.message.substring(0, 90));
    }
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrate();
