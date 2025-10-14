const { getDatabase, saveDatabase } = require('../config/database');

class User {
  static create(userData) {
    const db = getDatabase();

    try {
      db.run(
        `INSERT INTO users (email, role, status, createdAt, emailHash, signature)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userData.email,
          userData.role,
          userData.status,
          userData.createdAt,
          userData.emailHash,
          userData.signature
        ]
      );

      saveDatabase();

      // Get the last inserted id
      const result = db.exec('SELECT last_insert_rowid() as id');
      const id = result[0].values[0][0];

      return this.findById(id);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  static findAll() {
    const db = getDatabase();
    const result = db.exec('SELECT * FROM users ORDER BY createdAt DESC');

    if (result.length === 0) {
      return [];
    }

    return this.parseResults(result[0]);
  }

  static findById(id) {
    const db = getDatabase();
    const result = db.exec('SELECT * FROM users WHERE id = ?', [id]);

    if (result.length === 0) {
      return null;
    }

    const users = this.parseResults(result[0]);
    return users[0] || null;
  }

  static update(id, userData) {
    const db = getDatabase();

    try {
      db.run(
        `UPDATE users
         SET email = ?, role = ?, status = ?, emailHash = ?, signature = ?
         WHERE id = ?`,
        [
          userData.email,
          userData.role,
          userData.status,
          userData.emailHash,
          userData.signature,
          id
        ]
      );

      saveDatabase();
      return this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  static delete(id) {
    const db = getDatabase();

    try {
      db.run('DELETE FROM users WHERE id = ?', [id]);
      saveDatabase();
      return true;
    } catch (error) {
      return false;
    }
  }

  static getUsersPerDay(days = 7) {
    const db = getDatabase();
    const result = db.exec(
      `SELECT DATE(createdAt) as date, COUNT(*) as count
       FROM users
       WHERE createdAt >= datetime('now', '-' || ? || ' days')
       GROUP BY DATE(createdAt)
       ORDER BY date ASC`,
      [days]
    );

    if (result.length === 0) {
      return [];
    }

    return this.parseResults(result[0]);
  }

  static parseResults(result) {
    if (!result || !result.columns || !result.values) {
      return [];
    }

    const columns = result.columns;
    const rows = result.values;

    return rows.map(row => {
      const obj = {};
      columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj;
    });
  }
}

module.exports = User;
