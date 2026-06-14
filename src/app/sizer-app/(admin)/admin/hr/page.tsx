import { Suspense } from "react";
import { getAdminHrUsers } from "@/app/actions/admin-hr-actions";
import { HrUsersTable } from "@/components/admin/hr-users-table";
import { PageLoading } from "@/components/loaders/page-loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const metadata = {
  title: "HR | Admin",
  description: "Gestion des comptes, rôles et suspensions",
};

async function HrPageContent() {
  const result = await getAdminHrUsers();

  if (!result.success || !result.data) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Erreur
          </CardTitle>
          <CardDescription>
            {result.error || "Impossible de charger les utilisateurs"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <HrUsersTable users={result.data} />;
}

export default function AdminHrPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion RH</h1>
        <p className="text-muted-foreground mt-2">
          Créez des comptes, assignez des rôles et suspendez/reprenez les accès
          des utilisateurs.
        </p>
      </div>

      <Suspense fallback={<PageLoading />}>
        <HrPageContent />
      </Suspense>
    </div>
  );
}

