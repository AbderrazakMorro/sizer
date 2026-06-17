/**
 * Verificación de capacidades por plan/modalidad.
 * Usar para mostrar, ocultar o deshabilitar elementos según el config del plan.
 * No incluye copy comercial (ver plan-copy.ts).
 */

import type { PlanConfig, PlanFeatureModality } from "@/types";

const CONSUMABLE_KEYS = [
  "projects_limit",
  "clients_limit",
  "suppliers_limit",
  "catalog_products_limit",
  "storage_limit_mb",
] as const;

export type ModalityFeatureKey =
  | "pdf_export_mode"
  | "multi_currency_per_project"
  | "purchase_orders"
  | "costs_management"
  | "payments_management"
  | "documents"
  | "notes"
  | "summary"
  | "support_level";

export type PlanFeatureKey =
  | (typeof CONSUMABLE_KEYS)[number]
  | ModalityFeatureKey;

const CONSUMABLE_SET = new Set<string>(CONSUMABLE_KEYS);

function isConsumableKey(
  key: PlanFeatureKey
): key is (typeof CONSUMABLE_KEYS)[number] {
  return CONSUMABLE_SET.has(key);
}

const MODALITY_ORDER: PlanFeatureModality[] = ["none", "basic", "plus", "full"];

function modalityLevel(m: PlanFeatureModality | undefined): number {
  if (!m) return -1;
  const i = MODALITY_ORDER.indexOf(m);
  return i === -1 ? -1 : i;
}

/**
 * Plan limits disabled — always returns true.
 */
export function isCapabilityAvailable(
  _config: PlanConfig | null | undefined,
  _featureKey: PlanFeatureKey
): boolean {
  return true;
}

export type MinModality = "basic" | "plus" | "full";

/**
 * Plan limits disabled — always returns true.
 */
export function hasModalityAtLeast(
  _config: PlanConfig | null | undefined,
  _featureKey: PlanFeatureKey,
  _minLevel: MinModality
): boolean {
  return true;
}

export interface CheckCapabilityOptions {
  /** Exige que la modalidad sea al menos este nivel (solo para claves de modalidad). */
  minModality?: MinModality;
}

/**
 * Plan limits disabled — always returns true.
 */
export function checkCapability(
  _config: PlanConfig | null | undefined,
  _featureKey: PlanFeatureKey,
  _options?: CheckCapabilityOptions
): boolean {
  return true;
}
