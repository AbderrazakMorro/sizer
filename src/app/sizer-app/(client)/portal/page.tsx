import { appPath } from "@/lib/app-paths";
import { createClient } from "@/lib/supabase/server";
import { getServiceRequestsForClient } from "@/lib/service-requests";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Plus,
  Inbox,
  CircleDot,
  Eye,
  RotateCcw,
} from "lucide-react";
import type { ServiceRequestStatus } from "@/types";

/* ─────────────────────────────────────────── helpers ─── */

interface StatusConfig {
  label: string;
  icon: React.ElementType;
  pill: string;
  dot: string;
  iconColor: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: {
    label: "Brouillon",
    icon: FileText,
    pill: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
    dot: "bg-zinc-400",
    iconColor: "text-zinc-400",
  },
  submitted: {
    label: "Soumise",
    icon: Clock,
    pill: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    dot: "bg-amber-400",
    iconColor: "text-amber-400",
  },
  pending_approval: {
    label: "En attente",
    icon: Clock,
    pill: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    dot: "bg-amber-400",
    iconColor: "text-amber-400",
  },
  approved: {
    label: "Approuvée",
    icon: CheckCircle2,
    pill: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    dot: "bg-emerald-400",
    iconColor: "text-emerald-400",
  },
  assigned: {
    label: "Assignée",
    icon: CircleDot,
    pill: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    dot: "bg-sky-400",
    iconColor: "text-sky-400",
  },
  in_progress: {
    label: "En cours",
    icon: RotateCcw,
    pill: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    dot: "bg-sky-400",
    iconColor: "text-sky-400",
  },
  review: {
    label: "En revue",
    icon: Eye,
    pill: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    dot: "bg-violet-400",
    iconColor: "text-violet-400",
  },
  completed: {
    label: "Terminée",
    icon: CheckCircle2,
    pill: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    dot: "bg-emerald-400",
    iconColor: "text-emerald-400",
  },
  cancelled: {
    label: "Annulée",
    icon: XCircle,
    pill: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    dot: "bg-rose-400",
    iconColor: "text-rose-400",
  },
};

function getStatusCfg(status: string): StatusConfig {
  return (
    STATUS_CONFIG[status] ?? {
      label: status,
      icon: FileText,
      pill: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
      dot: "bg-zinc-400",
      iconColor: "text-zinc-400",
    }
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ─────────────────────────────────────────── page ─── */

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const requests = await getServiceRequestsForClient(supabase);

  const total = requests.length;
  const submitted =
    requests.filter((r) => r.status === "submitted" || r.status === "pending_approval").length;
  const inProgress =
    requests.filter((r) =>
      (["assigned", "in_progress", "review"] as ServiceRequestStatus[]).includes(r.status)
    ).length;
  const completed = requests.filter((r) => r.status === "completed").length;

  const statCards = [
    {
      label: "Total",
      value: total,
      icon: Inbox,
      gradient: "from-zinc-800/60 to-zinc-900/60",
      accent: "text-zinc-300",
      iconBg: "bg-zinc-700/40",
    },
    {
      label: "Soumises",
      value: submitted,
      icon: Clock,
      gradient: "from-amber-950/40 to-zinc-900/60",
      accent: "text-amber-400",
      iconBg: "bg-amber-500/10",
    },
    {
      label: "En cours",
      value: inProgress,
      icon: RotateCcw,
      gradient: "from-sky-950/40 to-zinc-900/60",
      accent: "text-sky-400",
      iconBg: "bg-sky-500/10",
    },
    {
      label: "Terminées",
      value: completed,
      icon: CheckCircle2,
      gradient: "from-emerald-950/40 to-zinc-900/60",
      accent: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-8 py-8 px-4 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-golden mb-1">
            Espace client
          </p>
          <h1 className="text-3xl font-semibold text-foreground">Mon tableau de bord</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            Suivez l'avancement de vos demandes et communiquez avec notre équipe.
          </p>
        </div>
        <a
          href={appPath("/client/services")}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-golden px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Nouvelle demande
        </a>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${card.gradient} p-5 shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                  <p className={`mt-2 text-4xl font-bold ${card.accent}`}>{card.value}</p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <Icon className={`h-4.5 w-4.5 ${card.accent}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Requests timeline ── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {/* section header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Mes demandes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {total === 0
                ? "Aucune demande pour le moment"
                : `${total} demande${total > 1 ? "s" : ""} au total`}
            </p>
          </div>
        </div>

        {/* empty state */}
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Aucune demande</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Démarrez votre premier projet avec notre équipe.
              </p>
            </div>
            <a
              href={appPath("/client/services")}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-golden px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
            >
              <Plus className="h-3.5 w-3.5" />
              Créer une demande
            </a>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {requests.map((request, idx) => {
              const cfg = getStatusCfg(request.status);
              const Icon = cfg.icon;
              const isLast = idx === requests.length - 1;

              return (
                <li
                  key={request.id}
                  className={`group relative flex gap-4 px-6 py-5 transition-colors hover:bg-muted/40 ${isLast ? "rounded-b-2xl" : ""}`}
                >
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center pt-1">
                    <div
                      className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted`}
                    >
                      <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
                    </div>
                    {!isLast && (
                      <div className="mt-1 w-px flex-1 bg-border" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground leading-tight">
                          {request.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDate(request.created_at)}
                          {request.tracking_serial && (
                            <span className="ml-2 font-mono opacity-60">
                              #{request.tracking_serial}
                            </span>
                          )}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.pill}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>

                    {request.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                        {request.description}
                      </p>
                    )}

                    {/* Meta chips */}
                    {(request.dimensions || request.constraints || request.project_type) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {request.project_type && (
                          <span className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {request.project_type}
                          </span>
                        )}
                        {request.dimensions && (
                          <span className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {request.dimensions}
                          </span>
                        )}
                        {request.constraints && (
                          <span className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {request.constraints}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Progress pipeline (visual only for active requests) */}
                    {(["submitted", "pending_approval", "approved", "assigned", "in_progress", "review"] as ServiceRequestStatus[]).includes(request.status) && (
                      <div className="mt-4">
                        <ClientRequestPipeline status={request.status} />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── mini pipeline strip ─── */
const PIPELINE_STEPS: { key: ServiceRequestStatus; label: string }[] = [
  { key: "submitted", label: "Soumise" },
  { key: "approved", label: "Approuvée" },
  { key: "in_progress", label: "En cours" },
  { key: "review", label: "Revue" },
  { key: "completed", label: "Terminée" },
];

const STEP_ORDER: Record<string, number> = {
  submitted: 0,
  pending_approval: 0,
  approved: 1,
  assigned: 2,
  in_progress: 2,
  review: 3,
  completed: 4,
};

function ClientRequestPipeline({ status }: { status: ServiceRequestStatus }) {
  const currentStep = STEP_ORDER[status] ?? -1;

  return (
    <div className="flex items-center gap-0.5">
      {PIPELINE_STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`h-1 w-full rounded-full transition-all ${
                done
                  ? "bg-brand-golden"
                  : active
                  ? "bg-brand-golden/50"
                  : "bg-border"
              }`}
            />
            {active && (
              <p className="text-[10px] font-medium text-brand-golden">
                {step.label}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
