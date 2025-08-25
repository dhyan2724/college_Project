const { pool } = require('../config/database');

class Slide {
  // Create a new slide
  static async create(slideData) {
    try {
      const { name, description, storagePlace, totalQuantity, availableQuantity, company } = slideData;
      
      // Generate slideId if not provided
      const slideId = slideData.slideId || `SLIDE-${Date.now()}`;
      
      // Set availableQuantity to totalQuantity if not specified
      const finalAvailableQuantity = availableQuantity !== undefined ? availableQuantity : totalQuantity;
      
      // Convert undefined values to null for MySQL
      const safeName = name !== undefined ? name : null;
      const safeDescription = description !== undefined ? description : null;
      const safeStoragePlace = storagePlace !== undefined ? storagePlace : null;
      const safeTotalQuantity = totalQuantity !== undefined ? totalQuantity : null;
      const safeCompany = company !== undefined ? company : null;
      
      const [result] = await pool.execute(
        'INSERT INTO slides (name, description, storagePlace, totalQuantity, availableQuantity, company, slideId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [safeName, safeDescription, safeStoragePlace, safeTotalQuantity, finalAvailableQuantity, safeCompany, slideId]
      );
      
      return { id: result.insertId, ...slideData, slideId, availableQuantity: finalAvailableQuantity };
    } catch (error) {
      throw error;
    }
  }

  // Find slide by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM slides WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // removed catalog number lookups

  // Find slide by slideId
  static async findBySlideId(slideId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM slides WHERE slideId = ?',
        [slideId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all slides
  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM slides ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update slide
  static async updateById(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);
      
      const [result] = await pool.execute(
        `UPDATE slides SET ${fields} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete slide
  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM slides WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Search slides
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM slides WHERE name LIKE ? OR description LIKE ? OR slideId LIKE ? OR company LIKE ? ORDER BY created_at DESC',
        [searchTerm, searchTerm, searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get slides by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM slides WHERE storagePlace = ? ORDER BY created_at DESC',
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
        'UPDATE slides SET availableQuantity = ? WHERE id = ?',
        [newAvailableQuantity, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock slides (available quantity less than 10% of total quantity)
  static async getLowStock() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM slides WHERE availableQuantity < (totalQuantity * 0.1) ORDER BY availableQuantity ASC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Slide;