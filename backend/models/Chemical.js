const { supabase } = require('../config/supabase');

// PostgreSQL lowercases unquoted column names; map app camelCase -> DB lowercase for Supabase
const CHEMICAL_TO_DB = {
  availableWeight: 'availableweight',
  totalWeight: 'totalweight',
  storagePlace: 'storageplace',
  roomLocation: 'roomlocation',
  catalogNumber: 'catalognumber',
  chemicalId: 'chemicalid',
  dateOfEntry: 'dateofentry'
};
const CHEMICAL_FROM_DB = Object.fromEntries(
  Object.entries(CHEMICAL_TO_DB).map(([k, v]) => [v, k])
);

function toDbKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[CHEMICAL_TO_DB[k] ?? k] = v;
  }
  return out;
}

function fromDbKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[CHEMICAL_FROM_DB[k] ?? k] = v;
  }
  return out;
}

class Chemical {
  // Create a new chemical
  static async create(chemicalData) {
    try {
      const { name, type, storagePlace, roomLocation, totalWeight, availableWeight, company, catalogNumber } = chemicalData;
      
      // Generate chemicalId if not provided
      const chemicalId = chemicalData.chemicalId || `CHEM-${Date.now()}`;
      
      // Set availableWeight to totalWeight if not specified; fall back to 0 if both missing
      const finalAvailableWeight =
        availableWeight !== undefined && availableWeight !== null
          ? availableWeight
          : (totalWeight !== undefined && totalWeight !== null ? totalWeight : 0);
      
      // Prepare data object with DB column names (lowercase for PostgreSQL)
      const chemicalRecord = toDbKeys({
        name: name !== undefined ? name : null,
        type: type !== undefined ? type : null,
        storagePlace: storagePlace !== undefined ? storagePlace : null,
        roomLocation: roomLocation !== undefined ? roomLocation : null,
        totalWeight: totalWeight !== undefined ? totalWeight : null,
        availableWeight: finalAvailableWeight,
        company: company !== undefined ? company : null,
        catalogNumber: catalogNumber !== undefined ? catalogNumber : null,
        chemicalId: chemicalId
      });
      
      const { data, error } = await supabase
        .from('chemicals')
        .insert([chemicalRecord])
        .select()
        .single();
      
      if (error) throw error;
      
      return { ...fromDbKeys(data), ...chemicalData, chemicalId, availableWeight: finalAvailableWeight };
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
      return data ? fromDbKeys(data) : null;
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
        .eq('catalognumber', catalogNumber)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data ? fromDbKeys(data) : null;
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
        .eq('chemicalid', chemicalId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data ? fromDbKeys(data) : null;
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
      return (data || []).map(fromDbKeys);
    } catch (error) {
      throw error;
    }
  }

  // Update chemical
  static async updateById(id, updateData) {
    try {
      // Remove undefined values and convert to DB column names
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('chemicals')
        .update(toDbKeys(cleanData))
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
        .or(`name.ilike.${searchTerm},catalognumber.ilike.${searchTerm},chemicalid.ilike.${searchTerm},company.ilike.${searchTerm}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        // Fallback to individual queries (use DB column names)
        const [nameResults, catalogResults, idResults, companyResults] = await Promise.all([
          supabase.from('chemicals').select('*').ilike('name', searchTerm),
          supabase.from('chemicals').select('*').ilike('catalognumber', searchTerm),
          supabase.from('chemicals').select('*').ilike('chemicalid', searchTerm),
          supabase.from('chemicals').select('*').ilike('company', searchTerm)
        ]);
        
        const combined = [
          ...(nameResults.data || []),
          ...(catalogResults.data || []),
          ...(idResults.data || []),
          ...(companyResults.data || [])
        ];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return unique.map(fromDbKeys).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      return (data || []).map(fromDbKeys);
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
      return (data || []).map(fromDbKeys);
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
        .eq('storageplace', storagePlace)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(fromDbKeys);
    } catch (error) {
      throw error;
    }
  }

  // Update available weight
  static async updateAvailableWeight(id, newAvailableWeight) {
    try {
      const { data, error } = await supabase
        .from('chemicals')
        .update(toDbKeys({ availableWeight: newAvailableWeight }))
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
      const { data: allChemicals, error } = await supabase.from('chemicals').select('*');
      if (error) throw error;
      const mapped = (allChemicals || []).map(fromDbKeys);
      return mapped.filter(c => c.availableWeight < (c.totalWeight * 0.1))
        .sort((a, b) => a.availableWeight - b.availableWeight);
    } catch (error) {
      throw error;
    }
  }

  // Get available quantity (for compatibility with frontend)
  static async getAvailableQuantity(id) {
    try {
      const { data, error } = await supabase
        .from('chemicals')
        .select('availableweight')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.availableweight ?? data?.availableWeight ?? 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Chemical;
