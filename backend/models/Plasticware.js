const { pool } = require('../config/database');

class Plasticware {
  // Create a new plasticware
  static async create(plasticwareData) {
    try {
      const { name, type, storagePlace, totalQuantity, availableQuantity, company } = plasticwareData;
      
      // Generate plasticwareId if not provided
      const plasticwareId = plasticwareData.plasticwareId || `PLASTIC-${Date.now()}`;
      
      // Set availableQuantity to totalQuantity if not specified
      const finalAvailableQuantity = availableQuantity !== undefined ? availableQuantity : totalQuantity;
      
      // Convert undefined values to null for MySQL
      const safeName = name !== undefined ? name : null;
      const safeType = type !== undefined ? type : null;
      const safeStoragePlace = storagePlace !== undefined ? storagePlace : null;
      const safeTotalQuantity = totalQuantity !== undefined ? totalQuantity : null;
      const safeCompany = company !== undefined ? company : null;
      
      const [result] = await pool.execute(
        'INSERT INTO plasticwares (name, type, storagePlace, totalQuantity, availableQuantity, company, plasticwareId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [safeName, safeType, safeStoragePlace, safeTotalQuantity, finalAvailableQuantity, safeCompany, plasticwareId]
      );
      
      return { id: result.insertId, ...plasticwareData, plasticwareId, availableQuantity: finalAvailableQuantity };
    } catch (error) {
      throw error;
    }
  }

  // Find plasticware by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM plasticwares WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // removed catalog number lookups

  // Find plasticware by plasticwareId
  static async findByPlasticwareId(plasticwareId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM plasticwares WHERE plasticwareId = ?',
        [plasticwareId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all plasticwares
  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM plasticwares ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update plasticware
  static async updateById(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);
      
      const [result] = await pool.execute(
        `UPDATE plasticwares SET ${fields} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete plasticware
  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM plasticwares WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Search plasticwares
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM plasticwares WHERE name LIKE ? OR plasticwareId LIKE ? OR company LIKE ? ORDER BY created_at DESC',
        [searchTerm, searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get plasticwares by type
  static async findByType(type) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM plasticwares WHERE type = ? ORDER BY created_at DESC',
        [type]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get plasticwares by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM plasticwares WHERE storagePlace = ? ORDER BY created_at DESC',
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
        'UPDATE plasticwares SET availableQuantity = ? WHERE id = ?',
        [newAvailableQuantity, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock plasticwares (available quantity less than 10% of total quantity)
  static async getLowStock() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM plasticwares WHERE availableQuantity < (totalQuantity * 0.1) ORDER BY availableQuantity ASC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Plasticware; 