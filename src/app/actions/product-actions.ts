"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

export interface ProductForSelection {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  cost_price?: number;
  reference_code?: string;
  category?: string;
}

/**
 * Fetch products available for selection in service requests
 * Returns ALL products from the agency's catalog (not filtered by user)
 * Uses admin client to bypass RLS restrictions
 */
export async function fetchProductsForSelection(): Promise<{
  success: boolean;
  products?: ProductForSelection[];
  error?: string;
}> {
  try {
    // Use admin client to bypass RLS and fetch all products
    const adminSupabase = getAdminClient();
    
    // Fetch ALL products from the catalog
    const { data, error, count } = await adminSupabase
      .from("products")
      .select("id, name, description, image_url, cost_price, reference_code, category", { count: 'exact' })
      .order("name")
      .limit(100);
    
    console.log("[fetchProductsForSelection] Query result:", {
      dataLength: data?.length,
      count,
      error,
      sampleProduct: data?.[0]
    });
    
    if (error) {
      console.error("[fetchProductsForSelection] Error:", error);
      return {
        success: false,
        error: `Erreur lors de la récupération des produits: ${error.message}`,
      };
    }
    
    if (!data || data.length === 0) {
      console.warn("[fetchProductsForSelection] No products found in database");
      return {
        success: true,
        products: [],
      };
    }
    
    return {
      success: true,
      products: data || [],
    };
  } catch (error) {
    console.error("[fetchProductsForSelection] Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

/**
 * Search products by name or description
 * Searches across ALL products in the catalog
 * Uses admin client to bypass RLS restrictions
 */
export async function searchProducts(searchTerm: string): Promise<{
  success: boolean;
  products?: ProductForSelection[];
  error?: string;
}> {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return {
        success: true,
        products: [],
      };
    }
    
    // Use admin client to bypass RLS
    const adminSupabase = getAdminClient();
    const searchPattern = `%${searchTerm.trim()}%`;
    
    // Search ALL products in the catalog
    const { data, error } = await adminSupabase
      .from("products")
      .select("id, name, description, image_url, cost_price, reference_code, category")
      .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .order("name")
      .limit(50);
    
    if (error) {
      console.error("[searchProducts] Error:", error);
      return {
        success: false,
        error: "Erreur lors de la recherche",
      };
    }
    
    return {
      success: true,
      products: data || [],
    };
  } catch (error) {
    console.error("[searchProducts] Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

// Made with Bob
