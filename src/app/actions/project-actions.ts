"use server";

import { createClient } from "@/lib/supabase/server";

export interface ProjectForPrototype {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  // We could add a main image if we have that concept
  // For now, we'll keep it simple
}

/**
 * Fetch projects available as prototypes/references for service requests
 * Returns user's completed or active projects
 */
export async function fetchProjectsForPrototype(): Promise<{
  success: boolean;
  projects?: ProjectForPrototype[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // No projects for unauthenticated users
      return {
        success: true,
        projects: [],
      };
    }
    
    // Fetch user's projects that could serve as prototypes
    // Typically completed projects, but we can also include active ones
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, description, status, created_at")
      .eq("user_id", user.id)
      .in("status", ["active", "completed"])
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (error) {
      console.error("[fetchProjectsForPrototype] Error:", error);
      return {
        success: false,
        error: "Erreur lors de la récupération des projets",
      };
    }
    
    return {
      success: true,
      projects: data || [],
    };
  } catch (error) {
    console.error("[fetchProjectsForPrototype] Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

/**
 * Search projects by name or description
 */
export async function searchProjects(searchTerm: string): Promise<{
  success: boolean;
  projects?: ProjectForPrototype[];
  error?: string;
}> {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return {
        success: true,
        projects: [],
      };
    }
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: true,
        projects: [],
      };
    }
    
    const searchPattern = `%${searchTerm.trim()}%`;
    
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, description, status, created_at")
      .eq("user_id", user.id)
      .in("status", ["active", "completed"])
      .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .order("created_at", { ascending: false })
      .limit(20);
    
    if (error) {
      console.error("[searchProjects] Error:", error);
      return {
        success: false,
        error: "Erreur lors de la recherche",
      };
    }
    
    return {
      success: true,
      projects: data || [],
    };
  } catch (error) {
    console.error("[searchProjects] Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

/**
 * Get a single project by ID (for displaying selected prototype)
 */
export async function getProjectById(projectId: string): Promise<{
  success: boolean;
  project?: ProjectForPrototype;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: "Non authentifié",
      };
    }
    
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, description, status, created_at")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();
    
    if (error) {
      console.error("[getProjectById] Error:", error);
      return {
        success: false,
        error: "Projet non trouvé",
      };
    }
    
    return {
      success: true,
      project: data,
    };
  } catch (error) {
    console.error("[getProjectById] Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

/**
 * Allow a client to update limited fields (address, description) on one of
 * their own active projects. Ownership is verified server-side via the
 * service_requests table — the client must be the originating requester.
 */
export async function updateClientProject(
  projectId: string,
  fields: { address?: string; description?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    // Verify ownership: client must have a service request that was converted
    // to this project.
    const { data: sr, error: srError } = await supabase
      .from("service_requests")
      .select("id")
      .eq("converted_to_project_id", projectId)
      .eq("client_id", user.id)
      .limit(1)
      .single();

    if (srError || !sr) {
      return { success: false, error: "Projet introuvable ou accès refusé" };
    }

    // Only allow updating on active projects.
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("status")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return { success: false, error: "Projet introuvable" };
    }

    if (project.status !== "active") {
      return {
        success: false,
        error: "Seuls les projets actifs peuvent être modifiés",
      };
    }

    // Strict allowlist — never let the client touch status, phase, dates, etc.
    const safeUpdate: { address?: string; description?: string } = {};
    if (fields.address !== undefined) safeUpdate.address = fields.address;
    if (fields.description !== undefined)
      safeUpdate.description = fields.description;

    if (Object.keys(safeUpdate).length === 0) {
      return { success: true };
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update(safeUpdate)
      .eq("id", projectId);

    if (updateError) {
      console.error("[updateClientProject] Error:", updateError);
      return { success: false, error: "Erreur lors de la mise à jour" };
    }

    return { success: true };
  } catch (err) {
    console.error("[updateClientProject] Exception:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur inattendue",
    };
  }
}

// Made with Bob
