const { supabase } = require('../config/supabase');

class FAQ {
  // Create a new FAQ
  static async create(faqData) {
    try {
      const { question, answer, category } = faqData;

      const { data, error } = await supabase
        .from('faqs')
        .insert([{ question, answer, category }])
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, ...faqData };
    } catch (error) {
      throw error;
    }
  }

  // Find FAQ by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all FAQs
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get FAQs by category
  static async findByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Search FAQs
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .or(`question.ilike.${searchTerm},answer.ilike.${searchTerm},category.ilike.${searchTerm}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        // Fallback
        const [qResults, aResults, cResults] = await Promise.all([
          supabase.from('faqs').select('*').ilike('question', searchTerm),
          supabase.from('faqs').select('*').ilike('answer', searchTerm),
          supabase.from('faqs').select('*').ilike('category', searchTerm)
        ]);
        const combined = [...(qResults.data || []), ...(aResults.data || []), ...(cResults.data || [])];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Update FAQ
  static async updateById(id, updateData) {
    try {
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('faqs')
        .update(cleanData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete FAQ
  static async deleteById(id) {
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get categories
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('category')
        .not('category', 'is', null);
      
      if (error) throw error;
      const categories = [...new Set((data || []).map(item => item.category).filter(Boolean))];
      return categories.sort();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = FAQ;
