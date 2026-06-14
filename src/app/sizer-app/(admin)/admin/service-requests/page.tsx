import { Suspense } from "react";
import { getAdminServiceRequests } from "@/app/actions/admin-service-request-actions";
import { ServiceRequestsTable } from "@/components/admin/service-requests-table";
import { PageLoading } from "@/components/loaders/page-loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const metadata = {
  title: "Demandes de Service | Admin",
  description: "Gérer les demandes de service des clients",
};

async function ServiceRequestsContent() {
  const result = await getAdminServiceRequests();

  if (!result.success || !result.data) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Erreur
          </CardTitle>
          <CardDescription>
            {result.error || "Impossible de charger les demandes de service"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ServiceRequestsTable requests={result.data} />;
}

export default function AdminServiceRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Demandes de Service</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les demandes de service, approuvez-les et assignez-les aux architectes
        </p>
      </div>

      <Suspense fallback={<PageLoading />}>
        <ServiceRequestsContent />
      </Suspense>
    </div>
  );
}

// Made with Bob
