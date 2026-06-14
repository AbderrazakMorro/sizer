import { createClient } from "@/lib/supabase/server";
import { getClientProjects } from "@/lib/projects";
import { appPath } from "@/lib/app-paths";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function getProjectStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "En cours";
    case "completed":
      return "Terminé";
    case "cancelled":
      return "Annulé";
    default:
      return status;
  }
}

function getProjectStatusClasses(status: string) {
  switch (status) {
    case "active":
      return "bg-sky-500/10 text-sky-500 border border-sky-500/20";
    case "completed":
      return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    case "cancelled":
      return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
  }
}

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
        {projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-muted p-8 text-sm text-muted-foreground text-center">
            Vous n'avez aucun projet pour le moment.
            <br />
            <a href={appPath("/client/services")} className="mt-4 inline-block text-brand-golden hover:underline">
              Faire une demande de service
            </a>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col justify-between rounded-3xl border border-border bg-muted p-6 hover:border-brand-golden/50 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      {project.name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getProjectStatusClasses(
                        project.status
                      )}`}
                    >
                      {getProjectStatusLabel(project.status)}
                    </span>
                  </div>
                  {project.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {project.description}
                    </p>
                  )}
                </div>
                
                <div className="mt-6 flex flex-col gap-2 text-xs text-muted-foreground">
                  {project.phase && (
                    <div className="flex justify-between">
                      <span>Phase :</span>
                      <span className="font-medium text-foreground capitalize">{project.phase.replace("_", " ")}</span>
                    </div>
                  )}
                  {project.start_date && (
                    <div className="flex justify-between">
                      <span>Début :</span>
                      <span className="font-medium text-foreground">
                        {format(new Date(project.start_date), "dd MMM yyyy", { locale: fr })}
                      </span>
                    </div>
                  )}
                  {project.end_date && (
                    <div className="flex justify-between">
                      <span>Fin estimée :</span>
                      <span className="font-medium text-foreground">
                        {format(new Date(project.end_date), "dd MMM yyyy", { locale: fr })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
