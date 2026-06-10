import { type UserRole } from "@/types";

/**
 * Fetches all roles assigned to a given user
 */
export async function getUserRoles(
  supabase: any,
  userId: string
): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }

  return (data || []).map((row: any) => row.role as UserRole);
}

/**
 * Checks if a user has a specific role
 */
export async function hasRole(
  supabase: any,
  userId: string,
  role: UserRole
): Promise<boolean> {
  const roles = await getUserRoles(supabase, userId);
  return roles.includes(role);
}

/**
 * Ensures the logged in user has the required role, otherwise throws an error
 */
export async function requireRole(
  supabase: any,
  role: UserRole
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: No session found");
  }

  const isAuthorized = await hasRole(supabase, user.id, role);
  if (!isAuthorized) {
    throw new Error(`Forbidden: Required role '${role}' missing`);
  }

  return user.id;
}
