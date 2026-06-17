"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  ArrowRight,
  MoreHorizontal,
  Eye,
  Search,
} from "lucide-react";
import type { AdminServiceRequestView } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceRequestDetailDialog } from "./service-request-detail-dialog";

interface ServiceRequestsTableProps {
  requests: AdminServiceRequestView[];
}

// ── Status colour palette ───────────────────────────────────────────────────
const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; bg: string; text: string; border: string; dot: string }
> = {
  submitted: {
    label: "Soumise",
    icon: Clock,
    bg: "rgba(99,102,241,0.10)",
    text: "#818cf8",
    border: "rgba(99,102,241,0.25)",
    dot: "#818cf8",
  },
  pending_approval: {
    label: "En attente",
    icon: AlertCircle,
    bg: "rgba(245,158,11,0.10)",
    text: "#f59e0b",
    border: "rgba(245,158,11,0.28)",
    dot: "#f59e0b",
  },
  approved: {
    label: "Approuvée",
    icon: CheckCircle,
    bg: "rgba(34,197,94,0.10)",
    text: "#22c55e",
    border: "rgba(34,197,94,0.25)",
    dot: "#22c55e",
  },
  assigned: {
    label: "Assignée",
    icon: Users,
    bg: "rgba(59,130,246,0.10)",
    text: "#3b82f6",
    border: "rgba(59,130,246,0.25)",
    dot: "#3b82f6",
  },
  rejected: {
    label: "Rejetée",
    icon: XCircle,
    bg: "rgba(239,68,68,0.10)",
    text: "#ef4444",
    border: "rgba(239,68,68,0.25)",
    dot: "#ef4444",
  },
  in_progress: {
    label: "En cours",
    icon: Clock,
    bg: "rgba(14,165,233,0.10)",
    text: "#0ea5e9",
    border: "rgba(14,165,233,0.25)",
    dot: "#0ea5e9",
  },
  review: {
    label: "En révision",
    icon: AlertCircle,
    bg: "rgba(168,85,247,0.10)",
    text: "#a855f7",
    border: "rgba(168,85,247,0.25)",
    dot: "#a855f7",
  },
  completed: {
    label: "Terminée",
    icon: CheckCircle,
    bg: "rgba(16,185,129,0.10)",
    text: "#10b981",
    border: "rgba(16,185,129,0.25)",
    dot: "#10b981",
  },
  cancelled: {
    label: "Annulée",
    icon: XCircle,
    bg: "rgba(107,114,128,0.10)",
    text: "#9ca3af",
    border: "rgba(107,114,128,0.22)",
    dot: "#9ca3af",
  },
  draft: {
    label: "Brouillon",
    icon: Clock,
    bg: "rgba(107,114,128,0.08)",
    text: "#9ca3af",
    border: "rgba(107,114,128,0.18)",
    dot: "#6b7280",
  },
};

// ── Priority colour palette ─────────────────────────────────────────────────
const priorityConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  low: {
    label: "Basse",
    bg: "rgba(34,197,94,0.08)",
    text: "#22c55e",
    border: "rgba(34,197,94,0.20)",
    dot: "#22c55e",
  },
  medium: {
    label: "Moyenne",
    bg: "rgba(59,130,246,0.10)",
    text: "#3b82f6",
    border: "rgba(59,130,246,0.22)",
    dot: "#3b82f6",
  },
  high: {
    label: "Haute",
    bg: "rgba(245,158,11,0.10)",
    text: "#f59e0b",
    border: "rgba(245,158,11,0.28)",
    dot: "#f59e0b",
  },
  urgent: {
    label: "Urgente",
    bg: "rgba(239,68,68,0.10)",
    text: "#ef4444",
    border: "rgba(239,68,68,0.28)",
    dot: "#ef4444",
  },
};

// ── Shared pill component ───────────────────────────────────────────────────
import React from "react";

function StatusPill({
  status,
}: {
  status: string;
}) {
  const cfg = statusConfig[status] ?? {
    label: status,
    icon: Clock,
    bg: "rgba(107,114,128,0.08)",
    text: "#9ca3af",
    border: "rgba(107,114,128,0.18)",
    dot: "#6b7280",
  };
  const Icon = cfg.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.01em",
        background: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
      }}
    >
      <Icon style={{ width: 11, height: 11, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function PriorityPill({
  priority,
}: {
  priority: string;
}) {
  const cfg = priorityConfig[priority] ?? {
    label: priority,
    bg: "rgba(107,114,128,0.08)",
    text: "#9ca3af",
    border: "rgba(107,114,128,0.18)",
    dot: "#6b7280",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.01em",
        background: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}

export function ServiceRequestsTable({ requests }: ServiceRequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (r.client_name || "").toLowerCase().includes(q) ||
      (r.client_email || "").toLowerCase().includes(q) ||
      (r.title || "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) =>
      ["submitted", "pending_approval"].includes(r.status)
    ).length,
    approved: requests.filter((r) => r.status === "approved").length,
    assigned: requests.filter((r) => r.status === "assigned").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>En attente</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approuvées</CardDescription>
            <CardTitle className="text-3xl">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Assignées</CardDescription>
            <CardTitle className="text-3xl">{stats.assigned}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>En cours</CardDescription>
            <CardTitle className="text-3xl">{stats.in_progress}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Demandes de Service</CardTitle>
              <CardDescription>
                {filteredRequests.length} demande(s) affichée(s)
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  Toutes
                </Button>
                <Button
                  variant={filterStatus === "submitted" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("submitted")}
                >
                  Soumise
                </Button>
                <Button
                  variant={
                    filterStatus === "pending_approval" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setFilterStatus("pending_approval")}
                >
                  En attente
                </Button>
                <Button
                  variant={filterStatus === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("approved")}
                >
                  Approuvées
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Architectes</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">
                      Aucune demande de service trouvée
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => {
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.client_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.client_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">
                            {request.title}
                          </p>
                          {request.tracking_serial && (
                            <p className="text-xs text-muted-foreground">
                              {request.tracking_serial}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusPill status={request.status} />
                      </TableCell>
                      <TableCell>
                        <PriorityPill priority={request.priority} />
                      </TableCell>
                      <TableCell>
                        {request.assigned_engineers_count > 0 ? (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {request.assigned_engineers_count}
                            </span>
                            {request.lead_engineer_name && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({request.lead_engineer_name})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Non assignée
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(request.created_at), "dd MMM yyyy", {
                            locale: fr,
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setSelectedRequest(request.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir les détails
                            </DropdownMenuItem>
                            {request.converted_to_project_id && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <a
                                    href={`/sizer-app/projects/${request.converted_to_project_id}`}
                                  >
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Voir le projet
                                  </a>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedRequest && (
        <ServiceRequestDetailDialog
          requestId={selectedRequest}
          open={!!selectedRequest}
          onOpenChange={(open: boolean) => !open && setSelectedRequest(null)}
        />
      )}
    </>
  );
}

// Made with Bob
