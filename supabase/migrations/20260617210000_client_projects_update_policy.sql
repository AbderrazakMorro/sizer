-- Migration: Allow clients to update projects linked to their service requests

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'projects'
      AND policyname = 'Clients can update their own service request projects'
  ) THEN
    CREATE POLICY "Clients can update their own service request projects"
      ON public.projects
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.service_requests sr
          WHERE sr.converted_to_project_id = projects.id
            AND sr.client_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.service_requests sr
          WHERE sr.converted_to_project_id = projects.id
            AND sr.client_id = auth.uid()
        )
      );
  END IF;
END
$$;
