import { appPath } from "@/lib/app-paths";
import { createClient } from "@/lib/supabase/server";
import { getServiceRequestsForClient } from "@/lib/service-requests";

function getStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Brouillon";
    case "submitted":
      return "Soumise";
    case "in_progress":
      return "En cours";
    case "review":
      return "En revue";
    case "completed":
      return "Terminée";
    case "cancelled":
      return "Annulée";
    default:
      return status;
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "submitted":
      return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    case "in_progress":
      return "bg-sky-500/10 text-sky-500 border border-sky-500/20";
    case "review":
      return "bg-violet-500/10 text-violet-500 border border-violet-500/20";
    case "completed":
      return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    case "cancelled":
      return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
  }
}

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const requests = await getServiceRequestsForClient(supabase);
  const totalRequests = requests.length;
  const lastRequest = requests[0];
  const statusCounts = requests.reduce(
    (acc, request) => {
      acc[request.status] = (acc[request.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-10 py-8">
      <div className="space-y-4">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm transition">
          <h1 className="text-3xl font-semibold text-card-foreground">Mon espace client</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Suivez vos demandes de service, consultez l’historique et lancez un nouveau projet avec notre équipe.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border bg-muted p-5">
              <p className="text-sm font-medium text-muted-foreground">Total des demandes</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{totalRequests}</p>
            </div>
            <div className="rounded-3xl border border-border bg-muted p-5">
              <p className="text-sm font-medium text-muted-foreground">Dernière demande</p>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {lastRequest ? lastRequest.title : "Aucune demande"}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-muted p-5">
              <p className="text-sm font-medium text-muted-foreground">Action rapide</p>
              <a
                href={appPath("/services")}
                className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                Créer une demande
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Soumises", value: statusCounts.submitted ?? 0 },
            { label: "En cours", value: statusCounts.in_progress ?? 0 },
            { label: "Terminées", value: statusCounts.completed ?? 0 },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-border bg-card p-5 shadow-sm transition"
            >
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm transition">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-card-foreground">Demandes récentes</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Suivez l’avancement de vos demandes et consultez les détails rapidement.
            </p>
          </div>
          <a
            href={appPath("/services")}
            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
          >
            Nouvelle demande
          </a>
        </div>

        {requests.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-muted p-8 text-sm text-muted-foreground">
            Vous n’avez pas encore de demande. Utilisez le bouton ci-dessus pour exprimer votre besoin.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-3xl border border-border bg-muted p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{request.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {request.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                      request.status
                    )}`}
                  >
                    {getStatusLabel(request.status)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Créée le {new Date(request.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  {request.dimensions ? <span>Dimensions : {request.dimensions}</span> : null}
                  {request.constraints ? <span>Contraintes : {request.constraints}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
