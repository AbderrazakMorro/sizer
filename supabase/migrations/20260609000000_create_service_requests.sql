-- Migration to create the service_requests table for client service requests
-- Prefix: 20260609000000

-- 1. Create status enum if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_request_status') THEN
    CREATE TYPE public.service_request_status AS ENUM (
      'draft',
      'submitted',
      'in_progress',
      'review',
      'completed',
      'cancelled'
    );
  END IF;
END
$$;

-- 2. Create service_requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  dimensions text,
  constraints text,
  status public.service_request_status NOT NULL DEFAULT 'submitted',
  attached_files jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'service_requests' AND policyname = 'Clients can manage own service requests'
  ) THEN
    CREATE POLICY "Clients can manage own service requests" ON public.service_requests
      FOR ALL
      USING (auth.uid() = client_id)
      WITH CHECK (auth.uid() = client_id);
  END IF;
END
$$;
