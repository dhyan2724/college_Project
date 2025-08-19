const { pool } = require('../config/database');

class Chemical {
  // Create a new chemical
  static async create(chemicalData) {
    try {
      const { name, type, storagePlace, totalWeight, availableWeight, company, catalogNumber } = chemicalData;
      
      // Generate chemicalId if not provided
      const chemicalId = chemicalData.chemicalId || `CHEM-${Date.now()}`;
      
      // Set availableWeight to totalWeight if not specified
      const finalAvailableWeight = availableWeight !== undefined ? availableWeight : totalWeight;
      
      // Convert undefined values to null for MySQL
      const safeName = name !== undefined ? name : null;
      const safeType = type !== undefined ? type : null;
      const safeStoragePlace = storagePlace !== undefined ? storagePlace : null;
      const safeTotalWeight = totalWeight !== undefined ? totalWeight : null;
      const safeCompany = company !== undefined ? company : null;
      const safeCatalogNumber = catalogNumber !== undefined ? catalogNumber : null;
      
      const [result] = await pool.execute(
        'INSERT INTO chemicals (name, type, storagePlace, totalWeight, availableWeight, company, catalogNumber, chemicalId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [safeName, safeType, safeStoragePlace, safeTotalWeight, finalAvailableWeight, safeCompany, safeCatalogNumber, chemicalId]
      );
      
      return { id: result.insertId, ...chemicalData, chemicalId, availableWeight: finalAvailableWeight };
    } catch (error) {
      throw error;
    }
  }

  // Find chemical by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM chemicals WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find chemical by catalog number
  static async findByCatalogNumber(catalogNumber) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM chemicals WHERE catalogNumber = ?',
        [catalogNumber]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find chemical by chemicalId
  static async findByChemicalId(chemicalId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM chemicals WHERE chemicalId = ?',
        [chemicalId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all chemicals
  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM chemicals ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update chemical
  static async updateById(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);
      
      const [result] = await pool.execute(
        `UPDATE chemicals SET ${fields} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete chemical
  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM chemicals WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Search chemicals
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM chemicals WHERE name LIKE ? OR catalogNumber LIKE ? OR chemicalId LIKE ? OR company LIKE ? ORDER BY created_at DESC',
        [searchTerm, searchTerm, searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get chemicals by type
  static async findByType(type) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM chemicals WHERE type = ? ORDER BY created_at DESC',
        [type]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get chemicals by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM chemicals WHERE storagePlace = ? ORDER BY created_at DESC',
        [storagePlace]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update available weight
  static async updateAvailableWeight(id, newAvailableWeight) {
    try {
      const [result] = await pool.execute(
        'UPDATE chemicals SET availableWeight = ? WHERE id = ?',
        [newAvailableWeight, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock chemicals (available weight less than 10% of total weight)
  static async getLowStock() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM chemicals WHERE availableWeight < (totalWeight * 0.1) ORDER BY availableWeight ASC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get available quantity (for compatibility with frontend)
  static async getAvailableQuantity(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT availableWeight as availableQuantity FROM chemicals WHERE id = ?',
        [id]
      );
      return rows[0]?.availableQuantity || 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Chemical; 