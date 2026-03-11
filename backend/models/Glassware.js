const { supabase } = require('../config/supabase');

// PostgreSQL lowercases unquoted column names; map app camelCase -> DB lowercase for Supabase
const GLASSWARE_TO_DB = {
  availableQuantity: 'availablequantity',
  totalQuantity: 'totalquantity',
  storagePlace: 'storageplace',
  roomLocation: 'roomlocation',
  glasswareId: 'glasswareid',
  dateOfEntry: 'dateofentry'
};
const GLASSWARE_FROM_DB = Object.fromEntries(
  Object.entries(GLASSWARE_TO_DB).map(([k, v]) => [v, k])
);

function toDbKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[GLASSWARE_TO_DB[k] ?? k] = v;
  }
  return out;
}

function fromDbKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[GLASSWARE_FROM_DB[k] ?? k] = v;
  }
  return out;
}

class Glassware {
  // Create a new glassware
  static async create(glasswareData) {
    try {
      const { name, type, storagePlace, roomLocation, totalQuantity, availableQuantity, company } = glasswareData;
      
      // Generate glasswareId if not provided
      const glasswareId = glasswareData.glasswareId || `GLASS-${Date.now()}`;
      
      // Set availableQuantity to totalQuantity if not specified
      const finalAvailableQuantity = availableQuantity !== undefined ? availableQuantity : totalQuantity;
      
      const glasswareRecord = toDbKeys({
        name: name !== undefined ? name : null,
        type: type !== undefined ? type : null,
        storagePlace: storagePlace !== undefined ? storagePlace : null,
        roomLocation: roomLocation !== undefined ? roomLocation : null,
        totalQuantity: totalQuantity !== undefined ? totalQuantity : null,
        availableQuantity: finalAvailableQuantity,
        company: company !== undefined ? company : null,
        glasswareId: glasswareId
      });
      
      const { data, error } = await supabase
        .from('glasswares')
        .insert([glasswareRecord])
        .select()
        .single();
      
      if (error) throw error;
      
      return { ...fromDbKeys(data), ...glasswareData, glasswareId, availableQuantity: finalAvailableQuantity };
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
      return data ? fromDbKeys(data) : null;
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
        .eq('glasswareid', glasswareId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data ? fromDbKeys(data) : null;
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
      return (data || []).map(fromDbKeys);
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
        .update(toDbKeys(cleanData))
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
        .or(`name.ilike.${searchTerm},glasswareid.ilike.${searchTerm},company.ilike.${searchTerm}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        // Fallback
        const [nameResults, idResults, companyResults] = await Promise.all([
          supabase.from('glasswares').select('*').ilike('name', searchTerm),
          supabase.from('glasswares').select('*').ilike('glasswareid', searchTerm),
          supabase.from('glasswares').select('*').ilike('company', searchTerm)
        ]);
        const combined = [...(nameResults.data || []), ...(idResults.data || []), ...(companyResults.data || [])];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return unique.map(fromDbKeys).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      return (data || []).map(fromDbKeys);
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
      return (data || []).map(fromDbKeys);
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
        .eq('storageplace', storagePlace)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(fromDbKeys);
    } catch (error) {
      throw error;
    }
  }

  // Update available quantity
  static async updateAvailableQuantity(id, newAvailableQuantity) {
    try {
      const { data, error } = await supabase
        .from('glasswares')
        .update(toDbKeys({ availableQuantity: newAvailableQuantity }))
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
      const mapped = (allGlasswares || []).map(fromDbKeys);
      return mapped.filter(g => g.availableQuantity < (g.totalQuantity * 0.1))
        .sort((a, b) => a.availableQuantity - b.availableQuantity);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Glassware;
