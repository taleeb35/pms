import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, ArrowRight } from "lucide-react";
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

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getExcerpt = (blog: Blog) => {
    if (blog.excerpt) return blog.excerpt;
    return stripHtml(blog.content).substring(0, 150) + "...";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest healthcare insights, tips, and news from our experts.
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">No blog posts available yet.</p>
                <p className="text-muted-foreground mt-2">Check back soon for new content!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                  <Link key={blog.id} to={`/blog/${blog.slug}`}>
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-border/50 hover:border-primary/30">
                      <div className="relative h-48 overflow-hidden bg-muted">
                        {blog.featured_image ? (
                          <img
                            src={blog.featured_image}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                            <span className="text-4xl font-bold text-primary/30">
                              {blog.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {blog.published_at
                              ? format(new Date(blog.published_at), "MMM dd, yyyy")
                              : format(new Date(blog.created_at), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {blog.title}
                        </h2>
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                          {getExcerpt(blog)}
                        </p>
                        <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                          Read More <ArrowRight className="h-4 w-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Blogs;
