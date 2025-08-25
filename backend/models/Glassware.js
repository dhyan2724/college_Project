const { pool } = require('../config/database');

class Glassware {
  // Create a new glassware
  static async create(glasswareData) {
    try {
      const { name, type, storagePlace, totalQuantity, availableQuantity, company } = glasswareData;
      
      // Generate glasswareId if not provided
      const glasswareId = glasswareData.glasswareId || `GLASS-${Date.now()}`;
      
      // Set availableQuantity to totalQuantity if not specified
      const finalAvailableQuantity = availableQuantity !== undefined ? availableQuantity : totalQuantity;
      
      // Convert undefined values to null for MySQL
      const safeName = name !== undefined ? name : null;
      const safeType = type !== undefined ? type : null;
      const safeStoragePlace = storagePlace !== undefined ? storagePlace : null;
      const safeTotalQuantity = totalQuantity !== undefined ? totalQuantity : null;
      const safeCompany = company !== undefined ? company : null;
      
      const [result] = await pool.execute(
        'INSERT INTO glasswares (name, type, storagePlace, totalQuantity, availableQuantity, company, glasswareId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [safeName, safeType, safeStoragePlace, safeTotalQuantity, finalAvailableQuantity, safeCompany, glasswareId]
      );
      
      return { id: result.insertId, ...glasswareData, glasswareId, availableQuantity: finalAvailableQuantity };
    } catch (error) {
      throw error;
    }
  }

  // Find glassware by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM glasswares WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // removed catalog number lookups

  // Find glassware by glasswareId
  static async findByGlasswareId(glasswareId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM glasswares WHERE glasswareId = ?',
        [glasswareId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all glasswares
  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM glasswares ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update glassware
  static async updateById(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);
      
      const [result] = await pool.execute(
        `UPDATE glasswares SET ${fields} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete glassware
  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM glasswares WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Search glasswares
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM glasswares WHERE name LIKE ? OR glasswareId LIKE ? OR company LIKE ? ORDER BY created_at DESC',
        [searchTerm, searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get glasswares by type
  static async findByType(type) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM glasswares WHERE type = ? ORDER BY created_at DESC',
        [type]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get glasswares by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM glasswares WHERE storagePlace = ? ORDER BY created_at DESC',
        [storagePlace]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update available quantity
  static async updateAvailableQuantity(id, newAvailableQuantity) {
    try {
      const [result] = await pool.execute(
        'UPDATE glasswares SET availableQuantity = ? WHERE id = ?',
        [newAvailableQuantity, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock glasswares (available quantity less than 10% of total quantity)
  static async getLowStock() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM glasswares WHERE availableQuantity < (totalQuantity * 0.1) ORDER BY availableQuantity ASC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Glassware; 