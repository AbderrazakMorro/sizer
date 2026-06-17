"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Client } from "@/types";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AdminClientRow = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at?: string | null;
};

export function ClientsTable({ clients }: { clients: AdminClientRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      return (
        (c.full_name ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.id ?? "").toLowerCase().includes(q)
      );
    });
  }, [clients, query]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Clients</CardTitle>
            <CardDescription>{filtered.length} client(s) affiché(s)</CardDescription>
          </div>
          <div className="relative">
            <Input
              placeholder="Rechercher..."
              className="w-full sm:w-[260px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-muted-foreground py-10 text-center">
            Aucun client trouvé
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Créé</TableHead>
                <TableHead className="text-right">ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.full_name || "—"}</TableCell>
                  <TableCell>
                    {c.email ? (
                      <Badge variant="secondary">{c.email}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{c.phone || "—"}</TableCell>
                  <TableCell>
                    {c.created_at ? (
                      format(new Date(c.created_at), "dd MMM yyyy", { locale: fr })
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {c.id}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

