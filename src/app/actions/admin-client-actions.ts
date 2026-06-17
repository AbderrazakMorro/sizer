"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
type AdminClientRow = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at?: string | null;
};


export async function getAdminClients(): Promise<{
  success: boolean;
  data?: AdminClientRow[];
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

    // Admin role check via user_roles table
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (rolesError) {
      return {
        success: false,
        error: `Impossible de lire les rôles: ${rolesError.message}`,
      };
    }

    const isAdmin = (roles ?? []).some((r: any) => String(r.role).toLowerCase() === "admin");
    if (!isAdmin) {
      return { success: false, error: "Accès non autorisé (admin requis)" };
    }

    // Use service-role admin client to bypass RLS and return full list.
    const adminSupabase = getAdminClient();

    // Note: some deployments may not have created_at / nullable fields.
    // We still request them, but we don't let ordering/shape break the list.
    const { data, error } = await adminSupabase
      .from("clients")
      .select("id, full_name, email, phone, created_at");

    // If ordering is supported, apply it in-memory after fetch.
    const rows = (data ?? []) as AdminClientRow[];

    rows.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });


    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data ?? []) as unknown as AdminClientRow[],
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur inattendue",
    };
  }
}

