const { pool } = require('../config/database');

class IssuedItem {
  // Create a new issued item
  static async create(issuedItemData) {
    try {
      const {
        itemType,
        itemId,
        issuedToId,
        issuedByUserId,
        issuedByName,
        issuedByRole,
        issuedByRollNo,
        facultyInCharge,
        quantity,
        totalWeightIssued,
        purpose,
        notes,
        pendingRequestId
      } = issuedItemData;

      const [result] = await pool.execute(
        `INSERT INTO issued_items (
          itemType, itemId, issuedToId, issuedByUserId, issuedByName, 
          issuedByRole, issuedByRollNo, facultyInCharge, quantity, 
          totalWeightIssued, purpose, notes, pendingRequestId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemType, itemId, issuedToId, issuedByUserId, issuedByName,
          issuedByRole, issuedByRollNo, facultyInCharge, quantity,
          totalWeightIssued, purpose, notes, pendingRequestId
        ]
      );

      return { id: result.insertId, ...issuedItemData };
    } catch (error) {
      throw error;
    }
  }

  // Find issued item by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM issued_items WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all issued items
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM issued_items ORDER BY issueDate DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get issued items by user
  static async findByIssuedTo(issuedToId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM issued_items WHERE issuedToId = ? ORDER BY issueDate DESC',
        [issuedToId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get issued items by item type
  static async findByItemType(itemType) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM issued_items WHERE itemType = ? ORDER BY issueDate DESC',
        [itemType]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get issued items by status
  static async findByStatus(status) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM issued_items WHERE status = ? ORDER BY issueDate DESC',
        [status]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get active issued items (not returned)
  static async getActiveIssues() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM issued_items WHERE status = "issued" ORDER BY issueDate DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update issued item
  static async updateById(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);

      const [result] = await pool.execute(
        `UPDATE issued_items SET ${fields} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Return an item
  static async returnItem(id, returnDate) {
    try {
      const [result] = await pool.execute(
        'UPDATE issued_items SET status = "returned", returnDate = ? WHERE id = ?',
        [returnDate, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete issued item
  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM issued_items WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get issued items with user details
  static async findWithUserDetails() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          ii.*,
          u1.fullName as issuedToName,
          u1.role as issuedToRole,
          u1.rollNo as issuedToRollNo,
          u2.fullName as issuedByName,
          u2.role as issuedByRole,
          u2.rollNo as issuedByRollNo
        FROM issued_items ii
        LEFT JOIN users u1 ON ii.issuedToId = u1.id
        LEFT JOIN users u2 ON ii.issuedByUserId = u2.id
        ORDER BY ii.issueDate DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get issued items by date range
  static async findByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM issued_items WHERE issueDate BETWEEN ? AND ? ORDER BY issueDate DESC',
        [startDate, endDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get statistics
  static async getStatistics() {
    try {
      const [totalIssued] = await pool.execute(
        'SELECT COUNT(*) as total FROM issued_items'
      );
      const [activeIssued] = await pool.execute(
        'SELECT COUNT(*) as active FROM issued_items WHERE status = "issued"'
      );
      const [returned] = await pool.execute(
        'SELECT COUNT(*) as returned FROM issued_items WHERE status = "returned"'
      );

      return {
        total: totalIssued[0].total,
        active: activeIssued[0].active,
        returned: returned[0].returned
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = IssuedItem; 