import { createClient } from "@/lib/supabase/server";
import { getClientProjects } from "@/lib/projects";
import { ClientProjectsView } from "./client-projects-view";

export default async function ClientProjectsPage() {
  const supabase = await createClient();
  const projects = await getClientProjects(supabase);

  return (
    <div className="space-y-10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-foreground">Mes projets</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Retrouvez ici tous vos projets en cours ou terminés.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm transition">
        <ClientProjectsView initialProjects={projects} />
      </div>
    </div>
  );
}
