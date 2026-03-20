const db = require('../config/db');

class User {
  static async createOrUpdate(phone, email, lat, lon) {
    const [result] = await db.execute(
      `INSERT INTO users (phone, email, latitude, longitude) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE email = ?, latitude = ?, longitude = ?`,
      [phone, email, lat, lon, email, lat, lon]
    );

    if (result.insertId) return result.insertId;
    
    // If it was an update, find the ID
    const [rows] = await db.execute('SELECT id FROM users WHERE phone = ?', [phone]);
    return rows[0].id;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = User;
