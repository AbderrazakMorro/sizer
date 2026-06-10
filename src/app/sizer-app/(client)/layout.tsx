import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasRole } from "@/lib/roles";

export default async function ClientLayout({
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

  const isClient = await hasRole(supabase, user.id, "client");
  if (!isClient) {
    // If not a client, check if they are internal, else redirect
    redirect("/sizer-app/dashboard");
  }

  return <>{children}</>;
}
