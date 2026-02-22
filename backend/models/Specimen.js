const { supabase } = require('../config/supabase');

class Specimen {
  // Create a new specimen
  static async create(specimenData) {
    try {
      const { name, description, storagePlace, totalQuantity, availableQuantity, company } = specimenData;
      
      // Generate specimenId if not provided
      const specimenId = specimenData.specimenId || `SPEC-${Date.now()}`;
      
      // Set availableQuantity to totalQuantity if not specified
      const finalAvailableQuantity = (availableQuantity !== undefined && availableQuantity !== null)
        ? availableQuantity
        : (totalQuantity !== undefined ? totalQuantity : null);
      
      const specimenRecord = {
        name: name !== undefined ? name : null,
        description: description !== undefined ? description : null,
        storagePlace: storagePlace !== undefined ? storagePlace : null,
        totalQuantity: totalQuantity !== undefined ? totalQuantity : null,
        availableQuantity: finalAvailableQuantity !== undefined ? finalAvailableQuantity : null,
        company: company !== undefined ? company : null,
        specimenId: specimenId
      };
      
      const { data, error } = await supabase
        .from('specimens')
        .insert([specimenRecord])
        .select()
        .single();
      
      if (error) throw error;
      
      return { ...data, ...specimenData, specimenId, availableQuantity: finalAvailableQuantity };
    } catch (error) {
      throw error;
    }
  }

  // Find specimen by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('specimens')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Find specimen by specimenId
  static async findBySpecimenId(specimenId) {
    try {
      const { data, error } = await supabase
        .from('specimens')
        .select('*')
        .eq('specimenId', specimenId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all specimens
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('specimens')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Update specimen
  static async updateById(id, updateData) {
    try {
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('specimens')
        .update(cleanData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete specimen
  static async deleteById(id) {
    try {
      const { error } = await supabase
        .from('specimens')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Search specimens
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const { data, error } = await supabase
        .from('specimens')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},specimenId.ilike.${searchTerm},company.ilike.${searchTerm}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        // Fallback
        const [nameResults, descResults, idResults, companyResults] = await Promise.all([
          supabase.from('specimens').select('*').ilike('name', searchTerm),
          supabase.from('specimens').select('*').ilike('description', searchTerm),
          supabase.from('specimens').select('*').ilike('specimenId', searchTerm),
          supabase.from('specimens').select('*').ilike('company', searchTerm)
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

  // Get specimens by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const { data, error } = await supabase
        .from('specimens')
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
        .from('specimens')
        .update({ availableQuantity: newAvailableQuantity })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock specimens (available quantity less than 10% of total quantity)
  static async getLowStock() {
    try {
      const { data: allSpecimens, error } = await supabase.from('specimens').select('*');
      if (error) throw error;
      return (allSpecimens || []).filter(s => s.availableQuantity < (s.totalQuantity * 0.1))
        .sort((a, b) => a.availableQuantity - b.availableQuantity);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Specimen;
