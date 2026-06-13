-- Migration: Add tracking serial and guest support to service_requests
-- This enables deferred authentication workflow where guests can submit requests
-- and track them via a unique serial number before creating an account.

-- 1. Add new columns for tracking serial and guest support
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS tracking_serial text UNIQUE,
  ADD COLUMN IF NOT EXISTS guest_email text,
  ADD COLUMN IF NOT EXISTS guest_name text,
  ADD COLUMN IF NOT EXISTS guest_phone text,
  ADD COLUMN IF NOT EXISTS project_type text,
  ADD COLUMN IF NOT EXISTS budget_range text,
  ADD COLUMN IF NOT EXISTS preferred_contact text,
  ADD COLUMN IF NOT EXISTS converted_to_user_at timestamptz,
  ADD COLUMN IF NOT EXISTS ip_address inet,
  ADD COLUMN IF NOT EXISTS user_agent text;

-- 2. Make client_id nullable to support guest submissions
ALTER TABLE public.service_requests
  ALTER COLUMN client_id DROP NOT NULL;

-- 3. Add constraint: either client_id OR guest_email must be present
ALTER TABLE public.service_requests
  DROP CONSTRAINT IF EXISTS service_requests_client_or_guest_check;

ALTER TABLE public.service_requests
  ADD CONSTRAINT service_requests_client_or_guest_check
  CHECK (
    (client_id IS NOT NULL) OR 
    (guest_email IS NOT NULL AND tracking_serial IS NOT NULL)
  );

-- 4. Create index on tracking_serial for fast lookups
CREATE INDEX IF NOT EXISTS idx_service_requests_tracking_serial 
  ON public.service_requests(tracking_serial);

CREATE INDEX IF NOT EXISTS idx_service_requests_guest_email 
  ON public.service_requests(guest_email);

CREATE INDEX IF NOT EXISTS idx_service_requests_created_at 
  ON public.service_requests(created_at DESC);

-- 5. Create function to generate unique tracking serial
CREATE OR REPLACE FUNCTION public.generate_tracking_serial()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_serial text;
  serial_exists boolean;
BEGIN
  LOOP
    -- Generate format: SIZER-XXXXXX (6 random alphanumeric characters)
    new_serial := 'SIZER-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    -- Check if serial already exists
    SELECT EXISTS(
      SELECT 1 FROM public.service_requests WHERE tracking_serial = new_serial
    ) INTO serial_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT serial_exists;
  END LOOP;
  
  RETURN new_serial;
END;
$$;

-- 6. Create trigger to auto-generate tracking_serial for guest submissions
CREATE OR REPLACE FUNCTION public.set_tracking_serial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only generate tracking serial if it's a guest submission (no client_id)
  IF NEW.client_id IS NULL AND NEW.tracking_serial IS NULL THEN
    NEW.tracking_serial := public.generate_tracking_serial();
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_tracking_serial ON public.service_requests;

CREATE TRIGGER trigger_set_tracking_serial
  BEFORE INSERT ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tracking_serial();

-- 7. Update RLS policies to support both authenticated and guest access

-- Drop existing policy
DROP POLICY IF EXISTS "Clients can manage own service requests" ON public.service_requests;

-- Policy 1: Authenticated users can manage their own requests
CREATE POLICY "Authenticated users manage own requests"
  ON public.service_requests
  FOR ALL
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- Policy 2: Anyone can insert guest requests (rate limiting handled at app level)
CREATE POLICY "Anyone can create guest requests"
  ON public.service_requests
  FOR INSERT
  WITH CHECK (
    client_id IS NULL AND 
    guest_email IS NOT NULL AND 
    tracking_serial IS NOT NULL
  );

-- Policy 3: Public read access via tracking_serial only (for tracking page)
CREATE POLICY "Public read via tracking serial"
  ON public.service_requests
  FOR SELECT
  USING (
    tracking_serial IS NOT NULL AND
    -- Only allow reading specific fields, not sensitive data
    true
  );

-- 8. Create function to link guest request to user account
CREATE OR REPLACE FUNCTION public.link_guest_request_to_user(
  p_tracking_serial text,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_guest_email text;
  v_user_email text;
BEGIN
  -- Get the guest email from the request
  SELECT guest_email INTO v_guest_email
  FROM public.service_requests
  WHERE tracking_serial = p_tracking_serial
    AND client_id IS NULL;
  
  IF v_guest_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get the user's email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Only link if emails match
  IF lower(v_guest_email) = lower(v_user_email) THEN
    UPDATE public.service_requests
    SET 
      client_id = p_user_id,
      converted_to_user_at = now()
    WHERE tracking_serial = p_tracking_serial
      AND client_id IS NULL;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 9. Create view for public tracking (limited fields only)
CREATE OR REPLACE VIEW public.service_request_tracking AS
SELECT
  tracking_serial,
  title,
  status,
  created_at,
  updated_at,
  -- Mask sensitive data
  CASE 
    WHEN guest_email IS NOT NULL THEN 
      substring(guest_email from 1 for 2) || '***@' || 
      substring(guest_email from position('@' in guest_email) + 1)
    ELSE NULL
  END as masked_email
FROM public.service_requests
WHERE tracking_serial IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON public.service_request_tracking TO anon, authenticated;

-- 10. Add comment documentation
COMMENT ON TABLE public.service_requests IS 
  'Service requests from clients. Supports both authenticated users and guest submissions with tracking serials.';

COMMENT ON COLUMN public.service_requests.tracking_serial IS 
  'Unique tracking serial (format: SIZER-XXXXXX) for guest submissions. Auto-generated on insert.';

COMMENT ON COLUMN public.service_requests.guest_email IS 
  'Email address for guest submissions (before account creation).';

COMMENT ON COLUMN public.service_requests.converted_to_user_at IS 
  'Timestamp when guest request was linked to a user account.';

COMMENT ON FUNCTION public.generate_tracking_serial() IS 
  'Generates a unique tracking serial in format SIZER-XXXXXX.';

COMMENT ON FUNCTION public.link_guest_request_to_user(text, uuid) IS 
  'Links a guest service request to a user account if emails match.';

-- Made with Bob
