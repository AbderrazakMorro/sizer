import { Suspense } from "react";
import { getAdminClients } from "@/app/actions/admin-client-actions";
import { ClientsTable } from "@/components/admin/clients-table";
import { PageLoading } from "@/components/loaders/page-loading";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const metadata = {
  title: "Clients | Admin",
  description: "Gestion de la liste complète des clients (bypass RLS)",
};

async function ClientsPageContent() {
  const result = await getAdminClients();

  if (!result.success || !result.data) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Erreur
          </CardTitle>
          <CardDescription>
            {result.error || "Impossible de charger les clients"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ClientsTable clients={result.data} />;
}

export default function AdminClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground mt-2">
          Liste complète des clients visible par l&apos;administration
          (utilise le client Supabase admin pour contourner l&apos;RLS).
        </p>
      </div>

      <Suspense fallback={<PageLoading />}>
        <ClientsPageContent />
      </Suspense>
    </div>
  );
}

