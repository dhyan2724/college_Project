const { pool } = require('../config/database');

class ActivityLog {
  // Create a new activity log
  static async create(activityLogData) {
    try {
      const { action, itemType, itemId, itemName, user, details } = activityLogData;

      const [result] = await pool.execute(
        'INSERT INTO activity_logs (action, itemType, itemId, itemName, user, details) VALUES (?, ?, ?, ?, ?, ?)',
        [action, itemType, itemId, itemName, user, details]
      );

      return { id: result.insertId, ...activityLogData };
    } catch (error) {
      throw error;
    }
  }

  // Find activity log by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM activity_logs WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all activity logs
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM activity_logs ORDER BY timestamp DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get activity logs by action
  static async findByAction(action) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM activity_logs WHERE action = ? ORDER BY timestamp DESC',
        [action]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get activity logs by item type
  static async findByItemType(itemType) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM activity_logs WHERE itemType = ? ORDER BY timestamp DESC',
        [itemType]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get activity logs by user
  static async findByUser(user) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM activity_logs WHERE user = ? ORDER BY timestamp DESC',
        [user]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get activity logs by date range
  static async findByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM activity_logs WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
        [startDate, endDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get recent activity logs (last N days)
  static async getRecent(days = 7) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM activity_logs WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY timestamp DESC',
        [days]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Delete activity log
  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM activity_logs WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Clear old activity logs (older than N days)
  static async clearOld(days = 30) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM activity_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [days]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Get activity statistics
  static async getStatistics() {
    try {
      const [total] = await pool.execute(
        'SELECT COUNT(*) as total FROM activity_logs'
      );
      const [today] = await pool.execute(
        'SELECT COUNT(*) as today FROM activity_logs WHERE DATE(timestamp) = CURDATE()'
      );
      const [thisWeek] = await pool.execute(
        'SELECT COUNT(*) as thisWeek FROM activity_logs WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
      );
      const [thisMonth] = await pool.execute(
        'SELECT COUNT(*) as thisMonth FROM activity_logs WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
      );

      return {
        total: total[0].total,
        today: today[0].today,
        thisWeek: thisWeek[0].thisWeek,
        thisMonth: thisMonth[0].thisMonth
      };
    } catch (error) {
      throw error;
    }
  }

  // Get activity logs with pagination
  static async findWithPagination(page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      const [rows] = await pool.execute(
        'SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      const [total] = await pool.execute(
        'SELECT COUNT(*) as total FROM activity_logs'
      );

      return {
        logs: rows,
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
}

module.exports = ActivityLog; 