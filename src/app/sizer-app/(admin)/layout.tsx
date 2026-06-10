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
    // If not admin, redirect to internal dashboard or client depending on role
    redirect("/sizer-app/dashboard");
  }

  return <>{children}</>;
}
