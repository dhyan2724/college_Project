const { supabase } = require('../config/supabase');

class IssuedItem {
  // Create a new issued item
  static async create(issuedItemData) {
    try {
      const sanitize = v => v === undefined ? null : v;
      const {
        itemType,
        itemId,
        issuedToId,
        issuedByUserId,
        issuedByName,
        issuedByRole,
        issuedByRollNo,
        facultyInCharge,
        quantity,
        totalWeightIssued,
        purpose,
        notes,
        pendingRequestId
      } = issuedItemData;

      const { data, error } = await supabase
        .from('issued_items')
        .insert([{
          itemType: sanitize(itemType),
          itemId: sanitize(itemId),
          issuedToId: sanitize(issuedToId),
          issuedByUserId: sanitize(issuedByUserId),
          issuedByName: sanitize(issuedByName),
          issuedByRole: sanitize(issuedByRole),
          issuedByRollNo: sanitize(issuedByRollNo),
          facultyInCharge: sanitize(facultyInCharge),
          quantity: sanitize(quantity),
          totalWeightIssued: sanitize(totalWeightIssued),
          purpose: sanitize(purpose),
          notes: sanitize(notes),
          pendingRequestId: sanitize(pendingRequestId)
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, ...issuedItemData };
    } catch (error) {
      throw error;
    }
  }

  // Find issued item by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('issued_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all issued items
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('issued_items')
        .select('*')
        .order('issueDate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get issued items by user
  static async findByIssuedTo(issuedToId) {
    try {
      const { data, error } = await supabase
        .from('issued_items')
        .select('*')
        .eq('issuedToId', issuedToId)
        .order('issueDate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get issued items by item type
  static async findByItemType(itemType) {
    try {
      const { data, error } = await supabase
        .from('issued_items')
        .select('*')
        .eq('itemType', itemType)
        .order('issueDate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get issued items by status
  static async findByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('issued_items')
        .select('*')
        .eq('status', status)
        .order('issueDate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get active issued items (not returned)
  static async getActiveIssues() {
    try {
      const { data, error } = await supabase
        .from('issued_items')
        .select('*')
        .eq('status', 'issued')
        .order('issueDate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Update issued item
  static async updateById(id, updateData) {
    try {
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('issued_items')
        .update(cleanData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Return an item
  static async returnItem(id, returnDate) {
    try {
      const { data, error } = await supabase
        .from('issued_items')
        .update({ status: 'returned', returnDate })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete issued item
  static async deleteById(id) {
    try {
      const { error } = await supabase
        .from('issued_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Helper function to enrich with user details
  static async enrichWithUserDetails(item) {
    try {
      const [issuedToResult, issuedByResult] = await Promise.all([
        supabase.from('users').select('fullName, role, rollNo').eq('id', item.issuedToId).single(),
        supabase.from('users').select('fullName, role, rollNo').eq('id', item.issuedByUserId).single()
      ]);

      return {
        ...item,
        issuedToName: issuedToResult.data?.fullName || null,
        issuedToRole: issuedToResult.data?.role || null,
        issuedToRollNo: issuedToResult.data?.rollNo || null,
        issuedByName: issuedByResult.data?.fullName || item.issuedByName,
        issuedByRole: issuedByResult.data?.role || item.issuedByRole,
        issuedByRollNo: issuedByResult.data?.rollNo || item.issuedByRollNo
      };
    } catch (error) {
      return item;
    }
  }

  // Get issued items with user details
  static async findWithUserDetails() {
    try {
      const { data: items, error } = await supabase
        .from('issued_items')
        .select('*')
        .order('issueDate', { ascending: false });
      
      if (error) throw error;
      
      const enrichedItems = await Promise.all(
        (items || []).map(item => this.enrichWithUserDetails(item))
      );
      
      return enrichedItems;
    } catch (error) {
      throw error;
    }
  }

  // Get issued items by date range
  static async findByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('issued_items')
        .select('*')
        .gte('issueDate', startDate)
        .lte('issueDate', endDate)
        .order('issueDate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Get statistics
  static async getStatistics() {
    try {
      const { count: total } = await supabase
        .from('issued_items')
        .select('*', { count: 'exact', head: true });
      
      const { count: active } = await supabase
        .from('issued_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'issued');
      
      const { count: returned } = await supabase
        .from('issued_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'returned');

      return {
        total: total || 0,
        active: active || 0,
        returned: returned || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = IssuedItem;
