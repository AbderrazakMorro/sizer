"use client";

import { useMemo, useState } from "react";
import type { UserRole } from "@/types";
import type { AdminHrUserRow } from "@/app/actions/admin-hr-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { assignRolesToUser, suspendOrResumeUser } from "@/app/actions/admin-hr-actions";
import { Loader2, Pause, Play, ShieldCheck } from "lucide-react";

const ALL_ROLES: UserRole[] = ["client", "architect", "site_manager", "admin"];

function roleLabel(role: UserRole) {
  switch (role) {
    case "client":
      return "Client";
    case "architect":
      return "Architecte";
    case "site_manager":
      return "Site Manager";
    case "admin":
      return "Admin";
    default:
      return role;
  }
}

export function HrUsersTable({ users }: { users: AdminHrUserRow[] }) {
  const [selected, setSelected] = useState<AdminHrUserRow | null>(null);
  const [roleDraft, setRoleDraft] = useState<UserRole[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setRoleFilter("all");
  };


  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((u) => {
      const matchesQuery =
        !q ||
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q);

      const suspended = u.is_suspended ?? false;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !suspended) ||
        (statusFilter === "suspended" && suspended);

      const matchesRole =
        roleFilter === "all" || (u.roles ?? []).includes(roleFilter);

      return matchesQuery && matchesStatus && matchesRole;
    });
  }, [query, roleFilter, statusFilter, users]);

  const isSelectedSuspended = selected?.is_suspended ?? false;


  const openRoleDialog = (u: AdminHrUserRow) => {
    setSelected(u);
    setRoleDraft(u.roles);
  };

  const handleSaveRoles = async () => {
    if (!selected) return;
    setSavingRoles(true);
    try {
      const res = await assignRolesToUser({ userId: selected.id, roles: roleDraft });
      if (!res.success) {
        toast.error(res.error || "Erreur lors de la mise à jour des rôles");
        return;
      }
      toast.success("Rôles mis à jour");
      setSelected(null);
    } finally {
      setSavingRoles(false);
    }
  };

  const toggleRole = (role: UserRole) => {
    setRoleDraft((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const roleBadges = useMemo(() => {
    const getVariant = (role: UserRole) => {
      if (role === "admin") return "default" as const;
      return "secondary" as const;
    };
    return (roles: UserRole[]) =>
      roles.map((r) => (
        <Badge key={r} variant={getVariant(r)} className="mr-1">
          {r === "admin" ? <ShieldCheck className="mr-1 h-3 w-3" /> : null}
          {roleLabel(r)}
        </Badge>
      ));
  }, []);

  const handleSuspendResume = async (u: AdminHrUserRow) => {
    setBusyUserId(u.id);
    try {
      const res = await suspendOrResumeUser({ userId: u.id, suspend: !(u.is_suspended ?? false) });
      if (!res.success) {
        toast.error(res.error || "Erreur lors de la mise à jour");
        return;
      }
      toast.success(u.is_suspended ? "Compte repris" : "Compte suspendu");
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground">{filteredUsers.length} utilisateur(s)</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (nom/email)..."
              className="h-9 w-full sm:w-[260px] rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
              >
                Tous
              </Button>
              <Button
                type="button"
                size="sm"
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
              >
                Actifs
              </Button>
              <Button
                type="button"
                size="sm"
                variant={statusFilter === "suspended" ? "default" : "outline"}
                onClick={() => setStatusFilter("suspended")}
              >
                Suspendus
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value === "all" ? "all" : (e.target.value as UserRole))}
                className="h-9 rounded-md border bg-background px-2 text-sm outline-none"
              >
                <option value="all">Tous les rôles</option>
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </select>

              {(query || statusFilter !== "all" || roleFilter !== "all") && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={resetFilters}
              >
                Réinitialiser
              </Button>

              )}
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôles</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  Aucun utilisateur
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => {

                const suspended = u.is_suspended ?? false;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{u.full_name || u.email}</span>
                        <span className="text-sm text-muted-foreground">{u.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {roleBadges(u.roles)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={suspended ? "destructive" : "secondary"}>
                        {suspended ? "Suspendu" : "Actif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openRoleDialog(u)}>
                          Gérer rôles
                        </Button>
                        <Button
                          size="sm"
                          variant={suspended ? "default" : "destructive"}
                          disabled={busyUserId === u.id}
                          onClick={() => handleSuspendResume(u)}
                        >
                          {busyUserId === u.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : suspended ? (
                            <Play className="mr-2 h-4 w-4" />
                          ) : (
                            <Pause className="mr-2 h-4 w-4" />
                          )}
                          {suspended ? "Reprendre" : "Suspendre"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Gérer les rôles</DialogTitle>
              <DialogDescription>
                Sélectionnez les rôles pour <b>{selected?.email}</b>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-3">
                {ALL_ROLES.map((role) => (
                  <div key={role} className="flex items-center space-x-3">
                    <Checkbox
                      id={`role-${role}`}
                      checked={roleDraft.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                    />
                    <Label htmlFor={`role-${role}`}>{roleLabel(role)}</Label>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setSelected(null)} disabled={savingRoles}>
                  Annuler
                </Button>
                <Button onClick={handleSaveRoles} disabled={savingRoles || roleDraft.length === 0}>
                  {savingRoles ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Enregistrer
                </Button>
              </div>

              {isSelectedSuspended ? (
                <p className="text-sm text-muted-foreground">
                  Le compte est actuellement suspendu. Vous pouvez modifier les rôles avant de le reprendre.
                </p>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

