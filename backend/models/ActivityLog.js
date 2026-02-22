const { supabase } = require('../config/supabase');

class ActivityLog {
  // Create a new activity log
  static async create(activityLogData) {
    try {
      const { action, itemType, itemId, itemName, user, details } = activityLogData;

      const { data, error } = await supabase
        .from('activity_logs')
        .insert([{ action, itemType, itemId, itemName, user, details }])
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, ...activityLogData };
    } catch (error) {
      throw error;
    }
  }

  // Find activity log by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all activity logs
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get activity logs by action
  static async findByAction(action) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('action', action)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get activity logs by item type
  static async findByItemType(itemType) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('itemType', itemType)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get activity logs by user
  static async findByUser(user) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user', user)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get activity logs by date range
  static async findByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get recent activity logs (last N days)
  static async getRecent(days = 7) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);
      const startDate = date.toISOString();
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .gte('timestamp', startDate)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Delete activity log
  static async deleteById(id) {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Clear old activity logs (older than N days)
  static async clearOld(days = 30) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);
      const cutoffDate = date.toISOString();
      
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .lt('timestamp', cutoffDate);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get activity statistics
  static async getStatistics() {
    try {
      const { count: total } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', today.toISOString());
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: thisWeekCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', weekAgo.toISOString());
      
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const { count: thisMonthCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', monthAgo.toISOString());

      return {
        total: total || 0,
        today: todayCount || 0,
        thisWeek: thisWeekCount || 0,
        thisMonth: thisMonthCount || 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Get activity logs with pagination
  static async findWithPagination(page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;

      return {
        logs: data || [],
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
}

module.exports = ActivityLog;
