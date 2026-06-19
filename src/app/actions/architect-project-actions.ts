"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Project } from "@/types";

/**
 * Get projects assigned to the current architect
 */
export async function getArchitectProjects(): Promise<{
  success: boolean;
  data?: Project[];
  error?: string;
  debug?: any;
}> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    console.log("🔍 Getting projects for architect:", user.id);

    // Step 1: Get assignments for this architect
    const { data: assignments, error: assignmentsError } = await supabase
      .from("service_request_assignments")
      .select("service_request_id, role")
      .eq("engineer_id", user.id);

    console.log("📋 Assignments:", { assignments, error: assignmentsError });

    if (assignmentsError) {
      return {
        success: false,
        error: `Erreur assignments: ${assignmentsError.message}`,
        debug: { step: "assignments", error: assignmentsError },
      };
    }

    if (!assignments || assignments.length === 0) {
      return {
        success: true,
        data: [],
        debug: { step: "assignments", message: "No assignments found" },
      };
    }

    const serviceRequestIds = assignments.map((a) => a.service_request_id);
    console.log("📝 Service Request IDs:", serviceRequestIds);

    // Step 2: Get service requests with converted project IDs
    // Use admin client to bypass RLS since the architect should see their assigned requests
    const adminSupabase = getAdminClient();
    const { data: allServiceRequests, error: allSrError } = await adminSupabase
      .from("service_requests")
      .select("id, converted_to_project_id, title, status")
      .in("id", serviceRequestIds);

    console.log("📄 Service Requests for assignments:", {
      allServiceRequests,
      error: allSrError,
    });

    if (allSrError) {
      return {
        success: false,
        error: `Erreur service requests: ${allSrError.message}`,
        debug: { step: "service_requests_all", error: allSrError },
      };
    }

    if (!allServiceRequests || allServiceRequests.length === 0) {
      return {
        success: true,
        data: [],
        debug: {
          step: "service_requests_filtered",
          message: "No service requests found for assignments",
          serviceRequestIds,
        },
      };
    }

    // Filter only converted ones
    const convertedRequests = allServiceRequests.filter(
      (sr) => sr.converted_to_project_id !== null
    );

    console.log("🔄 Converted requests:", convertedRequests);

    if (convertedRequests.length === 0) {
      return {
        success: true,
        data: [],
        debug: {
          step: "converted_filter",
          message: "No converted projects yet",
        },
      };
    }

    const projectIds = convertedRequests
      .map((sr) => sr.converted_to_project_id)
      .filter(Boolean) as string[];

    console.log("🎯 Project IDs:", projectIds);

    // Step 3: Get projects (use admin client to bypass RLS)
    const { data: projects, error: projectsError } = await adminSupabase
      .from("projects")
      .select("*, client:clients(full_name)")
      .in("id", projectIds);

    console.log("🏗️ Projects:", { projects, error: projectsError });

    if (projectsError) {
      return {
        success: false,
        error: `Erreur projects: ${projectsError.message}`,
        debug: { step: "projects", error: projectsError },
      };
    }

    return {
      success: true,
      data: projects as Project[],
      debug: {
        step: "complete",
        assignmentsCount: assignments.length,
        serviceRequestsCount: allServiceRequests.length,
        convertedCount: convertedRequests.length,
        projectsCount: projects?.length || 0,
      },
    };
  } catch (error) {
    console.error("getArchitectProjects error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
      debug: { step: "catch", error },
    };
  }
}

/**
 * Get a single project detail for architect (if they have access via assignment)
 */
export async function getArchitectProjectDetail(projectId: string): Promise<{
  success: boolean;
  data?: Project;
  error?: string;
}> {
  try {
    const supabase = await createClient();


    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    console.log("🔍 Getting project detail for architect:", user.id, "project:", projectId);

    // Check if architect has access to this project via service request assignment
    const { data: assignments, error: assignmentsError } = await supabase
      .from("service_request_assignments")
      .select("service_request_id")
      .eq("engineer_id", user.id);

    if (assignmentsError || !assignments || assignments.length === 0) {
      return { success: false, error: "Accès non autorisé" };
    }

    const serviceRequestIds = assignments.map((a) => a.service_request_id);

    // Check if any of these service requests were converted to this project
    const adminSupabase = getAdminClient();
    const { data: serviceRequest, error: srError } = await adminSupabase
      .from("service_requests")
      .select("id, converted_to_project_id")
      .in("id", serviceRequestIds)
      .eq("converted_to_project_id", projectId)
      .single();

    if (srError || !serviceRequest) {
      return { success: false, error: "Projet introuvable ou accès non autorisé" };
    }

    // Get the project details
    const { data: project, error: projectError } = await adminSupabase
      .from("projects")
      .select("*, client:clients(full_name)")
      .eq("id", projectId)
      .single();

    if (projectError) {
      return { success: false, error: projectError.message };
    }

    return { success: true, data: project as Project };
  } catch (error) {
    console.error("getArchitectProjectDetail error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

export async function getArchitectClients(): Promise<{
  success: boolean;
  data?: { id: string; full_name?: string | null }[];
  error?: string;
  debug?: any;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    console.log("🔍 getArchitectClients: start", { engineerId: user.id });

    const { data: assignments, error: assignmentsError } = await supabase
      .from("service_request_assignments")
      .select("service_request_id")
      .eq("engineer_id", user.id);

    console.log("📋 getArchitectClients: assignments", {
      error: assignmentsError?.message,
      count: assignments?.length ?? 0,
    });

    if (assignmentsError) {
      return {
        success: false,
        error: `Erreur assignments: ${assignmentsError.message}`,
        debug: { step: "assignments", error: assignmentsError },
      };
    }

    if (!assignments || assignments.length === 0) {
      return { success: true, data: [], debug: { step: "assignments", engineerId: user.id } };
    }

    const serviceRequestIds = assignments.map((a) => a.service_request_id);
    console.log("📝 getArchitectClients: serviceRequestIds", {
      count: serviceRequestIds.length,
      sample: serviceRequestIds.slice(0, 5),
    });

    const adminSupabase = getAdminClient();

    const { data: allServiceRequests, error: allSrError } = await adminSupabase
      .from("service_requests")
      .select("id, converted_to_project_id")
      .in("id", serviceRequestIds);

    console.log("📄 getArchitectClients: allServiceRequests", {
      error: allSrError?.message,
      count: allServiceRequests?.length ?? 0,
    });

    if (allSrError) {
      return {
        success: false,
        error: `Erreur service requests: ${allSrError.message}`,
        debug: { step: "service_requests_all", error: allSrError },
      };
    }

    if (!allServiceRequests || allServiceRequests.length === 0) {
      return {
        success: true,
        data: [],
        debug: { step: "service_requests_filtered", serviceRequestIds },
      };
    }

    const convertedRequests = allServiceRequests.filter(
      (sr) => sr.converted_to_project_id !== null
    );

    const projectIds = convertedRequests
      .map((sr) => sr.converted_to_project_id)
      .filter(Boolean) as string[];

    console.log("🔄 getArchitectClients: convertedRequests", {
      totalServiceRequests: allServiceRequests.length,
      convertedCount: convertedRequests.length,
      projectIdsCount: projectIds.length,
      projectIdSample: projectIds.slice(0, 5),
    });

    if (projectIds.length === 0) {
      return {
        success: true,
        data: [],
        debug: {
          step: "converted_filter",
          message: "No converted projects yet",
          totalServiceRequests: allServiceRequests.length,
        },
      };
    }

    // Fetch projects with client join, then unique clients.
    const { data: projects, error: projectsError } = await adminSupabase
      .from("projects")
      .select("client_id, client:clients(full_name)")
      .in("id", projectIds);

    console.log("🏗️ getArchitectClients: projects", {
      error: projectsError?.message,
      count: projects?.length ?? 0,
    });

    if (projectsError) {
      return {
        success: false,
        error: `Erreur projects: ${projectsError.message}`,
        debug: { step: "projects", error: projectsError },
      };
    }

    const projectsWithClientId = (projects ?? []).filter((p: any) => !!p.client_id);
    console.log("👤 getArchitectClients: projectsWithClientId", {
      withClientIdCount: projectsWithClientId.length,
      withoutClientIdCount: (projects?.length ?? 0) - projectsWithClientId.length,
    });

    const clientMap = new Map<string, { id: string; full_name?: string | null }>();

    (projects ?? []).forEach((p: any) => {
      const id = p.client_id as string | null | undefined;
      if (!id) return;
      clientMap.set(id, {
        id,
        full_name: p.client?.full_name ?? null,
      });
    });

    console.log("✅ getArchitectClients: complete", {
      clientsCount: clientMap.size,
      clientIdsSample: Array.from(clientMap.keys()).slice(0, 5),
    });

    return {
      success: true,
      data: Array.from(clientMap.values()),
      debug: {
        step: "complete",
        assignmentsCount: assignments.length,
        serviceRequestsCount: allServiceRequests.length,
        convertedProjectsCount: projectIds.length,
        projectsReturnedCount: projects?.length ?? 0,
        projectsWithClientIdCount: projectsWithClientId.length,
        clientsCount: clientMap.size,
      },
    };
  } catch (error) {
    console.error("getArchitectClients error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
      debug: { step: "catch", error },
    };
  }
}

// Made with Bob

