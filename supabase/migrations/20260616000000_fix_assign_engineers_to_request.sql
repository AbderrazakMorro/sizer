-- Migration: Fix assign_engineers_to_request to raise clear error on bad status
-- and allow assignment for all active statuses (not just 'approved'/'assigned')
-- Prefix: 20260616000000

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
  v_current_status text;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can assign engineers';
  END IF;

  -- Get current status of the service request
  SELECT status::text INTO v_current_status
  FROM public.service_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service request not found: %', p_request_id;
  END IF;

  -- Block assignment only for terminal/rejected states
  IF v_current_status IN ('rejected', 'cancelled', 'completed') THEN
    RAISE EXCEPTION 'Cannot assign architects to a request with status "%". The request must be active (submitted, approved, or assigned).', v_current_status;
  END IF;

  -- Insert assignments (upsert to handle re-assignment)
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
  
  -- Update service request status to 'assigned'
  -- (only if currently in a state that allows this progression)
  UPDATE public.service_requests
  SET status = 'assigned'
  WHERE id = p_request_id
    AND status::text NOT IN ('rejected', 'cancelled', 'completed', 'in_progress');
  
  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.assign_engineers_to_request(uuid, uuid[], uuid) IS 
  'Assigns one or more architects/engineers to a service request. Raises an exception for rejected/cancelled/completed requests. Optionally designates a lead architect.';
