-- Migration to update the account_settings lang check constraint to allow 'fr'
-- Prefix: 20260610214500

-- Drop the existing check constraint
ALTER TABLE public.account_settings
  DROP CONSTRAINT IF EXISTS account_settings_lang_check;

-- Re-add the check constraint allowing 'en', 'es', and 'fr'
ALTER TABLE public.account_settings
  ADD CONSTRAINT account_settings_lang_check CHECK (lang IN ('en', 'es', 'fr'));
