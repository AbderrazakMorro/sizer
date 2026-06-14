-- Enable RLS on products table if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to products
-- This allows clients to view the product catalog when making service requests
CREATE POLICY "Public read access to products catalog"
  ON public.products
  FOR SELECT
  USING (true);

-- Note: This allows anyone to read products, which is appropriate for a catalog
-- Write operations are still protected by existing policies

-- Made with Bob
