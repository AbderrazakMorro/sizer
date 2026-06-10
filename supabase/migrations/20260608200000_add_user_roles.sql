-- Migration to add user roles enum and table
-- Prefix: 20260608200000

-- 1. Create type user_role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('client', 'architect', 'site_manager', 'admin');
  END IF;
END
$$;

-- 2. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.user_role NOT NULL DEFAULT 'client',
  assigned_at timestamptz DEFAULT now() NOT NULL,
  assigned_by uuid REFERENCES public.profiles(id),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Function to check if a user has a role (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.has_role(check_role public.user_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = check_role
  );
$$;

-- 4. RLS policies on user_roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view own roles'
  ) THEN
    CREATE POLICY "Users can view own roles" ON public.user_roles
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can manage roles'
  ) THEN
    CREATE POLICY "Admins can manage roles" ON public.user_roles
      FOR ALL USING (public.has_role('admin'));
  END IF;
END
$$;

-- 5. Modify ensure_profile_and_account_settings_from_auth to assign 'client' by default
CREATE OR REPLACE FUNCTION public.ensure_profile_and_account_settings_from_auth(p_user auth.users)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lang text;
BEGIN
  -- Profile creation
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user.id) THEN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
      p_user.id,
      p_user.email,
      p_user.raw_user_meta_data->>'full_name',
      p_user.raw_user_meta_data->>'avatar_url'
    );
  END IF;

  -- Default role assignment (client)
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_user.id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user.id, 'client');
  END IF;

  -- Account settings creation
  v_lang := p_user.raw_user_meta_data->>'lang';
  IF v_lang IS NULL OR v_lang NOT IN ('en', 'fr') THEN
    v_lang := 'fr'; -- Default to French
  END IF;

  INSERT INTO public.account_settings (user_id, lang, date_format, default_currency)
  VALUES (p_user.id, v_lang, 'DD/MM/YYYY', 'MAD') -- Default to MAD for Moroccan users
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;
