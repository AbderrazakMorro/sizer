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

const statusConfig = {
  submitted: {
    label: "Soumise",
    icon: Clock,
    variant: "secondary" as const,
  },
  pending_approval: {
    label: "En attente",
    icon: AlertCircle,
    variant: "warning" as const,
  },
  approved: {
    label: "Approuvée",
    icon: CheckCircle,
    variant: "success" as const,
  },
  assigned: {
    label: "Assignée",
    icon: Users,
    variant: "default" as const,
  },
  rejected: {
    label: "Rejetée",
    icon: XCircle,
    variant: "destructive" as const,
  },
  in_progress: {
    label: "En cours",
    icon: Clock,
    variant: "default" as const,
  },
  review: {
    label: "En révision",
    icon: AlertCircle,
    variant: "secondary" as const,
  },
  completed: {
    label: "Terminée",
    icon: CheckCircle,
    variant: "success" as const,
  },
  cancelled: {
    label: "Annulée",
    icon: XCircle,
    variant: "destructive" as const,
  },
  draft: {
    label: "Brouillon",
    icon: Clock,
    variant: "secondary" as const,
  },
};

const priorityConfig = {
  low: { label: "Basse", variant: "secondary" as const },
  medium: { label: "Moyenne", variant: "default" as const },
  high: { label: "Haute", variant: "warning" as const },
  urgent: { label: "Urgente", variant: "destructive" as const },
};

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
                <TableHead>Ingénieurs</TableHead>
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
                  const statusInfo = statusConfig[request.status];
                  const StatusIcon = statusInfo.icon;
                  const priorityInfo = priorityConfig[request.priority];

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
                        <Badge variant={statusInfo.variant}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={priorityInfo.variant}>
                          {priorityInfo.label}
                        </Badge>
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
