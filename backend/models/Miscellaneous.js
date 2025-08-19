const { pool } = require('../config/database');

class Miscellaneous {
  // Create a new miscellaneous item
  static async create(miscellaneousData) {
    try {
      const { name, type, description, storagePlace, totalQuantity, availableQuantity, company, catalogNumber } = miscellaneousData;
      
      // Generate miscellaneousId if not provided
      const miscellaneousId = miscellaneousData.miscellaneousId || `MISC-${Date.now()}`;
      
      // Set availableQuantity to totalQuantity if not specified
      const finalAvailableQuantity = availableQuantity !== undefined ? availableQuantity : totalQuantity;
      
      // Convert undefined values to null for MySQL
      const safeName = name !== undefined ? name : null;
      const safeType = type !== undefined ? type : null;
      const safeDescription = description !== undefined ? description : null;
      const safeStoragePlace = storagePlace !== undefined ? storagePlace : null;
      const safeTotalQuantity = totalQuantity !== undefined ? totalQuantity : null;
      const safeCompany = company !== undefined ? company : null;
      const safeCatalogNumber = catalogNumber !== undefined ? catalogNumber : null;
      
      const [result] = await pool.execute(
        'INSERT INTO miscellaneous (name, type, description, storagePlace, totalQuantity, availableQuantity, company, catalogNumber, miscellaneousId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [safeName, safeType, safeDescription, safeStoragePlace, safeTotalQuantity, finalAvailableQuantity, safeCompany, safeCatalogNumber, miscellaneousId]
      );
      
      return { id: result.insertId, ...miscellaneousData, miscellaneousId, availableQuantity: finalAvailableQuantity };
    } catch (error) {
      throw error;
    }
  }

  // Find miscellaneous item by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM miscellaneous WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find miscellaneous item by catalog number
  static async findByCatalogNumber(catalogNumber) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM miscellaneous WHERE catalogNumber = ?',
        [catalogNumber]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find miscellaneous item by miscellaneousId
  static async findByMiscellaneousId(miscellaneousId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM miscellaneous WHERE miscellaneousId = ?',
        [miscellaneousId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all miscellaneous items
  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM miscellaneous ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update miscellaneous item
  static async updateById(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);
      
      const [result] = await pool.execute(
        `UPDATE miscellaneous SET ${fields} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete miscellaneous item
  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM miscellaneous WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Search miscellaneous items
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM miscellaneous WHERE name LIKE ? OR description LIKE ? OR catalogNumber LIKE ? OR miscellaneousId LIKE ? OR company LIKE ? ORDER BY created_at DESC',
        [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get miscellaneous items by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM miscellaneous WHERE storagePlace = ? ORDER BY created_at DESC',
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
        'UPDATE miscellaneous SET availableQuantity = ? WHERE id = ?',
        [newAvailableQuantity, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock miscellaneous items (available quantity less than 10% of total quantity)
  static async getLowStock() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM miscellaneous WHERE availableQuantity < (totalQuantity * 0.1) ORDER BY availableQuantity ASC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Miscellaneous; 