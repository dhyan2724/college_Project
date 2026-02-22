const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(userData) {
    try {
      const { username, password, role, email, fullName, rollNo, category, year, department } = userData;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Prepare data object
      const userRecord = {
        username: username || null,
        password: hashedPassword,
        role: role ? role.toLowerCase() : null,
        email: email ? email.toLowerCase() : null,
        fullName: fullName || null,
        rollNo: rollNo || null,
        category: category || null,
        year: year || null,
        department: department || null
      };

      const { data, error } = await supabase
        .from('users')
        .insert([userRecord])
        .select()
        .single();
      
      if (error) throw error;
      
      return { ...data, ...userData };
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by roll number
  static async findByRollNo(rollNo) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('rollNo', rollNo)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all users
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Update user
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
        .from('users')
        .update(cleanData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update last login
  static async updateLastLogin(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ lastLogin: new Date().toISOString() })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async deleteById(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get users by role
  static async findByRole(role) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role.toLowerCase())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Search users
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.${searchTerm},fullName.ilike.${searchTerm},email.ilike.${searchTerm},rollNo.ilike.${searchTerm}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      // Fallback to individual LIKE queries if OR doesn't work
      try {
        const { data: data1 } = await supabase.from('users').select('*').ilike('username', searchTerm);
        const { data: data2 } = await supabase.from('users').select('*').ilike('fullName', searchTerm);
        const { data: data3 } = await supabase.from('users').select('*').ilike('email', searchTerm);
        const { data: data4 } = await supabase.from('users').select('*').ilike('rollNo', searchTerm);
        
        const combined = [...(data1 || []), ...(data2 || []), ...(data3 || []), ...(data4 || [])];
        // Remove duplicates
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } catch (fallbackError) {
        throw error;
      }
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
