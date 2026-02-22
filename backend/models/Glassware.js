const { supabase } = require('../config/supabase');

class Glassware {
  // Create a new glassware
  static async create(glasswareData) {
    try {
      const { name, type, storagePlace, totalQuantity, availableQuantity, company } = glasswareData;
      
      // Generate glasswareId if not provided
      const glasswareId = glasswareData.glasswareId || `GLASS-${Date.now()}`;
      
      // Set availableQuantity to totalQuantity if not specified
      const finalAvailableQuantity = availableQuantity !== undefined ? availableQuantity : totalQuantity;
      
      const glasswareRecord = {
        name: name !== undefined ? name : null,
        type: type !== undefined ? type : null,
        storagePlace: storagePlace !== undefined ? storagePlace : null,
        totalQuantity: totalQuantity !== undefined ? totalQuantity : null,
        availableQuantity: finalAvailableQuantity,
        company: company !== undefined ? company : null,
        glasswareId: glasswareId
      };
      
      const { data, error } = await supabase
        .from('glasswares')
        .insert([glasswareRecord])
        .select()
        .single();
      
      if (error) throw error;
      
      return { ...data, ...glasswareData, glasswareId, availableQuantity: finalAvailableQuantity };
    } catch (error) {
      throw error;
    }
  }

  // Find glassware by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('glasswares')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Find glassware by glasswareId
  static async findByGlasswareId(glasswareId) {
    try {
      const { data, error } = await supabase
        .from('glasswares')
        .select('*')
        .eq('glasswareId', glasswareId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all glasswares
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('glasswares')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Update glassware
  static async updateById(id, updateData) {
    try {
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('glasswares')
        .update(cleanData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete glassware
  static async deleteById(id) {
    try {
      const { error } = await supabase
        .from('glasswares')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Search glasswares
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const { data, error } = await supabase
        .from('glasswares')
        .select('*')
        .or(`name.ilike.${searchTerm},glasswareId.ilike.${searchTerm},company.ilike.${searchTerm}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        // Fallback
        const [nameResults, idResults, companyResults] = await Promise.all([
          supabase.from('glasswares').select('*').ilike('name', searchTerm),
          supabase.from('glasswares').select('*').ilike('glasswareId', searchTerm),
          supabase.from('glasswares').select('*').ilike('company', searchTerm)
        ]);
        const combined = [...(nameResults.data || []), ...(idResults.data || []), ...(companyResults.data || [])];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get glasswares by type
  static async findByType(type) {
    try {
      const { data, error } = await supabase
        .from('glasswares')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get glasswares by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const { data, error } = await supabase
        .from('glasswares')
        .select('*')
        .eq('storagePlace', storagePlace)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Update available quantity
  static async updateAvailableQuantity(id, newAvailableQuantity) {
    try {
      const { data, error } = await supabase
        .from('glasswares')
        .update({ availableQuantity: newAvailableQuantity })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock glasswares (available quantity less than 10% of total quantity)
  static async getLowStock() {
    try {
      const { data: allGlasswares, error } = await supabase.from('glasswares').select('*');
      if (error) throw error;
      return (allGlasswares || []).filter(g => g.availableQuantity < (g.totalQuantity * 0.1))
        .sort((a, b) => a.availableQuantity - b.availableQuantity);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Glassware;
