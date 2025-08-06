const { pool } = require('../config/database');

class LabRegister {
  // Create a new lab register entry
  static async create(labRegisterData) {
    try {
      const {
        registerType,
        labType,
        day,
        name,
        facultyInCharge,
        item,
        totalWeight,
        purpose,
        inTime,
        outTime
      } = labRegisterData;

      const [result] = await pool.execute(
        `INSERT INTO lab_registers (
          registerType, labType, day, name, facultyInCharge,
          item, totalWeight, purpose, inTime, outTime
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          registerType, labType, day, name, facultyInCharge,
          item, totalWeight, purpose, inTime, outTime
        ]
      );

      return { id: result.insertId, ...labRegisterData };
    } catch (error) {
      throw error;
    }
  }

  // Find lab register entry by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM lab_registers WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all lab register entries
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM lab_registers ORDER BY date DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get lab register entries by register type
  static async findByRegisterType(registerType) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM lab_registers WHERE registerType = ? ORDER BY date DESC',
        [registerType]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get lab register entries by lab type
  static async findByLabType(labType) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM lab_registers WHERE labType = ? ORDER BY date DESC',
        [labType]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get lab register entries by date range
  static async findByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM lab_registers WHERE date BETWEEN ? AND ? ORDER BY date DESC',
        [startDate, endDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get lab register entries by faculty in charge
  static async findByFacultyInCharge(facultyInCharge) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM lab_registers WHERE facultyInCharge = ? ORDER BY date DESC',
        [facultyInCharge]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update lab register entry
  static async updateById(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);

      const [result] = await pool.execute(
        `UPDATE lab_registers SET ${fields} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete lab register entry
  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM lab_registers WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get lab register entries with pagination
  static async findWithPagination(page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      const [rows] = await pool.execute(
        'SELECT * FROM lab_registers ORDER BY date DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      const [total] = await pool.execute(
        'SELECT COUNT(*) as total FROM lab_registers'
      );

      return {
        entries: rows,
        pagination: {
          page,
          limit,
          total: total[0].total,
          totalPages: Math.ceil(total[0].total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get statistics by register type
  static async getStatisticsByType() {
    try {
      const [rows] = await pool.execute(
        'SELECT registerType, COUNT(*) as count FROM lab_registers GROUP BY registerType'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get statistics by lab type
  static async getStatisticsByLabType() {
    try {
      const [rows] = await pool.execute(
        'SELECT labType, COUNT(*) as count FROM lab_registers GROUP BY labType'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get recent entries (last N days)
  static async getRecent(days = 7) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM lab_registers WHERE date >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY date DESC',
        [days]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LabRegister; 