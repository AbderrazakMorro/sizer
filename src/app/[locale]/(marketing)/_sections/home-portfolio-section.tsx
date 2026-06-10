"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SpaceImagesDialog } from "@/components/dialogs/space-images-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { AnimatedSection } from "@/components/ui/animated-section";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { cn } from "@/lib/utils";

export function HomePortfolioSection() {
  const t = useTranslations("PortfolioSection");
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

      // Fetch completed projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*, client:clients(full_name)")
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
    // Only open dialog if project has a space
    if (project.space) {
      setSelectedProject(project);
      setSelectedSpace(project.space);
      setDialogOpen(true);
    } else {
      // Show a toast or handle the case where project has no space
      toast.error(t("noSpaceAvailable"));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <section id="portfolio" className="bg-muted/30 pt-20 pb-28">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection
            className="mx-auto mb-16 max-w-2xl text-center"
            triggerOnMount={false}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("sectionTitle")}{" "}
              <strong className="text-primary">
                {t("sectionTitleHighlight")}
              </strong>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {t("sectionSubtitle")}
            </p>
          </AnimatedSection>

          {/* Loading skeletons */}
          <StaggerContainer
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.1}
            triggerOnMount={false}
          >
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <StaggerItem key={i} className="h-full">
                <Card className="h-96">
                  <CardHeader className="flex-1">
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="portfolio" className="bg-muted/30 pt-20 pb-28">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection
            className="mx-auto mb-16 max-w-2xl text-center"
            triggerOnMount={false}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("sectionTitle")}{" "}
              <strong className="text-primary">
                {t("sectionTitleHighlight")}
              </strong>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {t("sectionSubtitle")}
            </p>
          </AnimatedSection>

          <div className="p-6 text-center text-destructive">
            <p>{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 btn btn-primary"
            >
              {t("retry")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section id="portfolio" className="bg-muted/30 pt-20 pb-28">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection
            className="mx-auto mb-16 max-w-2xl text-center"
            triggerOnMount={false}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("sectionTitle")}{" "}
              <strong className="text-primary">
                {t("sectionTitleHighlight")}
              </strong>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {t("sectionSubtitle")}
            </p>
          </AnimatedSection>

          <div className="p-6 text-center">
            <p>{t("noCompletedProjects")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="portfolio" className="bg-muted/30 pt-20 pb-28">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection
            className="mx-auto mb-16 max-w-2xl text-center"
            triggerOnMount={false}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("sectionTitle")}{" "}
              <strong className="text-primary">
                {t("sectionTitleHighlight")}
              </strong>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {t("sectionSubtitle")}
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.1}
            triggerOnMount={false}
          >
            {projects.map((project) => (
              <StaggerItem key={project.id} className="h-full">
                <Card
                  className="group/card flex h-full flex-col border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                  onClick={() => handleProjectClick(project)}
                >
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
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

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