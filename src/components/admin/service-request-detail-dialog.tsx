"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckCircle,
  XCircle,
  Users,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  getServiceRequestDetails,
  approveServiceRequest,
  rejectServiceRequest,
  assignEngineersToRequest,
  convertRequestToProject,
  updateServiceRequestDetails,
  getAvailableEngineers,
} from "@/app/actions/admin-service-request-actions";
import type {
  ServiceRequest,
  ServiceRequestAssignment,
  ServiceRequestPriority,
} from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface ServiceRequestDetailDialogProps {
  requestId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceRequestDetailDialog({
  requestId,
  open,
  onOpenChange,
}: ServiceRequestDetailDialogProps) {
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [assignments, setAssignments] = useState<ServiceRequestAssignment[]>(
    []
  );
  const [engineers, setEngineers] = useState<
    Array<{ id: string; full_name: string; email: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [selectedEngineers, setSelectedEngineers] = useState<string[]>([]);
  const [leadEngineer, setLeadEngineer] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [priority, setPriority] = useState<ServiceRequestPriority>("medium");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (open && requestId) {
      loadData();
    }
  }, [open, requestId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [detailsResult, engineersResult] = await Promise.all([
        getServiceRequestDetails(requestId),
        getAvailableEngineers(),
      ]);

      if (detailsResult.success && detailsResult.data) {
        setRequest(detailsResult.data.request);
        setAssignments(detailsResult.data.assignments);
        setPriority(detailsResult.data.request.priority || "medium");
        setEstimatedBudget(
          detailsResult.data.request.estimated_budget?.toString() || ""
        );
        setEstimatedDuration(
          detailsResult.data.request.estimated_duration_days?.toString() || ""
        );
        setAdminNotes(detailsResult.data.request.admin_notes || "");

        // Set selected engineers from assignments
        const assignedIds = detailsResult.data.assignments.map(
          (a) => a.engineer_id
        );
        setSelectedEngineers(assignedIds);
        const lead = detailsResult.data.assignments.find(
          (a) => a.role === "lead"
        );
        if (lead) setLeadEngineer(lead.engineer_id);
      }

      if (engineersResult.success && engineersResult.data) {
        setEngineers(engineersResult.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const result = await approveServiceRequest(requestId, adminNotes);
      if (result.success) {
        toast.success("Demande approuvée avec succès");
        await loadData();
      } else {
        toast.error(result.error || "Erreur lors de l'approbation");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Veuillez fournir une raison de rejet");
      return;
    }

    setActionLoading(true);
    try {
      const result = await rejectServiceRequest(requestId, rejectionReason);
      if (result.success) {
        toast.success("Demande rejetée");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Erreur lors du rejet");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignEngineers = async () => {
    if (selectedEngineers.length === 0) {
      toast.error("Veuillez sélectionner au moins un ingénieur");
      return;
    }

    setActionLoading(true);
    try {
      const result = await assignEngineersToRequest(
        requestId,
        selectedEngineers,
        leadEngineer || undefined
      );
      if (result.success) {
        toast.success("Ingénieurs assignés avec succès");
        await loadData();
      } else {
        toast.error(result.error || "Erreur lors de l'assignation");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToProject = async () => {
    setActionLoading(true);
    try {
      const result = await convertRequestToProject(requestId);
      if (result.success) {
        toast.success("Projet créé avec succès");
        if (result.projectId) {
          window.location.href = `/sizer-app/projects/${result.projectId}`;
        }
      } else {
        toast.error(result.error || "Erreur lors de la conversion");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateDetails = async () => {
    setActionLoading(true);
    try {
      const result = await updateServiceRequestDetails(requestId, {
        priority,
        estimated_budget: estimatedBudget ? parseFloat(estimatedBudget) : undefined,
        estimated_duration_days: estimatedDuration
          ? parseInt(estimatedDuration)
          : undefined,
        admin_notes: adminNotes,
      });
      if (result.success) {
        toast.success("Détails mis à jour");
        await loadData();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const toggleEngineer = (engineerId: string) => {
    setSelectedEngineers((prev) =>
      prev.includes(engineerId)
        ? prev.filter((id) => id !== engineerId)
        : [...prev, engineerId]
    );
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chargement...</DialogTitle>
            <DialogDescription>
              Chargement des détails de la demande de service
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!request) {
    return null;
  }

  const canApprove = ["submitted", "pending_approval"].includes(request.status);
  const canAssign = ["approved", "assigned"].includes(request.status);
  const canConvert = ["approved", "assigned"].includes(request.status) && !request.converted_to_project_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{request.title}</DialogTitle>
          <DialogDescription>
            Demande de {request.guest_name || "Client"} •{" "}
            {format(new Date(request.created_at), "dd MMMM yyyy", {
              locale: fr,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Info */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Informations Client</h3>
            <div className="grid gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nom:</span>{" "}
                {request.guest_name}
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                {request.guest_email}
              </div>
              {request.guest_phone && (
                <div>
                  <span className="text-muted-foreground">Téléphone:</span>{" "}
                  {request.guest_phone}
                </div>
              )}
              {request.tracking_serial && (
                <div>
                  <span className="text-muted-foreground">Numéro de suivi:</span>{" "}
                  <code className="bg-muted px-2 py-1 rounded">
                    {request.tracking_serial}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          {/* Admin Details */}
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="font-semibold">Détails Administratifs</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="priority">Priorité</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as ServiceRequestPriority)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget">Budget Estimé (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  placeholder="Ex: 50000"
                />
              </div>

              <div>
                <Label htmlFor="duration">Durée Estimée (jours)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="Ex: 90"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes Administratives</Label>
              <Textarea
                id="notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Notes internes..."
                rows={3}
              />
            </div>

            <Button onClick={handleUpdateDetails} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour les détails
            </Button>
          </div>

          {/* Engineer Assignment */}
          {canAssign && (
            <div className="rounded-lg border p-4 space-y-4">
              <h3 className="font-semibold">Assigner des Ingénieurs</h3>
              
              <div className="space-y-2">
                {engineers.map((engineer) => (
                  <div key={engineer.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={engineer.id}
                      checked={selectedEngineers.includes(engineer.id)}
                      onCheckedChange={() => toggleEngineer(engineer.id)}
                    />
                    <label
                      htmlFor={engineer.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                    >
                      {engineer.full_name} ({engineer.email})
                    </label>
                    {selectedEngineers.includes(engineer.id) && (
                      <Button
                        variant={leadEngineer === engineer.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLeadEngineer(engineer.id)}
                      >
                        {leadEngineer === engineer.id ? "Lead" : "Définir comme lead"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button onClick={handleAssignEngineers} disabled={actionLoading || selectedEngineers.length === 0}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Users className="mr-2 h-4 w-4" />
                Assigner les ingénieurs
              </Button>
            </div>
          )}

          {/* Current Assignments */}
          {assignments.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Ingénieurs Assignés</h3>
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{assignment.engineer?.full_name}</span>
                      <span className="text-muted-foreground ml-2">
                        ({assignment.engineer?.email})
                      </span>
                    </div>
                    <Badge variant={assignment.role === "lead" ? "default" : "secondary"}>
                      {assignment.role === "lead" ? "Lead" : "Support"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {canApprove && (
              <Button onClick={handleApprove} disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CheckCircle className="mr-2 h-4 w-4" />
                Approuver
              </Button>
            )}

            {canConvert && (
              <Button onClick={handleConvertToProject} disabled={actionLoading} variant="default">
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <ArrowRight className="mr-2 h-4 w-4" />
                Convertir en Projet
              </Button>
            )}

            {request.status !== "rejected" && (
              <div className="flex gap-2 items-center ml-auto">
                <Textarea
                  placeholder="Raison du rejet..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="max-w-xs"
                  rows={1}
                />
                <Button
                  onClick={handleReject}
                  disabled={actionLoading}
                  variant="destructive"
                >
                  {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
              </div>
            )}
          </div>

          {request.converted_to_project_id && (
            <div className="rounded-lg border border-green-500 bg-green-50 dark:bg-green-950 p-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Converti en projet</span>
              </div>
              <Button
                asChild
                variant="link"
                className="mt-2 p-0 h-auto text-green-700 dark:text-green-300"
              >
                <a href={`/sizer-app/projects/${request.converted_to_project_id}`}>
                  Voir le projet <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Made with Bob
