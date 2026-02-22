const { supabase } = require('../config/supabase');

class Slide {
  // Create a new slide
  static async create(slideData) {
    try {
      const { name, description, storagePlace, totalQuantity, availableQuantity, company } = slideData;
      
      // Generate slideId if not provided
      const slideId = slideData.slideId || `SLIDE-${Date.now()}`;
      
      // Set availableQuantity to totalQuantity if not specified
      const finalAvailableQuantity = availableQuantity !== undefined ? availableQuantity : totalQuantity;
      
      // Convert undefined values to null for MySQL
      const safeName = name !== undefined ? name : null;
      const safeDescription = description !== undefined ? description : null;
      const safeStoragePlace = storagePlace !== undefined ? storagePlace : null;
      const safeTotalQuantity = totalQuantity !== undefined ? totalQuantity : null;
      const safeCompany = company !== undefined ? company : null;
      
      const slideRecord = {
        name: safeName,
        description: safeDescription,
        storagePlace: safeStoragePlace,
        totalQuantity: safeTotalQuantity,
        availableQuantity: finalAvailableQuantity,
        company: safeCompany,
        slideId: slideId
      };
      
      const { data, error } = await supabase
        .from('slides')
        .insert([slideRecord])
        .select()
        .single();
      
      if (error) throw error;
      
      return { ...data, ...slideData, slideId, availableQuantity: finalAvailableQuantity };
    } catch (error) {
      throw error;
    }
  }

  // Find slide by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Find slide by slideId
  static async findBySlideId(slideId) {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('slideId', slideId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all slides
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Update slide
  static async updateById(id, updateData) {
    try {
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('slides')
        .update(cleanData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete slide
  static async deleteById(id) {
    try {
      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Search slides
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},slideId.ilike.${searchTerm},company.ilike.${searchTerm}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        // Fallback
        const [nameResults, descResults, idResults, companyResults] = await Promise.all([
          supabase.from('slides').select('*').ilike('name', searchTerm),
          supabase.from('slides').select('*').ilike('description', searchTerm),
          supabase.from('slides').select('*').ilike('slideId', searchTerm),
          supabase.from('slides').select('*').ilike('company', searchTerm)
        ]);
        const combined = [
          ...(nameResults.data || []),
          ...(descResults.data || []),
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

  // Get slides by storage place
  static async findByStoragePlace(storagePlace) {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('storagePlace', storagePlace)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Update available quantity
  static async updateAvailableQuantity(id, newAvailableQuantity) {
    try {
      const { data, error } = await supabase
        .from('slides')
        .update({ availableQuantity: newAvailableQuantity })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock slides (available quantity less than 10% of total quantity)
  static async getLowStock() {
    try {
      const { data: allSlides, error } = await supabase.from('slides').select('*');
      if (error) throw error;
      return (allSlides || []).filter(s => s.availableQuantity < (s.totalQuantity * 0.1))
        .sort((a, b) => a.availableQuantity - b.availableQuantity);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Slide;