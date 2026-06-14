import type { Project } from "@/types";

export async function getClientProjects(
  supabase: any
): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(`*`)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as Project[];
}
