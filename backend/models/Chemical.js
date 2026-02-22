const { supabase } = require('../config/supabase');

class Chemical {
  // Create a new chemical
  static async create(chemicalData) {
    try {
      const { name, type, storagePlace, totalWeight, availableWeight, company, catalogNumber } = chemicalData;
      
      // Generate chemicalId if not provided
      const chemicalId = chemicalData.chemicalId || `CHEM-${Date.now()}`;
      
      // Set availableWeight to totalWeight if not specified; fall back to 0 if both missing
      const finalAvailableWeight =
        availableWeight !== undefined && availableWeight !== null
          ? availableWeight
          : (totalWeight !== undefined && totalWeight !== null ? totalWeight : 0);
      
      // Prepare data object
      const chemicalRecord = {
        name: name !== undefined ? name : null,
        type: type !== undefined ? type : null,
        storagePlace: storagePlace !== undefined ? storagePlace : null,
        totalWeight: totalWeight !== undefined ? totalWeight : null,
        availableWeight: finalAvailableWeight,
        company: company !== undefined ? company : null,
        catalogNumber: catalogNumber !== undefined ? catalogNumber : null,
        chemicalId: chemicalId
      };
      
      const { data, error } = await supabase
        .from('chemicals')
        .insert([chemicalRecord])
        .select()
        .single();
      
      if (error) throw error;
      
      return { ...data, ...chemicalData, chemicalId, availableWeight: finalAvailableWeight };
    } catch (error) {
      throw error;
    }
  }

  // Find chemical by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('chemicals')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Find chemical by catalog number
  static async findByCatalogNumber(catalogNumber) {
    try {
      const { data, error } = await supabase
        .from('chemicals')
        .select('*')
        .eq('catalogNumber', catalogNumber)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Find chemical by chemicalId
  static async findByChemicalId(chemicalId) {
    try {
      const { data, error } = await supabase
        .from('chemicals')
        .select('*')
        .eq('chemicalId', chemicalId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all chemicals
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('chemicals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Update chemical
  static async updateById(id, updateData) {
    try {
      // Remove undefined values
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('chemicals')
        .update(cleanData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete chemical
  static async deleteById(id) {
    try {
      const { error } = await supabase
        .from('chemicals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Search chemicals
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const { data, error } = await supabase
        .from('chemicals')
        .select('*')
        .or(`name.ilike.${searchTerm},catalogNumber.ilike.${searchTerm},chemicalId.ilike.${searchTerm},company.ilike.${searchTerm}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        // Fallback to individual queries
        const [nameResults, catalogResults, idResults, companyResults] = await Promise.all([
          supabase.from('chemicals').select('*').ilike('name', searchTerm),
          supabase.from('chemicals').select('*').ilike('catalogNumber', searchTerm),
          supabase.from('chemicals').select('*').ilike('chemicalId', searchTerm),
          supabase.from('chemicals').select('*').ilike('company', searchTerm)
        ]);
        
        const combined = [
          ...(nameResults.data || []),
          ...(catalogResults.data || []),
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

  // Get chemicals by type
  static async findByType(type) {
    try {
      const { data, error } = await supabase
        .from('chemicals')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get chemicals by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const { data, error } = await supabase
        .from('chemicals')
        .select('*')
        .eq('storagePlace', storagePlace)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Update available weight
  static async updateAvailableWeight(id, newAvailableWeight) {
    try {
      const { data, error } = await supabase
        .from('chemicals')
        .update({ availableWeight: newAvailableWeight })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock chemicals (available weight less than 10% of total weight)
  static async getLowStock() {
    try {
      const { data, error } = await supabase
        .from('chemicals')
        .select('*')
        .lt('availableWeight', supabase.raw('totalWeight * 0.1'));
      
      if (error) {
        // Fallback: fetch all and filter in JavaScript
        const { data: allChemicals } = await supabase.from('chemicals').select('*');
        return (allChemicals || []).filter(c => c.availableWeight < (c.totalWeight * 0.1))
          .sort((a, b) => a.availableWeight - b.availableWeight);
      }
      
      return (data || []).sort((a, b) => a.availableWeight - b.availableWeight);
    } catch (error) {
      throw error;
    }
  }

  // Get available quantity (for compatibility with frontend)
  static async getAvailableQuantity(id) {
    try {
      const { data, error } = await supabase
        .from('chemicals')
        .select('availableWeight')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.availableWeight || 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Chemical;
