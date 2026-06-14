"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, FolderOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { fetchProjectsForPrototype, getProjectById, type ProjectForPrototype } from "@/app/actions/project-actions";
import { cn } from "@/lib/utils";

interface PrototypeProjectSelectorProps {
  selectedProjectId?: string;
  onProjectSelect: (projectId: string | undefined) => void;
}

export function PrototypeProjectSelector({
  selectedProjectId,
  onProjectSelect,
}: PrototypeProjectSelectorProps) {
  const [projects, setProjects] = useState<ProjectForPrototype[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectForPrototype | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load projects
  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setError(null);
      const result = await fetchProjectsForPrototype();
      
      if (result.success && result.projects) {
        setProjects(result.projects);
      } else {
        setError(result.error || "Erreur lors du chargement des projets");
      }
      setLoading(false);
    }
    
    loadProjects();
  }, []);

  // Load selected project details
  useEffect(() => {
    if (!selectedProjectId) {
      setSelectedProject(null);
      return;
    }

    async function loadSelectedProject() {
      if (selectedProjectId) {
        const result = await getProjectById(selectedProjectId);
        if (result.success && result.project) {
          setSelectedProject(result.project);
        }
      }
    }

    loadSelectedProject();
  }, [selectedProjectId]);

  const handleSelect = (projectId: string) => {
    if (projectId === selectedProjectId) {
      // Deselect
      onProjectSelect(undefined);
      setSelectedProject(null);
    } else {
      // Select
      onProjectSelect(projectId);
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setSelectedProject(project);
      }
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProjectSelect(undefined);
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span>Chargement des projets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
        {error}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-md bg-muted text-muted-foreground text-sm">
        <FolderOpen className="h-4 w-4" />
        <span>Aucun projet disponible comme prototype</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[2.5rem]"
          >
            {selectedProject ? (
              <div className="flex items-center gap-2 flex-1 text-left">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{selectedProject.name}</div>
                  {selectedProject.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {selectedProject.description}
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className="ml-2 shrink-0">
                  {selectedProject.status === "completed" ? "Terminé" : "Actif"}
                </Badge>
              </div>
            ) : (
              <span className="text-muted-foreground">Sélectionnez un projet de référence...</span>
            )}
            <div className="flex items-center gap-1 ml-2 shrink-0">
              {selectedProject && (
                <X
                  className="h-4 w-4 opacity-50 hover:opacity-100"
                  onClick={handleClear}
                />
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="max-h-[300px] overflow-y-auto">
            {projects.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Aucun projet disponible
              </div>
            ) : (
              <div className="p-1">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelect(project.id)}
                    className={cn(
                      "w-full flex items-start gap-2 p-3 rounded-md text-left transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      selectedProjectId === project.id && "bg-accent"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 mt-0.5 shrink-0",
                        selectedProjectId === project.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="font-medium text-sm">{project.name}</div>
                      {project.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {project.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {project.status === "completed" ? "Terminé" : "Actif"}
                        </Badge>
                        <span>
                          {new Date(project.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selectedProject && (
        <div className="text-xs text-muted-foreground">
          Ce projet servira de référence pour votre demande
        </div>
      )}
    </div>
  );
}

// Made with Bob
