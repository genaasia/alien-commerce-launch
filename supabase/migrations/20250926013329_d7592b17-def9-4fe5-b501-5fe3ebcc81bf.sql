-- Create page_views table for tracking website visits
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert page views (for tracking)
CREATE POLICY "Allow public page view tracking" 
ON public.page_views 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading page views (you may want to restrict this later)
CREATE POLICY "Allow reading page views" 
ON public.page_views 
FOR SELECT 
USING (true);

-- Create index for better performance on common queries
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_path ON public.page_views(path);