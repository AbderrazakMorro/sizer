-- Migration: Fix RLS for architects to view clients linked to their assigned converted projects

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'clients'
      AND policyname = 'Architects can view clients for their assigned projects'
  ) THEN
    CREATE POLICY "Architects can view clients for their assigned projects"
      ON public.clients
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.projects proj
          JOIN public.service_requests sr
            ON sr.converted_to_project_id = proj.id
          JOIN public.service_request_assignments sra
            ON sra.service_request_id = sr.id
          WHERE proj.client_id = clients.id
            AND sra.engineer_id = auth.uid()
        )
      );
  END IF;
END
$$;

