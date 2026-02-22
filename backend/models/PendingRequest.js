const { supabase } = require('../config/supabase');

class PendingRequest {
  // Create a new pending request
  static async create(pendingRequestData) {
    try {
      const {
        facultyInChargeId,
        requestedByUserId,
        requestedByName,
        requestedByRole,
        requestedByRollNo,
        requestedByCollegeEmail,
        purpose,
        desiredIssueTime,
        desiredReturnTime,
        notes
      } = pendingRequestData;

      const { data, error } = await supabase
        .from('pending_requests')
        .insert([{
          facultyInChargeId,
          requestedByUserId,
          requestedByName,
          requestedByRole,
          requestedByRollNo,
          requestedByCollegeEmail,
          purpose,
          desiredIssueTime,
          desiredReturnTime,
          notes
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, ...pendingRequestData };
    } catch (error) {
      throw error;
    }
  }

  // Add items to a pending request
  static async addItems(requestId, items) {
    try {
      const itemsToInsert = items.map(item => ({
        pendingRequestId: requestId,
        itemType: item.itemType,
        itemId: item.itemId,
        quantity: item.quantity === undefined ? null : item.quantity,
        totalWeightRequested: item.totalWeightRequested === undefined ? null : item.totalWeightRequested
      }));

      const { error } = await supabase
        .from('pending_request_items')
        .insert(itemsToInsert);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Helper function to enrich request with user details
  static async enrichWithUserDetails(request) {
    try {
      const [facultyResult, userResult] = await Promise.all([
        supabase.from('users').select('fullName, role').eq('id', request.facultyInChargeId).single(),
        supabase.from('users').select('fullName, role, rollNo').eq('id', request.requestedByUserId).single()
      ]);

      return {
        ...request,
        facultyInChargeName: facultyResult.data?.fullName || null,
        facultyInChargeRole: facultyResult.data?.role || null,
        requestedByName: userResult.data?.fullName || request.requestedByName,
        requestedByRole: userResult.data?.role || request.requestedByRole,
        requestedByRollNo: userResult.data?.rollNo || request.requestedByRollNo
      };
    } catch (error) {
      return request;
    }
  }

  // Find pending request by ID
  static async findById(id) {
    try {
      const { data: request, error } = await supabase
        .from('pending_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (!request) return null;

      // Get items
      const { data: items } = await supabase
        .from('pending_request_items')
        .select('*')
        .eq('pendingRequestId', id);
      
      const enrichedRequest = await this.enrichWithUserDetails(request);
      enrichedRequest.items = items || [];
      
      return enrichedRequest;
    } catch (error) {
      throw error;
    }
  }

  // Get all pending requests
  static async findAll() {
    try {
      const { data: requests, error } = await supabase
        .from('pending_requests')
        .select('*')
        .order('requestDate', { ascending: false });
      
      if (error) throw error;
      
      // Enrich with user details and items
      const enrichedRequests = await Promise.all(
        (requests || []).map(async (request) => {
          const { data: items } = await supabase
            .from('pending_request_items')
            .select('*')
            .eq('pendingRequestId', request.id);
          
          const enriched = await this.enrichWithUserDetails(request);
          enriched.items = items || [];
          return enriched;
        })
      );
      
      return enrichedRequests;
    } catch (error) {
      throw error;
    }
  }

  // Get pending requests by status
  static async findByStatus(status) {
    try {
      const { data: requests, error } = await supabase
        .from('pending_requests')
        .select('*')
        .eq('status', status)
        .order('requestDate', { ascending: false });
      
      if (error) throw error;
      
      const enrichedRequests = await Promise.all(
        (requests || []).map(async (request) => {
          const { data: items } = await supabase
            .from('pending_request_items')
            .select('*')
            .eq('pendingRequestId', request.id);
          
          const enriched = await this.enrichWithUserDetails(request);
          enriched.items = items || [];
          return enriched;
        })
      );
      
      return enrichedRequests;
    } catch (error) {
      throw error;
    }
  }

  // Get pending requests by faculty in charge
  static async findByFacultyInCharge(facultyInChargeId) {
    try {
      const { data: requests, error } = await supabase
        .from('pending_requests')
        .select('*')
        .eq('facultyInChargeId', facultyInChargeId)
        .order('requestDate', { ascending: false });
      
      if (error) throw error;
      
      const enrichedRequests = await Promise.all(
        (requests || []).map(async (request) => {
          const { data: items } = await supabase
            .from('pending_request_items')
            .select('*')
            .eq('pendingRequestId', request.id);
          
          const enriched = await this.enrichWithUserDetails(request);
          enriched.items = items || [];
          return enriched;
        })
      );
      
      return enrichedRequests;
    } catch (error) {
      throw error;
    }
  }

  // Get pending requests by requested by user
  static async findByRequestedByUser(requestedByUserId) {
    try {
      const { data: requests, error } = await supabase
        .from('pending_requests')
        .select('*')
        .eq('requestedByUserId', requestedByUserId)
        .order('requestDate', { ascending: false });
      
      if (error) throw error;
      
      const enrichedRequests = await Promise.all(
        (requests || []).map(async (request) => {
          const { data: items } = await supabase
            .from('pending_request_items')
            .select('*')
            .eq('pendingRequestId', request.id);
          
          const enriched = await this.enrichWithUserDetails(request);
          enriched.items = items || [];
          return enriched;
        })
      );
      
      return enrichedRequests;
    } catch (error) {
      throw error;
    }
  }

  // Update pending request
  static async updateById(id, updateData) {
    try {
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('pending_requests')
        .update(cleanData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update status
  static async updateStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from('pending_requests')
        .update({ status })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete pending request
  static async deleteById(id) {
    try {
      // Delete items first (CASCADE should handle this, but being explicit)
      await supabase
        .from('pending_request_items')
        .delete()
        .eq('pendingRequestId', id);
      
      // Delete the request
      const { error } = await supabase
        .from('pending_requests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get pending requests with user details (alias for findAll)
  static async findWithUserDetails() {
    return this.findAll();
  }

  // Get statistics
  static async getStatistics() {
    try {
      const { count: total } = await supabase
        .from('pending_requests')
        .select('*', { count: 'exact', head: true });
      
      const { count: pending } = await supabase
        .from('pending_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      const { count: approved } = await supabase
        .from('pending_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');
      
      const { count: rejected } = await supabase
        .from('pending_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');

      return {
        total: total || 0,
        pending: pending || 0,
        approved: approved || 0,
        rejected: rejected || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PendingRequest;
