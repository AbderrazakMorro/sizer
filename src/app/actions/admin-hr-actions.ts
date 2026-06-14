"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { hasRole } from "@/lib/roles";
import type { UserRole } from "@/types";


export type AdminHrUserRow = {
  id: string;
  email: string;
  full_name?: string | null;
  is_suspended?: boolean;
  roles: UserRole[];
};

function mapToUserWithRoles(user: any, profilesRow: any, roles: UserRole[]): AdminHrUserRow {
  return {
    id: user?.id,
    email: user?.email,
    full_name: profilesRow?.full_name ?? null,
    is_suspended: user?.user_metadata?.is_suspended ?? false,
    roles,
  };
}

export async function getAdminHrUsers(): Promise<{
  success: boolean;
  data?: AdminHrUserRow[];
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

    const isAdmin = await hasRole(supabase, user.id, "admin");
    if (!isAdmin) {
      return {
        success: false,
        error: JSON.stringify({ roles: "unknown", hasAdmin: false }),
      };
    }

    const adminClient = getAdminClient();

    // List users from auth
    const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();
    if (usersError) {
      return { success: false, error: usersError.message };
    }

    const users = usersData?.users ?? [];
    if (users.length === 0) return { success: true, data: [] };

    const userIds = users.map((u: any) => u.id);

    // Fetch profiles
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    if (profilesError) {
      return { success: false, error: profilesError.message };
    }

    const profilesById = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    // Fetch roles for users
    const { data: roleRows, error: roleError } = await adminClient
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", userIds);

    if (roleError) {
      return { success: false, error: roleError.message };
    }

    const rolesByUserId = new Map<string, UserRole[]>();
    for (const r of roleRows ?? []) {
      const arr = rolesByUserId.get(r.user_id) ?? [];
      arr.push(r.role as UserRole);
      rolesByUserId.set(r.user_id, arr);
    }

    const mapped: AdminHrUserRow[] = users.map((u: any) =>
      mapToUserWithRoles(u, profilesById.get(u.id), rolesByUserId.get(u.id) ?? ["client"])
    );

    return { success: true, data: mapped };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur inattendue",
    };
  }
}

export async function assignRolesToUser(input: {
  userId: string;
  roles: UserRole[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Non authentifié" };

    const isAdmin = await hasRole(supabase, user.id, "admin");
    if (!isAdmin) return { success: false, error: "Accès non autorisé" };

    const adminClient = getAdminClient();

    // Replace roles: delete then insert
    const { error: deleteError } = await adminClient
      .from("user_roles")
      .delete()
      .eq("user_id", input.userId);

    if (deleteError) return { success: false, error: deleteError.message };

    const payload = input.roles.map((role) => ({ user_id: input.userId, role }));

    const { error: insertError } = await adminClient.from("user_roles").insert(payload);
    if (insertError) return { success: false, error: insertError.message };

    revalidatePath("/sizer-app/admin/hr");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erreur inattendue" };
  }
}

export async function suspendOrResumeUser(input: {
  userId: string;
  suspend: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Non authentifié" };

    const isAdmin = await hasRole(supabase, user.id, "admin");
    if (!isAdmin) return { success: false, error: "Accès non autorisé" };

    const adminClient = getAdminClient();

    // Disable/enable user.
    // The GoTrue admin typings vary across supabase-js versions, so use (as any) here.
    const adminApi = adminClient.auth.admin as any;
    const updateFn =
      adminApi.updateUserById || adminApi.updateUser || adminApi.updateUserByID;

    if (typeof updateFn !== "function") {
      return {
        success: false,
        error:
          "Supabase admin API does not expose a supported user update method (disable/enable).",
      };
    }

    const { error } = await updateFn.call(adminApi, input.userId, {
      disabled: input.suspend,
    });


    if (error) return { success: false, error: error.message };

    revalidatePath("/sizer-app/admin/hr");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erreur inattendue" };
  }
}

