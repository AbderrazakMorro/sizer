/**
 * Storage limit check for upload APIs.
 * Uses user_storage_usage (bytes_used) and get_effective_plan (effective_storage_limit_mb).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const BYTES_PER_MB = 1024 * 1024;
const DEFAULT_LIMIT_MB = 500;

export interface StorageLimitResult {
  allowed: boolean;
  currentUsed: number;
  limitBytes: number;
  limitMb: number;
}

/**
 * Storage limit check disabled — always allows uploads.
 */
export async function checkStorageLimit(
  _supabase: SupabaseClient,
  _userId: string,
  _addBytes: number,
  _overrideCurrentUsed?: number
): Promise<StorageLimitResult> {
  // Plan limits disabled: storage is always unlimited
  return {
    allowed: true,
    currentUsed: 0,
    limitBytes: Number.MAX_SAFE_INTEGER,
    limitMb: -1,
  };
}
