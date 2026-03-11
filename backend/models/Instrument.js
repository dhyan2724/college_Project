const { supabase } = require('../config/supabase');

// PostgreSQL lowercases unquoted column names; map app camelCase -> DB lowercase for Supabase
const INSTRUMENT_TO_DB = {
  availableQuantity: 'availablequantity',
  totalQuantity: 'totalquantity',
  storagePlace: 'storageplace',
  roomLocation: 'roomlocation',
  instrumentId: 'instrumentid',
  dateOfEntry: 'dateofentry'
};
const INSTRUMENT_FROM_DB = Object.fromEntries(
  Object.entries(INSTRUMENT_TO_DB).map(([k, v]) => [v, k])
);

function toDbKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[INSTRUMENT_TO_DB[k] ?? k] = v;
  }
  return out;
}

function fromDbKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[INSTRUMENT_FROM_DB[k] ?? k] = v;
  }
  return out;
}

class Instrument {
  // Create a new instrument
  static async create(instrumentData) {
    try {
      const { name, type, storagePlace, roomLocation, totalQuantity, availableQuantity, company } = instrumentData;
      
      // Generate instrumentId if not provided
      const instrumentId = instrumentData.instrumentId || `INST-${Date.now()}`;
      
      // Set availableQuantity to totalQuantity if not specified
      const finalAvailableQuantity = availableQuantity !== undefined ? availableQuantity : totalQuantity;
      
      const instrumentRecord = toDbKeys({
        name: name !== undefined ? name : null,
        type: type !== undefined ? type : null,
        storagePlace: storagePlace !== undefined ? storagePlace : null,
        roomLocation: roomLocation !== undefined ? roomLocation : null,
        totalQuantity: totalQuantity !== undefined ? totalQuantity : null,
        availableQuantity: finalAvailableQuantity,
        company: company !== undefined ? company : null,
        instrumentId: instrumentId
      });
      
      const { data, error } = await supabase
        .from('instruments')
        .insert([instrumentRecord])
        .select()
        .single();
      
      if (error) throw error;
      
      return { ...fromDbKeys(data), ...instrumentData, instrumentId, availableQuantity: finalAvailableQuantity };
    } catch (error) {
      throw error;
    }
  }

  // Find instrument by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data ? fromDbKeys(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find instrument by instrumentId
  static async findByInstrumentId(instrumentId) {
    try {
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .eq('instrumentid', instrumentId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data ? fromDbKeys(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all instruments
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(fromDbKeys);
    } catch (error) {
      throw error;
    }
  }

  // Update instrument
  static async updateById(id, updateData) {
    try {
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('instruments')
        .update(toDbKeys(cleanData))
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete instrument
  static async deleteById(id) {
    try {
      const { error } = await supabase
        .from('instruments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Search instruments
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .or(`name.ilike.${searchTerm},instrumentid.ilike.${searchTerm},company.ilike.${searchTerm}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        // Fallback
        const [nameResults, idResults, companyResults] = await Promise.all([
          supabase.from('instruments').select('*').ilike('name', searchTerm),
          supabase.from('instruments').select('*').ilike('instrumentid', searchTerm),
          supabase.from('instruments').select('*').ilike('company', searchTerm)
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

  // Get instruments by type
  static async findByType(type) {
    try {
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(fromDbKeys);
    } catch (error) {
      throw error;
    }
  }

  // Get instruments by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const { data, error } = await supabase
        .from('instruments')
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
        .from('instruments')
        .update(toDbKeys({ availableQuantity: newAvailableQuantity }))
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock instruments (available quantity less than 10% of total quantity)
  static async getLowStock() {
    try {
      const { data: allInstruments, error } = await supabase.from('instruments').select('*');
      if (error) throw error;
      const mapped = (allInstruments || []).map(fromDbKeys);
      return mapped.filter(i => i.availableQuantity < (i.totalQuantity * 0.1))
        .sort((a, b) => a.availableQuantity - b.availableQuantity);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Instrument;
