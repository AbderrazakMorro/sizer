"use client";

import { useEffect, useState } from "react";
import type { ServiceRequest } from "@/types";

export default function ClientServiceRequestsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [constraints, setConstraints] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[] | null>(null);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      setLoadingRequests(true);
      try {
        const response = await fetch("/api/service-requests");
        const result = await response.json();
        if (response.ok && result.success) {
          setRequests(result.data);
        } else {
          setError(result.error || "Impossible de charger vos demandes.");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur de chargement des demandes."
        );
      } finally {
        setLoadingRequests(false);
      }
    }

    loadRequests();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!title.trim() || !description.trim()) {
      setError("Le titre et la description sont requis.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          dimensions: dimensions.trim() || null,
          constraints: constraints.trim() || null,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Erreur lors de la soumission.");
      } else {
        setMessage(
          "Votre demande a été envoyée. Un architecte pourra la prendre en charge rapidement."
        );
        setTitle("");
        setDescription("");
        setDimensions("");
        setConstraints("");
        setRequests((prev) => (prev ? [result.data, ...prev] : [result.data]));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inattendue lors de la demande."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-10 py-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Demande de service</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Décrivez votre projet, vos contraintes et vos dimensions pour permettre à notre équipe de répondre avec une proposition adaptée.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition dark:border-slate-800 dark:bg-slate-950">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                Intitulé du projet
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                placeholder="Ex. Réaménagement salon + cuisine"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                Description détaillée
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                placeholder="Expliquez votre besoin, votre style souhaité et les points importants."
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                  Dimensions & surface
                </label>
                <input
                  value={dimensions}
                  onChange={(event) => setDimensions(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="Ex. 45 m², salon + cuisine ouverte"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                  Contraintes importantes
                </label>
                <input
                  value={constraints}
                  onChange={(event) => setConstraints(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="Ex. budget limité, timing court, réglementation spécifique"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-300/70 bg-rose-50/80 p-4 text-sm text-rose-900 dark:border-rose-700/50 dark:bg-rose-950/20 dark:text-rose-200">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-2xl border border-emerald-300/70 bg-emerald-50/80 p-4 text-sm text-emerald-900 dark:border-emerald-500/50 dark:bg-emerald-950/20 dark:text-emerald-200">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-xl font-semibold">Suivi des demandes</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Visualisez l’historique de vos demandes et leur statut actuel.
            </p>

            {loadingRequests ? (
              <div className="mt-6 text-sm text-slate-500">Chargement...</div>
            ) : requests && requests.length > 0 ? (
              <div className="mt-6 space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {request.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(request.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          request.status === "submitted"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
                            : request.status === "in_progress"
                            ? "bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-200"
                            : request.status === "review"
                            ? "bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-200"
                            : request.status === "completed"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200"
                            : request.status === "cancelled"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-200"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {request.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {request.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300/70 bg-slate-50 p-6 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                Aucune demande enregistrée pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
