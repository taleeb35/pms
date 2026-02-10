import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, ArrowLeft, Clock } from "lucide-react";
import { format } from "date-fns";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author_name: string;
  published_at: string | null;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;
      setBlog(data);

      // Fetch related blogs
      const { data: related } = await supabase
        .from("blogs")
        .select("*")
        .eq("status", "published")
        .neq("slug", slug)
        .order("published_at", { ascending: false })
        .limit(3);

      setRelatedBlogs(related || []);
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const estimateReadTime = (content: string) => {
    const text = content.replace(/<[^>]*>/g, "");
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-[400px] w-full mb-8 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        {/* Article Header */}
        <article className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          <Link
            to="/blog"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {blog.published_at
                ? format(new Date(blog.published_at), "MMMM dd, yyyy")
                : format(new Date(blog.created_at), "MMMM dd, yyyy")}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {estimateReadTime(blog.content)} min read
            </span>
          </div>

          {blog.featured_image && (
            <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          )}

          {/* Blog Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <section className="bg-muted/30 py-12 md:py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((related) => (
                  <Link key={related.id} to={`/blog/${related.slug}`}>
                    <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                      <div className="h-40 overflow-hidden bg-muted">
                        {related.featured_image ? (
                          <img
                            src={related.featured_image}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                            <span className="text-3xl font-bold text-primary/30">
                              {related.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          {related.published_at
                            ? format(new Date(related.published_at), "MMM dd, yyyy")
                            : format(new Date(related.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};

export default BlogPost;
