const { pool } = require('../config/database');

class Instrument {
  // Create a new instrument
  static async create(instrumentData) {
    try {
      const { name, type, storagePlace, totalQuantity, availableQuantity, company, catalogNumber } = instrumentData;
      
      // Generate instrumentId if not provided
      const instrumentId = instrumentData.instrumentId || `INST-${Date.now()}`;
      
      // Set availableQuantity to totalQuantity if not specified
      const finalAvailableQuantity = availableQuantity !== undefined ? availableQuantity : totalQuantity;
      
      // Convert undefined values to null for MySQL
      const safeName = name !== undefined ? name : null;
      const safeType = type !== undefined ? type : null;
      const safeStoragePlace = storagePlace !== undefined ? storagePlace : null;
      const safeTotalQuantity = totalQuantity !== undefined ? totalQuantity : null;
      const safeCompany = company !== undefined ? company : null;
      const safeCatalogNumber = catalogNumber !== undefined ? catalogNumber : null;
      
      const [result] = await pool.execute(
        'INSERT INTO instruments (name, type, storagePlace, totalQuantity, availableQuantity, company, catalogNumber, instrumentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [safeName, safeType, safeStoragePlace, safeTotalQuantity, finalAvailableQuantity, safeCompany, safeCatalogNumber, instrumentId]
      );
      
      return { id: result.insertId, ...instrumentData, instrumentId, availableQuantity: finalAvailableQuantity };
    } catch (error) {
      throw error;
    }
  }

  // Find instrument by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM instruments WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find instrument by catalog number
  static async findByCatalogNumber(catalogNumber) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM instruments WHERE catalogNumber = ?',
        [catalogNumber]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find instrument by instrumentId
  static async findByInstrumentId(instrumentId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM instruments WHERE instrumentId = ?',
        [instrumentId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all instruments
  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM instruments ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update instrument
  static async updateById(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);
      
      const [result] = await pool.execute(
        `UPDATE instruments SET ${fields} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete instrument
  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM instruments WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Search instruments
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM instruments WHERE name LIKE ? OR catalogNumber LIKE ? OR instrumentId LIKE ? OR company LIKE ? ORDER BY created_at DESC',
        [searchTerm, searchTerm, searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get instruments by type
  static async findByType(type) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM instruments WHERE type = ? ORDER BY created_at DESC',
        [type]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get instruments by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM instruments WHERE storagePlace = ? ORDER BY created_at DESC',
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
        'UPDATE instruments SET availableQuantity = ? WHERE id = ?',
        [newAvailableQuantity, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock instruments (available quantity less than 10% of total quantity)
  static async getLowStock() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM instruments WHERE availableQuantity < (totalQuantity * 0.1) ORDER BY availableQuantity ASC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Instrument; 