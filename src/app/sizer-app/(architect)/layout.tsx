import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRoles } from "@/lib/roles";

export default async function ArchitectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const roles = await getUserRoles(supabase, user.id);
  const isInternal = roles.some((role) =>
    ["architect", "site_manager", "admin"].includes(role)
  );

  if (!isInternal) {
    // If not internal (e.g. they are just a client), redirect to client portal
    redirect("/sizer-app/portal");
  }

  return <>{children}</>;
}
