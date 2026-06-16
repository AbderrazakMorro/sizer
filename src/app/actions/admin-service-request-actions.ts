"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type {
  AdminServiceRequestView,
  ServiceRequest,
  ServiceRequestAssignment,
  ServiceRequestPriority,
} from "@/types";

/**
 * Get all service requests for admin dashboard
 */
export async function getAdminServiceRequests(): Promise<{
  success: boolean;
  data?: AdminServiceRequestView[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some((r) => r.role === "admin");
    if (!isAdmin) {
      return { success: false, error: "Accès non autorisé" };
    }

    // Fetch service requests from admin view
    const { data, error } = await supabase
      .from("admin_service_requests_view")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin service requests:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as AdminServiceRequestView[] };
  } catch (error) {
    console.error("getAdminServiceRequests error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

/**
 * Get a single service request with assignments
 */
export async function getServiceRequestDetails(requestId: string): Promise<{
  success: boolean;
  data?: {
    request: ServiceRequest;
    assignments: ServiceRequestAssignment[];
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some((r) => r.role === "admin");
    if (!isAdmin) {
      return { success: false, error: "Accès non autorisé" };
    }

    // Fetch service request with client profile information
    const adminSupabase = getAdminClient();
    
    const { data: request, error: requestError } = await adminSupabase
      .from("service_requests")
      .select(`
        *,
        client:profiles!service_requests_client_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq("id", requestId)
      .single();

    if (requestError) {
      return { success: false, error: requestError.message };
    }

    // Fetch assignments (using admin client to bypass profiles RLS for name/email)
    const { data: assignments, error: assignmentsError } = await adminSupabase
      .from("service_request_assignments")
      .select(
        `
        *,
        engineer:profiles!service_request_assignments_engineer_id_fkey(
          full_name,
          email
        )
      `
      )
      .eq("service_request_id", requestId);

    if (assignmentsError) {
      return { success: false, error: assignmentsError.message };
    }

    // Fetch associated products
    const { data: productLinks, error: productsError } = await supabase
      .from("service_request_products")
      .select(
        `
        product_id,
        products (
          id,
          name,
          description,
          image_url,
          cost_price,
          reference_code,
          category
        )
      `
      )
      .eq("service_request_id", requestId);

    if (productsError) {
      console.error("Error fetching products:", productsError);
    }

    // Transform products data
    const products = productLinks?.map((link: any) => link.products).filter(Boolean) || [];

    return {
      success: true,
      data: {
        request: { ...request, products } as ServiceRequest,
        assignments: assignments as ServiceRequestAssignment[],
      },
    };
  } catch (error) {
    console.error("getServiceRequestDetails error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

/**
 * Approve a service request
 */
export async function approveServiceRequest(
  requestId: string,
  adminNotes?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc("approve_service_request", {
      p_request_id: requestId,
      p_admin_notes: adminNotes || null,
    });

    if (error) {
      console.error("Error approving service request:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/sizer-app/admin/service-requests");
    return { success: true };
  } catch (error) {
    console.error("approveServiceRequest error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

/**
 * Reject a service request
 */
export async function rejectServiceRequest(
  requestId: string,
  rejectionReason: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc("reject_service_request", {
      p_request_id: requestId,
      p_rejection_reason: rejectionReason,
    });

    if (error) {
      console.error("Error rejecting service request:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/sizer-app/admin/service-requests");
    return { success: true };
  } catch (error) {
    console.error("rejectServiceRequest error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

/**
 * Assign engineers to a service request
 */
export async function assignEngineersToRequest(
  requestId: string,
  engineerIds: string[],
  leadEngineerId?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Verify admin session before calling SECURITY DEFINER RPC
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some((r) => r.role === "admin");
    if (!isAdmin) {
      return { success: false, error: "Accès non autorisé" };
    }

    // Only send the leadEngineerId if it is actually in the selected list
    const resolvedLeadId =
      leadEngineerId && engineerIds.includes(leadEngineerId)
        ? leadEngineerId
        : null;

    const { error } = await supabase.rpc("assign_engineers_to_request", {
      p_request_id: requestId,
      p_engineer_ids: engineerIds,
      p_lead_engineer_id: resolvedLeadId,
    });

    if (error) {
      console.error("Error assigning engineers:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/sizer-app/admin/service-requests");
    return { success: true };
  } catch (error) {
    console.error("assignEngineersToRequest error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

/**
 * Convert service request to project
 */
export async function convertRequestToProject(
  requestId: string,
  projectName?: string,
  projectDescription?: string
): Promise<{
  success: boolean;
  projectId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("convert_request_to_project", {
      p_request_id: requestId,
      p_project_name: projectName || null,
      p_project_description: projectDescription || null,
    });

    if (error) {
      console.error("Error converting request to project:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/sizer-app/admin/service-requests");
    revalidatePath("/sizer-app/projects");
    return { success: true, projectId: data };
  } catch (error) {
    console.error("convertRequestToProject error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

/**
 * Update service request priority and estimates
 */
export async function updateServiceRequestDetails(
  requestId: string,
  updates: {
    priority?: ServiceRequestPriority;
    estimated_budget?: number;
    estimated_duration_days?: number;
    admin_notes?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some((r) => r.role === "admin");
    if (!isAdmin) {
      return { success: false, error: "Accès non autorisé" };
    }

    const { error } = await supabase
      .from("service_requests")
      .update(updates)
      .eq("id", requestId);

    if (error) {
      console.error("Error updating service request:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/sizer-app/admin/service-requests");
    return { success: true };
  } catch (error) {
    console.error("updateServiceRequestDetails error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

/**
 * Get list of engineers for assignment
 */
export async function getAvailableEngineers(): Promise<{
  success: boolean;
  data?: Array<{ id: string; full_name: string; email: string }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some((r) => r.role === "admin");
    if (!isAdmin) {
      return { success: false, error: "Accès non autorisé" };
    }

    // Get users with architect roles
    const { data: engineerRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "architect");

    if (!engineerRoles || !Array.isArray(engineerRoles)) {
      return { success: true, data: [] };
    }

    if (rolesError) {
      console.error("getAvailableEngineers rolesError:", rolesError);
      return {
        success: false,
        error: (rolesError as any)?.message
          ? (rolesError as any).message
          : String(rolesError),
      };
    }

    const engineerIds = (engineerRoles ?? []).map((r) => r.user_id);

    if (engineerIds.length === 0) {
      return { success: true, data: [] };
    }

    const adminSupabase = getAdminClient();

    // Prefer using `profiles`
    const { data: profiles, error: profilesError } = await adminSupabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", engineerIds);

    if (profilesError) {
      console.warn(
        "getAvailableEngineers: profiles table query failed; returning ids only",
        profilesError
      );
      return {
        success: true,
        data: engineerIds.map((id) => ({ id, full_name: "", email: "" })),
      };
    }

    const profilesById = new Map<string, { full_name: string | null; email: string | null }>();
    for (const p of profiles ?? []) {
      profilesById.set(p.id, { full_name: p.full_name, email: p.email });
    }

    const data = engineerIds.map((id) => ({
      id,
      full_name: profilesById.get(id)?.full_name ?? "",
      email: profilesById.get(id)?.email ?? "",
    }));

    return { success: true, data };
  } catch (error) {
    console.error("getAvailableEngineers error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

/**
 * Get the architect display name from Supabase auth.users.display_name
 * - first finds architect user_ids from user_roles
 * - then loads those users from the Supabase auth admin API
 */
export async function getArchitectDisplayName(): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some((r) => r.role === "admin");
    if (!isAdmin) {
      return { success: false, error: "Accès non autorisé" };
    }

    // Find architect ids
    const { data: architectRoles, error: architectRolesError } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "architect");

    if (architectRolesError) {
      return {
        success: false,
        error: (architectRolesError as any)?.message
          ? (architectRolesError as any).message
          : String(architectRolesError),
      };
    }

    const architectUserIds = (architectRoles ?? []).map((r) => r.user_id);
    if (architectUserIds.length === 0) {
      return { success: true, data: "" };
    }

    const adminSupabase = getAdminClient();

    const { data: usersData, error: usersError } = await adminSupabase.auth.admin.listUsers();

    if (usersError) {
      return {
        success: false,
        error: usersError.message || String(usersError),
      };
    }

    const users = usersData?.users ?? [];
    const architectUser = users.find((u: any) =>
      architectUserIds.includes(u.id)
    );

    const displayName =
      (architectUser?.user_metadata?.full_name as string) ??
      (architectUser?.user_metadata?.display_name as string) ??
      "";
    return { success: true, data: displayName };
  } catch (error) {
    console.error("getArchitectDisplayName error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

// Made with Bob

