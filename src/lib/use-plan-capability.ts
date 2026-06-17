"use client";

import type { CheckCapabilityOptions, PlanFeatureKey } from "@/lib/plan-capability";

/**
 * Plan limits disabled — all features are always available.
 * @param _featureKey - Unused (all capabilities granted).
 * @param _options - Unused.
 */
export function usePlanCapability(
  _featureKey: PlanFeatureKey,
  _options?: CheckCapabilityOptions
): boolean {
  // Plan limits disabled: full access for all users
  return true;
}
