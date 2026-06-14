-- Migration: Fix convert_request_to_project client foreign key constraint
-- Prefix: 20260614000002

CREATE OR REPLACE FUNCTION public.convert_request_to_project(
  p_request_id uuid,
  p_project_name text DEFAULT NULL,
  p_project_description text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
  v_request record;
  v_project_id uuid;
  v_client_id uuid;
  v_client_email text;
  v_client_name text;
  v_client_phone text;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can convert requests to projects';
  END IF;
  
  -- Get service request details
  SELECT * INTO v_request
  FROM public.service_requests
  WHERE id = p_request_id
    AND status IN ('approved', 'assigned')
    AND converted_to_project_id IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service request not found or already converted';
  END IF;

  -- Get client profile info if client_id is not null
  IF v_request.client_id IS NOT NULL THEN
    SELECT email, full_name INTO v_client_email, v_client_name
    FROM public.profiles
    WHERE id = v_request.client_id;
  END IF;

  -- Override with guest details if present
  v_client_name := COALESCE(v_request.guest_name, v_client_name, 'Client');
  v_client_email := COALESCE(v_request.guest_email, v_client_email);
  v_client_phone := COALESCE(v_request.guest_phone, '');

  -- Find or create client in the public.clients table (owned by auth.uid(), which is the admin converting the request)
  SELECT id INTO v_client_id
  FROM public.clients
  WHERE user_id = auth.uid()
    AND (
      (email IS NOT NULL AND email = v_client_email)
      OR (full_name = v_client_name)
    )
  LIMIT 1;

  IF v_client_id IS NULL THEN
    INSERT INTO public.clients (full_name, email, phone, user_id)
    VALUES (v_client_name, v_client_email, v_client_phone, auth.uid())
    RETURNING id INTO v_client_id;
  END IF;
  
  -- Create the project
  INSERT INTO public.projects (
    name,
    description,
    status,
    client_id,
    user_id,
    start_date,
    phase
  ) VALUES (
    COALESCE(p_project_name, v_request.title),
    COALESCE(p_project_description, v_request.description),
    'active',
    v_client_id,
    auth.uid(),
    CURRENT_DATE,
    'diagnosis'
  )
  RETURNING id INTO v_project_id;
  
  -- Link service request to project
  UPDATE public.service_requests
  SET 
    converted_to_project_id = v_project_id,
    status = 'in_progress'
  WHERE id = p_request_id;
  
  RETURN v_project_id;
END;
$$;
