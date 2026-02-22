const { supabase } = require('../config/supabase');

class Miscellaneous {
  // Create a new miscellaneous item
  static async create(miscellaneousData) {
    try {
      const { name, type, description, storagePlace, totalQuantity, availableQuantity, company } = miscellaneousData;
      
      // Generate miscellaneousId if not provided
      const miscellaneousId = miscellaneousData.miscellaneousId || `MISC-${Date.now()}`;
      
      // Set availableQuantity to totalQuantity if not specified
      const finalAvailableQuantity = availableQuantity !== undefined ? availableQuantity : totalQuantity;
      
      const miscellaneousRecord = {
        name: name !== undefined ? name : null,
        type: type !== undefined ? type : null,
        description: description !== undefined ? description : null,
        storagePlace: storagePlace !== undefined ? storagePlace : null,
        totalQuantity: totalQuantity !== undefined ? totalQuantity : null,
        availableQuantity: finalAvailableQuantity,
        company: company !== undefined ? company : null,
        miscellaneousId: miscellaneousId
      };
      
      const { data, error } = await supabase
        .from('miscellaneous')
        .insert([miscellaneousRecord])
        .select()
        .single();
      
      if (error) throw error;
      
      return { ...data, ...miscellaneousData, miscellaneousId, availableQuantity: finalAvailableQuantity };
    } catch (error) {
      throw error;
    }
  }

  // Find miscellaneous item by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('miscellaneous')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Find miscellaneous item by miscellaneousId
  static async findByMiscellaneousId(miscellaneousId) {
    try {
      const { data, error } = await supabase
        .from('miscellaneous')
        .select('*')
        .eq('miscellaneousId', miscellaneousId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all miscellaneous items
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('miscellaneous')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Update miscellaneous item
  static async updateById(id, updateData) {
    try {
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('miscellaneous')
        .update(cleanData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete miscellaneous item
  static async deleteById(id) {
    try {
      const { error } = await supabase
        .from('miscellaneous')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Search miscellaneous items
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const { data, error } = await supabase
        .from('miscellaneous')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},miscellaneousId.ilike.${searchTerm},company.ilike.${searchTerm}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        // Fallback
        const [nameResults, descResults, idResults, companyResults] = await Promise.all([
          supabase.from('miscellaneous').select('*').ilike('name', searchTerm),
          supabase.from('miscellaneous').select('*').ilike('description', searchTerm),
          supabase.from('miscellaneous').select('*').ilike('miscellaneousId', searchTerm),
          supabase.from('miscellaneous').select('*').ilike('company', searchTerm)
        ]);
        const combined = [
          ...(nameResults.data || []),
          ...(descResults.data || []),
          ...(idResults.data || []),
          ...(companyResults.data || [])
        ];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get miscellaneous items by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const { data, error } = await supabase
        .from('miscellaneous')
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
        .from('miscellaneous')
        .update({ availableQuantity: newAvailableQuantity })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock miscellaneous items (available quantity less than 10% of total quantity)
  static async getLowStock() {
    try {
      const { data: allMiscellaneous, error } = await supabase.from('miscellaneous').select('*');
      if (error) throw error;
      return (allMiscellaneous || []).filter(m => m.availableQuantity < (m.totalQuantity * 0.1))
        .sort((a, b) => a.availableQuantity - b.availableQuantity);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Miscellaneous;
