import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, ChevronDown, ChevronUp, Copy, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIPatientInsightsProps {
  patientId: string;
  patientName: string;
}

const AIPatientInsights = ({ patientId, patientName }: AIPatientInsightsProps) => {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();
  const abortRef = useRef<AbortController | null>(null);

  const generateInsights = async () => {
    if (loading) return;
    setLoading(true);
    setInsights("");
    setIsOpen(true);

    try {
      abortRef.current = new AbortController();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please log in to use AI insights", variant: "destructive" });
        setLoading(false);
        return;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/ai-patient-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ patientId }),
          signal: abortRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                accumulated += content;
                setInsights(accumulated);
              }
            } catch {
              // skip parse errors
            }
          }
        }
      }

      setHasGenerated(true);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      toast({
        title: "Failed to generate insights",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(insights);
    toast({ title: "Copied to clipboard" });
  };

  // Simple markdown renderer
  const renderMarkdown = (text: string) => {
    return text
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("### ")) {
          return <h3 key={i} className="text-base font-bold mt-4 mb-1">{line.replace("### ", "")}</h3>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace("## ", "")}</h2>;
        }
        if (line.startsWith("# ")) {
          return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace("# ", "")}</h1>;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={i} className="ml-4 list-disc text-sm leading-relaxed">
              {line.replace(/^[-*] /, "").split("**").map((part, j) =>
                j % 2 === 1 ? <strong key={j}>{part}</strong> : part
              )}
            </li>
          );
        }
        if (line.trim() === "") return <br key={i} />;
        return (
          <p key={i} className="text-sm leading-relaxed">
            {line.split("**").map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </p>
        );
      });
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Patient Insights
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={hasGenerated ? "outline" : "default"}
                onClick={generateInsights}
                disabled={loading}
                className="gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Analyzing...
                  </>
                ) : hasGenerated ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </>
                ) : (
                  <>
                    <Brain className="h-3.5 w-3.5" />
                    Generate Insights
                  </>
                )}
              </Button>
              {hasGenerated && (
                <>
                  <Button size="sm" variant="ghost" onClick={handleCopy}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button size="sm" variant="ghost">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </>
              )}
            </div>
          </div>
          {!hasGenerated && !loading && (
            <p className="text-xs text-muted-foreground mt-1">
              AI analyzes {patientName}'s complete medical history, visits, and prescriptions
            </p>
          )}
        </CardHeader>
        <CollapsibleContent>
          {(insights || loading) && (
            <CardContent className="pt-0">
              <div className="bg-background rounded-lg border p-4 max-h-[500px] overflow-y-auto prose prose-sm">
                {insights ? renderMarkdown(insights) : (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing patient data across all visits, records, and prescriptions...
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AIPatientInsights;
