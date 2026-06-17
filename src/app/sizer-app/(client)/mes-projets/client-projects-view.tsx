"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pencil } from "lucide-react";
import { appPath } from "@/lib/app-paths";
import { Button } from "@/components/ui/button";
import { ClientProjectEditDialog } from "@/components/dialogs/client-project-edit-dialog";
import type { Project } from "@/types";

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

interface ClientProjectsViewProps {
  initialProjects: Project[];
}

export function ClientProjectsView({
  initialProjects,
}: ClientProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleEditSuccess = (updated: Partial<Project>) => {
    if (!editingProject) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === editingProject.id ? { ...p, ...updated } : p
      )
    );
    setEditingProject(null);
  };

  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted p-8 text-sm text-muted-foreground text-center">
        Vous n&apos;avez aucun projet pour le moment.
        <br />
        <a
          href={appPath("/client/services")}
          className="mt-4 inline-block text-brand-golden hover:underline"
        >
          Faire une demande de service
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const isActive = project.status === "active";
          return (
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
                {project.address && (
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    {project.address}
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-2 text-xs text-muted-foreground">
                {project.phase && (
                  <div className="flex justify-between">
                    <span>Phase :</span>
                    <span className="font-medium text-foreground capitalize">
                      {project.phase.replace("_", " ")}
                    </span>
                  </div>
                )}
                {project.start_date && (
                  <div className="flex justify-between">
                    <span>Début :</span>
                    <span className="font-medium text-foreground">
                      {format(new Date(project.start_date), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                )}
                {project.end_date && (
                  <div className="flex justify-between">
                    <span>Fin estimée :</span>
                    <span className="font-medium text-foreground">
                      {format(new Date(project.end_date), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                )}

                {/* Edit button — only for active projects */}
                {isActive && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingProject(project)}
                      aria-label={`Modifier le projet ${project.name}`}
                      id={`edit-project-${project.id}`}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Modifier
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingProject && (
        <ClientProjectEditDialog
          open={!!editingProject}
          onOpenChange={(open) => {
            if (!open) setEditingProject(null);
          }}
          project={editingProject}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
