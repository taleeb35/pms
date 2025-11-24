import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

const AdminSettings = () => {
  const [supportEmail, setSupportEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "support_email")
      .single();

    if (error) {
      console.error("Error fetching settings:", error);
      return;
    }

    if (data) {
      setSupportEmail(data.value);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("system_settings")
      .upsert({
        key: "support_email",
        value: supportEmail,
        updated_at: new Date().toISOString(),
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update support email",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Support email updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage system configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Support Email
          </CardTitle>
          <CardDescription>
            Email address where doctor inquiries will be sent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email Address</Label>
            <Input
              id="support-email"
              type="email"
              placeholder="support@example.com"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
