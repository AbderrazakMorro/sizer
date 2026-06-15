-- Migration: Custom password reset OTP tokens
-- Stores hashed 6-digit codes and the reset session ID (set after OTP verification)
-- All access is via service role — no RLS policies for anon/authenticated roles.

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email                     text        NOT NULL,
  code_hash                 text        NOT NULL,           -- SHA-256 of the 6-digit OTP
  expires_at                timestamptz NOT NULL,           -- 15 minutes from creation
  used_at                   timestamptz,                    -- set when OTP is consumed
  reset_session_id          text,                          -- set after OTP verified; value stored in httpOnly cookie
  reset_session_expires_at  timestamptz,                   -- 30 minutes from OTP verification
  created_at                timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
-- No SELECT / INSERT / UPDATE / DELETE policies for anon or authenticated roles.
-- All mutations are performed by the service role via Route Handlers.

-- Index: fast lookup by email when validating OTP
CREATE INDEX IF NOT EXISTS idx_prt_email_expires
  ON public.password_reset_tokens (email, expires_at);

-- Index: fast lookup by reset_session_id when confirming password change
CREATE INDEX IF NOT EXISTS idx_prt_reset_session
  ON public.password_reset_tokens (reset_session_id);

