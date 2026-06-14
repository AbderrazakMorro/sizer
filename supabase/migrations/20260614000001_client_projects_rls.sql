-- Migration: Add RLS policy for clients to view projects created from their service requests

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'projects' AND policyname = 'Clients can view their own service request projects'
  ) THEN
    CREATE POLICY "Clients can view their own service request projects" 
      ON public.projects 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.service_requests sr
          WHERE sr.converted_to_project_id = projects.id 
            AND sr.client_id = auth.uid()
        )
      );
  END IF;
END
$$;
