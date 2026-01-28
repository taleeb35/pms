import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, FileText, PenLine, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import clinicLogo from "@/assets/main-logo.webp";
import DashboardSkeleton from "@/components/DashboardSkeleton";

const ContentWriterDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [publishedBlogs, setPublishedBlogs] = useState(0);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setUserName(profile.full_name);
        }
      }

      const { count: doctorCount } = await supabase
        .from("doctors")
        .select("id", { count: "exact", head: true });

      const { count: blogCount } = await supabase
        .from("blogs")
        .select("id", { count: "exact", head: true });

      const { count: publishedCount } = await supabase
        .from("blogs")
        .select("id", { count: "exact", head: true })
        .eq("status", "published");

      setTotalDoctors(doctorCount || 0);
      setTotalBlogs(blogCount || 0);
      setPublishedBlogs(publishedCount || 0);
    } finally {
      setLoading(false);
    }
  };

  const today = format(new Date(), "EEEE, dd MMM yyyy");

  if (loading) {
    return <DashboardSkeleton statsCount={3} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-primary/5 via-info/5 to-success/5 border-2 border-border/40 p-8 overflow-hidden group hover:shadow-xl transition-all duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-info/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative group/logo">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-info/20 rounded-2xl blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-4 shadow-lg group-hover/logo:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-primary/10">
                <img src={clinicLogo} alt="Zonoir" className="main_logo new_logo" />
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-warning animate-pulse opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-info/10 text-info border-info/20 shadow-sm hover:shadow-md transition-shadow">
                  <PenLine className="h-3 w-3 mr-1" />
                  Content Writer
                </Badge>
                <div className="h-1 w-1 rounded-full bg-border"></div>
                <span className="text-xs font-medium text-muted-foreground">{today}</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text">
                Welcome, {userName || "Content Writer"}
              </h2>
              <p className="text-muted-foreground text-base max-w-2xl">
                Manage doctor profiles and blog content
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-all border-border/40" onClick={() => navigate("/content-writer/doctors")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Doctors</CardTitle>
            <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{totalDoctors}</div>
            <p className="text-xs text-muted-foreground">Doctor profiles</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all border-border/40" onClick={() => navigate("/content-writer/blogs")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Blogs</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{totalBlogs}</div>
            <p className="text-xs text-muted-foreground">Blog posts</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all border-border/40" onClick={() => navigate("/content-writer/blogs")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{publishedBlogs}</div>
            <p className="text-xs text-muted-foreground">Live articles</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <PenLine className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={() => navigate("/content-writer/blogs")} 
              className="w-full justify-start h-auto py-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">Manage Blogs</div>
                  <div className="text-sm text-muted-foreground">Create and edit blog posts</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline" 
              onClick={() => navigate("/content-writer/doctors")} 
              className="w-full justify-start h-auto py-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                  <Stethoscope className="h-5 w-5 text-info" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">Manage Doctors</div>
                  <div className="text-sm text-muted-foreground">Edit doctor profiles</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentWriterDashboard;
