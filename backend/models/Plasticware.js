const { supabase } = require('../config/supabase');

// PostgreSQL lowercases unquoted column names; map app camelCase -> DB lowercase for Supabase
const PLASTICWARE_TO_DB = {
  availableQuantity: 'availablequantity',
  totalQuantity: 'totalquantity',
  storagePlace: 'storageplace',
  roomLocation: 'roomlocation',
  plasticwareId: 'plasticwareid',
  dateOfEntry: 'dateofentry'
};
const PLASTICWARE_FROM_DB = Object.fromEntries(
  Object.entries(PLASTICWARE_TO_DB).map(([k, v]) => [v, k])
);

function toDbKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[PLASTICWARE_TO_DB[k] ?? k] = v;
  }
  return out;
}

function fromDbKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[PLASTICWARE_FROM_DB[k] ?? k] = v;
  }
  return out;
}

class Plasticware {
  // Create a new plasticware
  static async create(plasticwareData) {
    try {
      const { name, type, storagePlace, roomLocation, totalQuantity, availableQuantity, company } = plasticwareData;
      
      // Generate plasticwareId if not provided
      const plasticwareId = plasticwareData.plasticwareId || `PLASTIC-${Date.now()}`;
      
      // Set availableQuantity to totalQuantity if not specified; fall back to 0 if both missing
      const finalAvailableQuantity =
        availableQuantity !== undefined && availableQuantity !== null
          ? availableQuantity
          : (totalQuantity !== undefined && totalQuantity !== null ? totalQuantity : 0);
      
      const plasticwareRecord = toDbKeys({
        name: name !== undefined ? name : null,
        type: type !== undefined ? type : null,
        storagePlace: storagePlace !== undefined ? storagePlace : null,
        roomLocation: roomLocation !== undefined ? roomLocation : null,
        totalQuantity: totalQuantity !== undefined ? totalQuantity : null,
        availableQuantity: finalAvailableQuantity,
        company: company !== undefined ? company : null,
        plasticwareId: plasticwareId
      });
      
      const { data, error } = await supabase
        .from('plasticwares')
        .insert([plasticwareRecord])
        .select()
        .single();
      
      if (error) throw error;
      
      return { ...fromDbKeys(data), ...plasticwareData, plasticwareId, availableQuantity: finalAvailableQuantity };
    } catch (error) {
      throw error;
    }
  }

  // Find plasticware by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('plasticwares')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data ? fromDbKeys(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find plasticware by plasticwareId
  static async findByPlasticwareId(plasticwareId) {
    try {
      const { data, error } = await supabase
        .from('plasticwares')
        .select('*')
        .eq('plasticwareid', plasticwareId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data ? fromDbKeys(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all plasticwares
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('plasticwares')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(fromDbKeys);
    } catch (error) {
      throw error;
    }
  }

  // Update plasticware
  static async updateById(id, updateData) {
    try {
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('plasticwares')
        .update(toDbKeys(cleanData))
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete plasticware
  static async deleteById(id) {
    try {
      const { error } = await supabase
        .from('plasticwares')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Search plasticwares
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const { data, error } = await supabase
        .from('plasticwares')
        .select('*')
        .or(`name.ilike.${searchTerm},plasticwareid.ilike.${searchTerm},company.ilike.${searchTerm}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        // Fallback
        const [nameResults, idResults, companyResults] = await Promise.all([
          supabase.from('plasticwares').select('*').ilike('name', searchTerm),
          supabase.from('plasticwares').select('*').ilike('plasticwareid', searchTerm),
          supabase.from('plasticwares').select('*').ilike('company', searchTerm)
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

  // Get plasticwares by type
  static async findByType(type) {
    try {
      const { data, error } = await supabase
        .from('plasticwares')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(fromDbKeys);
    } catch (error) {
      throw error;
    }
  }

  // Get plasticwares by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const { data, error } = await supabase
        .from('plasticwares')
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
        .from('plasticwares')
        .update(toDbKeys({ availableQuantity: newAvailableQuantity }))
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock plasticwares (available quantity less than 10% of total quantity)
  static async getLowStock() {
    try {
      const { data: allPlasticwares, error } = await supabase.from('plasticwares').select('*');
      if (error) throw error;
      const mapped = (allPlasticwares || []).map(fromDbKeys);
      return mapped.filter(p => p.availableQuantity < (p.totalQuantity * 0.1))
        .sort((a, b) => a.availableQuantity - b.availableQuantity);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Plasticware;
