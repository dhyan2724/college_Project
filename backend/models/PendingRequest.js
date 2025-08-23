const { pool } = require('../config/database');

class PendingRequest {
  // Create a new pending request
  static async create(pendingRequestData) {
    try {
      const {
        facultyInChargeId,
        requestedByUserId,
        requestedByName,
        requestedByRole,
        requestedByRollNo,
        requestedByCollegeEmail,
        purpose,
        desiredIssueTime,
        desiredReturnTime,
        notes
      } = pendingRequestData;

      const [result] = await pool.execute(
        `INSERT INTO pending_requests (
          facultyInChargeId, requestedByUserId, requestedByName, requestedByRole,
          requestedByRollNo, requestedByCollegeEmail, purpose, desiredIssueTime,
          desiredReturnTime, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          facultyInChargeId, requestedByUserId, requestedByName, requestedByRole,
          requestedByRollNo, requestedByCollegeEmail, purpose, desiredIssueTime,
          desiredReturnTime, notes
        ]
      );

      return { id: result.insertId, ...pendingRequestData };
    } catch (error) {
      throw error;
    }
  }

  // Add items to a pending request
  static async addItems(requestId, items) {
    try {
      for (const item of items) {
        const { itemType, itemId } = item;
        // Convert undefined to null for SQL
        const quantity = item.quantity === undefined ? null : item.quantity;
        const totalWeightRequested = item.totalWeightRequested === undefined ? null : item.totalWeightRequested;
        await pool.execute(
          'INSERT INTO pending_request_items (pendingRequestId, itemType, itemId, quantity, totalWeightRequested) VALUES (?, ?, ?, ?, ?)',
          [requestId, itemType, itemId, quantity, totalWeightRequested]
        );
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Find pending request by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM pending_requests WHERE id = ?',
        [id]
      );
      
      if (rows[0]) {
        // Get items for this request
        const [items] = await pool.execute(
          'SELECT * FROM pending_request_items WHERE pendingRequestId = ?',
          [id]
        );
        rows[0].items = items;
      }
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all pending requests
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM pending_requests ORDER BY requestDate DESC'
      );
      
      // Get items for each request
      for (let request of rows) {
        const [items] = await pool.execute(
          'SELECT * FROM pending_request_items WHERE pendingRequestId = ?',
          [request.id]
        );
        request.items = items;
      }
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get pending requests by status
  static async findByStatus(status) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM pending_requests WHERE status = ? ORDER BY requestDate DESC',
        [status]
      );
      
      // Get items for each request
      for (let request of rows) {
        const [items] = await pool.execute(
          'SELECT * FROM pending_request_items WHERE pendingRequestId = ?',
          [request.id]
        );
        request.items = items;
      }
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get pending requests by faculty in charge
  static async findByFacultyInCharge(facultyInChargeId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM pending_requests WHERE facultyInChargeId = ? ORDER BY requestDate DESC',
        [facultyInChargeId]
      );
      
      // Get items for each request
      for (let request of rows) {
        const [items] = await pool.execute(
          'SELECT * FROM pending_request_items WHERE pendingRequestId = ?',
          [request.id]
        );
        request.items = items;
      }
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get pending requests by requested by user
  static async findByRequestedByUser(requestedByUserId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM pending_requests WHERE requestedByUserId = ? ORDER BY requestDate DESC',
        [requestedByUserId]
      );
      
      // Get items for each request
      for (let request of rows) {
        const [items] = await pool.execute(
          'SELECT * FROM pending_request_items WHERE pendingRequestId = ?',
          [request.id]
        );
        request.items = items;
      }
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update pending request
  static async updateById(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      // Replace undefined with null in values
      const values = Object.values(updateData).map(v => v === undefined ? null : v);
      values.push(id);
      const [result] = await pool.execute(
        `UPDATE pending_requests SET ${fields} WHERE id = ?`,
        values
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update status
  static async updateStatus(id, status) {
    try {
      const [result] = await pool.execute(
        'UPDATE pending_requests SET status = ? WHERE id = ?',
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete pending request
  static async deleteById(id) {
    try {
      // Delete items first (due to foreign key constraint)
      await pool.execute(
        'DELETE FROM pending_request_items WHERE pendingRequestId = ?',
        [id]
      );
      
      // Delete the request
      const [result] = await pool.execute(
        'DELETE FROM pending_requests WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get pending requests with user details
  static async findWithUserDetails() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          pr.*,
          u1.fullName as facultyInChargeName,
          u1.role as facultyInChargeRole,
          u2.fullName as requestedByName,
          u2.role as requestedByRole,
          u2.rollNo as requestedByRollNo
        FROM pending_requests pr
        LEFT JOIN users u1 ON pr.facultyInChargeId = u1.id
        LEFT JOIN users u2 ON pr.requestedByUserId = u2.id
        ORDER BY pr.requestDate DESC
      `);
      
      // Get items for each request
      for (let request of rows) {
        const [items] = await pool.execute(
          'SELECT * FROM pending_request_items WHERE pendingRequestId = ?',
          [request.id]
        );
        request.items = items;
      }
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get statistics
  static async getStatistics() {
    try {
      const [total] = await pool.execute(
        'SELECT COUNT(*) as total FROM pending_requests'
      );
      const [pending] = await pool.execute(
        'SELECT COUNT(*) as pending FROM pending_requests WHERE status = "pending"'
      );
      const [approved] = await pool.execute(
        'SELECT COUNT(*) as approved FROM pending_requests WHERE status = "approved"'
      );
      const [rejected] = await pool.execute(
        'SELECT COUNT(*) as rejected FROM pending_requests WHERE status = "rejected"'
      );

      return {
        total: total[0].total,
        pending: pending[0].pending,
        approved: approved[0].approved,
        rejected: rejected[0].rejected
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PendingRequest; 