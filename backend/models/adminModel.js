const db = require('../config/db');

class Admin {
  static async findByUsername(username) {
    const [rows] = await db.execute(`
      SELECT a.*, d.name as department_name 
      FROM admin_users a
      LEFT JOIN departments d ON a.department_id = d.id
      WHERE a.username = ?
    `, [username]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM admin_users WHERE id = ?', [id]);
    return rows[0];
  }

  static async getAllDepartments() {
    const [rows] = await db.execute('SELECT * FROM departments');
    return rows;
  }
}

module.exports = Admin;
