"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { SpaceImagesDialog } from "@/components/dialogs/space-images-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import Link from "next/link";
import { appPath } from "@/lib/app-paths";
import { cn } from "@/lib/utils";


export default function PortfolioPage() {
  const t = useTranslations("Portfolio");
  const supabase = getSupabaseClient();
  const [projects, setProjects] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) {
        setError("No authenticated user");
        setLoading(false);
        return;
      }

      // Get client profile linked to this user
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();
      if (profileError) throw profileError;
      if (!profileData) {
        setError("Profile not found");
        setLoading(false);
        return;
      }

      // Get client record from clients table
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", profileData.id)
        .single();
      if (clientError) throw clientError;
      if (!clientData) {
        setError("Client record not found");
        setLoading(false);
        return;
      }
      const clientId = clientData.id;

      // Fetch completed projects for this client
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*, client:clients(full_name)")
        .eq("client_id", clientId)
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      if (projectsError) throw projectsError;

      // For each project, fetch its first space and then images
      const projectsWithSpaces = await Promise.all(
        projectsData.map(async (project: any) => {
          // Get first space for the project
          const { data: spacesData, error: spacesError } = await supabase
            .from("spaces")
            .select("id, name")
            .eq("project_id", project.id)
            .limit(1);
          if (spacesError) {
            console.warn(`Failed to fetch spaces for project ${project.id}:`, spacesError);
            return { ...project, space: null, images: [] };
          }
          const space = spacesData?.[0] || null;

          // Fetch images for that space
          let images = [];
          if (space) {
            const { data: imagesData, error: imagesError } = await supabase
              .from("space_images")
              .select("id, url, description")
              .eq("space_id", space.id);
            if (!imagesError) {
              images = imagesData || [];
            } else {
              console.warn(`Failed to fetch images for space ${space.id}:`, imagesError);
            }
          }

          return {
            ...project,
            space,
            images,
          };
        })
      );

      setProjects(projectsWithSpaces);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "An unknown error occurred");
      setLoading(false);
      toast.error(t("errorFetching", { message: err.message ?? "" }));
    }
  };

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setSelectedSpace(project.space);
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((_, i) => (
            <Card key={i} className="h-96">
              <CardHeader className="flex-1">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        <p>{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 btn btn-primary"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-6 text-center">
        <p>{t("noCompletedProjects")}</p>
        <Link href={appPath("/client/services")} className="mt-4 btn btn-primary">
          {t("createRequest")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href="#"
              className="group cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                handleProjectClick(project);
              }}
            >
              <Card className="h-96 hover:shadow-lg transition-shadow">
                <CardHeader className="flex-1">
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="text-muted-foreground mt-1 line-clamp-2">
                    {project.description}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  {project.space && (
                    <div className="text-sm text-muted-foreground">
                      <strong>{t("space")}:</strong> {project.space.name}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <strong>{t("status")}:</strong> {t(`status.${project.status}`)}
                  </div>
                  <div className="mt-2 flex items-center">
                    {project.images.length > 0 && (
                      <div className="flex space-x-1">
                        {project.images
                          .slice(0, 3)
                          .map((img: any, idx: number) => (
                            <img
                              key={img.id}
                              src={img.url}
                              alt={img.description}
                              className="h-8 w-8 object-cover rounded"
                              style={{ opacity: 0.8 }}
                              loading="lazy"
                            />
                          ))}
                        {project.images.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{project.images.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    {project.images.length} {t("images")}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <SpaceImagesDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        space={selectedSpace}
        projectId={selectedProject?.id ?? ""}
        canAddRenders={false}
      />
    </>
  );
}