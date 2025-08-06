const { pool } = require('../config/database');

class FAQ {
  // Create a new FAQ
  static async create(faqData) {
    try {
      const { question, answer, category } = faqData;

      const [result] = await pool.execute(
        'INSERT INTO faqs (question, answer, category) VALUES (?, ?, ?)',
        [question, answer, category]
      );

      return { id: result.insertId, ...faqData };
    } catch (error) {
      throw error;
    }
  }

  // Find FAQ by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM faqs WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all FAQs
  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM faqs ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get FAQs by category
  static async findByCategory(category) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM faqs WHERE category = ? ORDER BY created_at DESC',
        [category]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Search FAQs
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM faqs WHERE question LIKE ? OR answer LIKE ? OR category LIKE ? ORDER BY created_at DESC',
        [searchTerm, searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update FAQ
  static async updateById(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);
      
      const [result] = await pool.execute(
        `UPDATE faqs SET ${fields} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete FAQ
  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM faqs WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get categories
  static async getCategories() {
    try {
      const [rows] = await pool.execute(
        'SELECT DISTINCT category FROM faqs WHERE category IS NOT NULL ORDER BY category'
      );
      return rows.map(row => row.category);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = FAQ; 