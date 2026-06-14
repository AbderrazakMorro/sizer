import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasRole } from "@/lib/roles";

export default async function AdminLayout({
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

  const isAdmin = await hasRole(supabase, user.id, "admin");
  if (!isAdmin) {
    // Keep behavior but avoid any ambiguous “User not allowed” output paths
    // by ensuring the redirect always happens from the server layout.
    redirect("/sizer-app/dashboard");
  }

  return <>{children}</>;
}
