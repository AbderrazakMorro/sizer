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
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200";
    case "in_progress":
      return "bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-200";
    case "review":
      return "bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-200";
    case "completed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200";
    case "cancelled":
      return "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-200";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
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
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition dark:border-slate-800 dark:bg-slate-950">
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Mon espace client</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Suivez vos demandes de service, consultez l’historique et lancez un nouveau projet avec notre équipe.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total des demandes</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{totalRequests}</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Dernière demande</p>
              <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                {lastRequest ? lastRequest.title : "Aucune demande"}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Action rapide</p>
              <a
                href={appPath("/client/services")}
                className="mt-3 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
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
              className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition dark:border-slate-800 dark:bg-slate-950"
            >
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Demandes récentes</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Suivez l’avancement de vos demandes et consultez les détails rapidement.
            </p>
          </div>
          <a
            href={appPath("/client/services")}
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Nouvelle demande
          </a>
        </div>

        {requests.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300/70 bg-slate-50 p-8 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
            Vous n’avez pas encore de demande. Utilisez le bouton ci-dessus pour exprimer votre besoin.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{request.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
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
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
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
