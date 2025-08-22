const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(userData) {
    try {
      const { username, password, role, email, fullName, rollNo, category, year, department, } = userData;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await pool.execute(
        'INSERT INTO users (username, password, role, email, fullName, rollNo, category, year, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, role.toLowerCase(), email.toLowerCase(), fullName, rollNo, category, year, department]
      );
      
      return { id: result.insertId, ...userData };
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email.toLowerCase()]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by roll number
  static async findByRollNo(rollNo) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE rollNo = ?',
        [rollNo]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all users
  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async updateById(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);
      
      const [result] = await pool.execute(
        `UPDATE users SET ${fields} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update last login
  static async updateLastLogin(id) {
    try {
      const [result] = await pool.execute(
        'UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get users by role
  static async findByRole(role) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE role = ? ORDER BY created_at DESC',
        [role.toLowerCase()]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Search users
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username LIKE ? OR fullName LIKE ? OR email LIKE ? OR rollNo LIKE ? ORDER BY created_at DESC',
        [searchTerm, searchTerm, searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User; 