-- Create blogs table
CREATE TABLE public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on blogs
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blogs
-- Admins can do everything
CREATE POLICY "Admins can manage all blogs"
ON public.blogs
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Content writers can view all blogs
CREATE POLICY "Content writers can view all blogs"
ON public.blogs
FOR SELECT
USING (has_role(auth.uid(), 'content_writer'));

-- Content writers can create blogs
CREATE POLICY "Content writers can create blogs"
ON public.blogs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'content_writer') AND author_id = auth.uid());

-- Content writers can update their own blogs
CREATE POLICY "Content writers can update own blogs"
ON public.blogs
FOR UPDATE
USING (has_role(auth.uid(), 'content_writer') AND author_id = auth.uid());

-- Content writers can delete their own blogs
CREATE POLICY "Content writers can delete own blogs"
ON public.blogs
FOR DELETE
USING (has_role(auth.uid(), 'content_writer') AND author_id = auth.uid());

-- Published blogs are public
CREATE POLICY "Published blogs are public"
ON public.blogs
FOR SELECT
USING (status = 'published');

-- Create trigger for updated_at
CREATE TRIGGER update_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update RLS policies for doctors table to allow content writers full access
CREATE POLICY "Content writers can view all doctors"
ON public.doctors
FOR SELECT
USING (has_role(auth.uid(), 'content_writer'));

CREATE POLICY "Content writers can update all doctors"
ON public.doctors
FOR UPDATE
USING (has_role(auth.uid(), 'content_writer'));

CREATE POLICY "Content writers can insert doctors"
ON public.doctors
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'content_writer'));

CREATE POLICY "Content writers can delete doctors"
ON public.doctors
FOR DELETE
USING (has_role(auth.uid(), 'content_writer'));

-- Content writers need to view profiles for doctor info
CREATE POLICY "Content writers can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'content_writer'));

CREATE POLICY "Content writers can update profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'content_writer'));