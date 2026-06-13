-- Migration: Add service request assignments and engineer management
-- This enables admins to approve requests, assign engineers, and convert to projects

-- 1. Add new status values for admin workflow
ALTER TYPE public.service_request_status ADD VALUE IF NOT EXISTS 'pending_approval';
ALTER TYPE public.service_request_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE public.service_request_status ADD VALUE IF NOT EXISTS 'assigned';
ALTER TYPE public.service_request_status ADD VALUE IF NOT EXISTS 'rejected';

-- 2. Add admin workflow columns to service_requests
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS converted_to_project_id uuid REFERENCES public.projects(id),
  ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS estimated_budget numeric(12, 2),
  ADD COLUMN IF NOT EXISTS estimated_duration_days integer,
  ADD COLUMN IF NOT EXISTS admin_notes text;

-- 3. Create service_request_assignments table for engineer assignments
CREATE TABLE IF NOT EXISTS public.service_request_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id uuid NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  engineer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid NOT NULL REFERENCES public.profiles(id),
  role text CHECK (role IN ('lead', 'support', 'consultant')) DEFAULT 'support',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(service_request_id, engineer_id)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_requests_status 
  ON public.service_requests(status);

CREATE INDEX IF NOT EXISTS idx_service_requests_priority 
  ON public.service_requests(priority);

CREATE INDEX IF NOT EXISTS idx_service_requests_approved_by 
  ON public.service_requests(approved_by);

CREATE INDEX IF NOT EXISTS idx_service_requests_converted_project 
  ON public.service_requests(converted_to_project_id);

CREATE INDEX IF NOT EXISTS idx_service_request_assignments_request 
  ON public.service_request_assignments(service_request_id);

CREATE INDEX IF NOT EXISTS idx_service_request_assignments_engineer 
  ON public.service_request_assignments(engineer_id);

-- 5. Enable RLS on assignments table
ALTER TABLE public.service_request_assignments ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for service_request_assignments

-- Admins can manage all assignments
CREATE POLICY "Admins can manage all assignments"
  ON public.service_request_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Engineers can view their own assignments
CREATE POLICY "Engineers can view own assignments"
  ON public.service_request_assignments
  FOR SELECT
  USING (engineer_id = auth.uid());

-- 7. Update RLS policies for service_requests to allow admin access

-- Admins can view and manage all service requests
CREATE POLICY "Admins can manage all service requests"
  ON public.service_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Engineers can view assigned service requests
CREATE POLICY "Engineers can view assigned requests"
  ON public.service_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.service_request_assignments
      WHERE service_request_id = id AND engineer_id = auth.uid()
    )
  );

-- 8. Create function to approve service request
CREATE OR REPLACE FUNCTION public.approve_service_request(
  p_request_id uuid,
  p_admin_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can approve service requests';
  END IF;
  
  -- Update the service request
  UPDATE public.service_requests
  SET 
    status = 'approved',
    approved_at = now(),
    approved_by = auth.uid(),
    admin_notes = COALESCE(p_admin_notes, admin_notes)
  WHERE id = p_request_id
    AND status IN ('submitted', 'pending_approval');
  
  RETURN FOUND;
END;
$$;

-- 9. Create function to reject service request
CREATE OR REPLACE FUNCTION public.reject_service_request(
  p_request_id uuid,
  p_rejection_reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can reject service requests';
  END IF;
  
  -- Update the service request
  UPDATE public.service_requests
  SET 
    status = 'rejected',
    rejected_at = now(),
    rejected_by = auth.uid(),
    rejection_reason = p_rejection_reason
  WHERE id = p_request_id
    AND status IN ('submitted', 'pending_approval', 'approved');
  
  RETURN FOUND;
END;
$$;

-- 10. Create function to assign engineers to service request
CREATE OR REPLACE FUNCTION public.assign_engineers_to_request(
  p_request_id uuid,
  p_engineer_ids uuid[],
  p_lead_engineer_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
  v_engineer_id uuid;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can assign engineers';
  END IF;
  
  -- Insert assignments
  FOREACH v_engineer_id IN ARRAY p_engineer_ids
  LOOP
    INSERT INTO public.service_request_assignments (
      service_request_id,
      engineer_id,
      assigned_by,
      role
    ) VALUES (
      p_request_id,
      v_engineer_id,
      auth.uid(),
      CASE WHEN v_engineer_id = p_lead_engineer_id THEN 'lead' ELSE 'support' END
    )
    ON CONFLICT (service_request_id, engineer_id) 
    DO UPDATE SET
      role = CASE WHEN v_engineer_id = p_lead_engineer_id THEN 'lead' ELSE 'support' END,
      assigned_at = now(),
      assigned_by = auth.uid();
  END LOOP;
  
  -- Update service request status
  UPDATE public.service_requests
  SET status = 'assigned'
  WHERE id = p_request_id
    AND status IN ('approved', 'assigned');
  
  RETURN true;
END;
$$;

-- 11. Create function to convert service request to project
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
    v_request.client_id,
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

-- 12. Create view for admin service request dashboard
CREATE OR REPLACE VIEW public.admin_service_requests_view AS
SELECT
  sr.id,
  sr.title,
  sr.description,
  sr.status,
  sr.priority,
  sr.created_at,
  sr.updated_at,
  sr.approved_at,
  sr.estimated_budget,
  sr.estimated_duration_days,
  sr.tracking_serial,
  sr.project_type,
  sr.budget_range,
  sr.converted_to_project_id,
  -- Client info
  COALESCE(sr.guest_name, p.full_name) as client_name,
  COALESCE(sr.guest_email, p.email) as client_email,
  COALESCE(sr.guest_phone, '') as client_phone,
  -- Approver info
  approver.full_name as approved_by_name,
  -- Assigned engineers count
  (SELECT COUNT(*) FROM public.service_request_assignments WHERE service_request_id = sr.id) as assigned_engineers_count,
  -- Lead engineer
  (
    SELECT p2.full_name 
    FROM public.service_request_assignments sra
    JOIN public.profiles p2 ON p2.id = sra.engineer_id
    WHERE sra.service_request_id = sr.id AND sra.role = 'lead'
    LIMIT 1
  ) as lead_engineer_name,
  -- Project info if converted
  proj.name as project_name,
  proj.status as project_status
FROM public.service_requests sr
LEFT JOIN public.profiles p ON p.id = sr.client_id
LEFT JOIN public.profiles approver ON approver.id = sr.approved_by
LEFT JOIN public.projects proj ON proj.id = sr.converted_to_project_id;

-- Grant access to admins only
GRANT SELECT ON public.admin_service_requests_view TO authenticated;

-- 13. Add comments for documentation
COMMENT ON TABLE public.service_request_assignments IS 
  'Tracks engineer assignments to service requests. Admins assign engineers who will work on approved requests.';

COMMENT ON FUNCTION public.approve_service_request(uuid, text) IS 
  'Approves a service request. Only admins can call this function.';

COMMENT ON FUNCTION public.reject_service_request(uuid, text) IS 
  'Rejects a service request with a reason. Only admins can call this function.';

COMMENT ON FUNCTION public.assign_engineers_to_request(uuid, uuid[], uuid) IS 
  'Assigns one or more engineers to a service request. Optionally designates a lead engineer.';

COMMENT ON FUNCTION public.convert_request_to_project(uuid, text, text) IS 
  'Converts an approved service request into an active project.';

-- Made with Bob