const { pool } = require('../config/database');

class Specimen {
  // Create a new specimen
  static async create(specimenData) {
    try {
      const { name, description, storagePlace, totalQuantity, availableQuantity, company, catalogNumber } = specimenData;
      
      // Generate specimenId if not provided
      const specimenId = specimenData.specimenId || `SPEC-${Date.now()}`;
      
      // Set availableQuantity to totalQuantity if not specified
      const finalAvailableQuantity = availableQuantity !== undefined ? availableQuantity : totalQuantity;
      
      // Convert undefined values to null for MySQL
      const safeName = name !== undefined ? name : null;
      const safeDescription = description !== undefined ? description : null;
      const safeStoragePlace = storagePlace !== undefined ? storagePlace : null;
      const safeTotalQuantity = totalQuantity !== undefined ? totalQuantity : null;
      const safeCompany = company !== undefined ? company : null;
      const safeCatalogNumber = catalogNumber !== undefined ? catalogNumber : null;
      
      const [result] = await pool.execute(
        'INSERT INTO specimens (name, description, storagePlace, totalQuantity, availableQuantity, company, catalogNumber, specimenId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [safeName, safeDescription, safeStoragePlace, safeTotalQuantity, finalAvailableQuantity, safeCompany, safeCatalogNumber, specimenId]
      );
      
      return { id: result.insertId, ...specimenData, specimenId, availableQuantity: finalAvailableQuantity };
    } catch (error) {
      throw error;
    }
  }

  // Find specimen by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM specimens WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find specimen by catalog number
  static async findByCatalogNumber(catalogNumber) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM specimens WHERE catalogNumber = ?',
        [catalogNumber]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find specimen by specimenId
  static async findBySpecimenId(specimenId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM specimens WHERE specimenId = ?',
        [specimenId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all specimens
  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM specimens ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update specimen
  static async updateById(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);
      
      const [result] = await pool.execute(
        `UPDATE specimens SET ${fields} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete specimen
  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM specimens WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Search specimens
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM specimens WHERE name LIKE ? OR description LIKE ? OR catalogNumber LIKE ? OR specimenId LIKE ? OR company LIKE ? ORDER BY created_at DESC',
        [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get specimens by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM specimens WHERE storagePlace = ? ORDER BY created_at DESC',
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
        'UPDATE specimens SET availableQuantity = ? WHERE id = ?',
        [newAvailableQuantity, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock specimens (available quantity less than 10% of total quantity)
  static async getLowStock() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM specimens WHERE availableQuantity < (totalQuantity * 0.1) ORDER BY availableQuantity ASC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Specimen;