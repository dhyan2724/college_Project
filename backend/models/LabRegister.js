const { supabase } = require('../config/supabase');

class LabRegister {
  // Create a new lab register entry
  static async create(labRegisterData) {
    try {
      const {
        registerType,
        labType,
        day,
        name,
        facultyInCharge,
        item,
        totalWeight,
        purpose,
        inTime,
        outTime
      } = labRegisterData;

      const { data, error } = await supabase
        .from('lab_registers')
        .insert([{
          registerType,
          labType,
          day,
          name,
          facultyInCharge,
          item,
          totalWeight,
          purpose,
          inTime,
          outTime
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, ...labRegisterData };
    } catch (error) {
      throw error;
    }
  }

  // Find lab register entry by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('lab_registers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all lab register entries
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('lab_registers')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get lab register entries by register type
  static async findByRegisterType(registerType) {
    try {
      const { data, error } = await supabase
        .from('lab_registers')
        .select('*')
        .eq('registerType', registerType)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get lab register entries by lab type
  static async findByLabType(labType) {
    try {
      const { data, error } = await supabase
        .from('lab_registers')
        .select('*')
        .eq('labType', labType)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get lab register entries by date range
  static async findByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('lab_registers')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get lab register entries by faculty in charge
  static async findByFacultyInCharge(facultyInCharge) {
    try {
      const { data, error } = await supabase
        .from('lab_registers')
        .select('*')
        .eq('facultyInCharge', facultyInCharge)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Update lab register entry
  static async updateById(id, updateData) {
    try {
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('lab_registers')
        .update(cleanData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete lab register entry
  static async deleteById(id) {
    try {
      const { error } = await supabase
        .from('lab_registers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get lab register entries with pagination
  static async findWithPagination(page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('lab_registers')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;

      return {
        entries: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get statistics by register type
  static async getStatisticsByType() {
    try {
      const { data, error } = await supabase
        .from('lab_registers')
        .select('registerType');
      
      if (error) throw error;
      
      const stats = {};
      (data || []).forEach(entry => {
        stats[entry.registerType] = (stats[entry.registerType] || 0) + 1;
      });
      
      return Object.entries(stats).map(([registerType, count]) => ({ registerType, count }));
    } catch (error) {
      throw error;
    }
  }

  // Get statistics by lab type
  static async getStatisticsByLabType() {
    try {
      const { data, error } = await supabase
        .from('lab_registers')
        .select('labType');
      
      if (error) throw error;
      
      const stats = {};
      (data || []).forEach(entry => {
        stats[entry.labType] = (stats[entry.labType] || 0) + 1;
      });
      
      return Object.entries(stats).map(([labType, count]) => ({ labType, count }));
    } catch (error) {
      throw error;
    }
  }

  // Get recent entries (last N days)
  static async getRecent(days = 7) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);
      const startDate = date.toISOString();
      
      const { data, error } = await supabase
        .from('lab_registers')
        .select('*')
        .gte('date', startDate)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LabRegister;
