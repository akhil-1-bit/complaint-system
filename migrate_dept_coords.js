const db = require('./backend/config/db');

async function migrate() {
  try {
    console.log("Checking for department coordinate columns...");
    
    const [columns] = await db.execute("SHOW COLUMNS FROM departments");
    const hasLat = columns.some(c => c.Field === 'latitude');
    
    if (!hasLat) {
      console.log("Adding latitude and longitude columns to departments table...");
      await db.execute("ALTER TABLE departments ADD COLUMN latitude DECIMAL(10, 8), ADD COLUMN longitude DECIMAL(11, 8)");
    }

    console.log("Seeding departments with sample coordinates (Matching by Name)...");
    const seedData = [
      { name: 'Police', lat: 17.4065, lon: 78.4772, addr: 'Central Police Station' },
      { name: 'Medical', lat: 17.4126, lon: 78.4682, addr: 'City General Hospital' },
      { name: 'Fire', lat: 17.4200, lon: 78.4500, addr: 'Main Fire Station' },
      { name: 'Municipal', lat: 17.4300, lon: 78.4411, addr: 'Municipal Corporation Office' }
    ];

    for (const data of seedData) {
      await db.execute(
        "UPDATE departments SET latitude = ?, longitude = ?, location = ? WHERE name = ?",
        [data.lat, data.lon, data.addr, data.name]
      );
    }

    console.log("Migration and seeding complete! Coordinates applied to all departments.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
