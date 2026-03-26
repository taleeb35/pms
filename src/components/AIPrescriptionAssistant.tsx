import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIPrescriptionAssistantProps {
  chiefComplaint: string;
  diagnosis?: string;
  patientAge: number;
  patientGender: string;
  allergies?: string | null;
  diseases?: string | null;
  vitalSigns?: string;
  onApplySuggestion: (text: string) => void;
}

export const AIPrescriptionAssistant = ({
  chiefComplaint,
  diagnosis,
  patientAge,
  patientGender,
  allergies,
  diseases,
  vitalSigns,
  onApplySuggestion,
}: AIPrescriptionAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const { toast } = useToast();

  const generateSuggestion = async () => {
    if (!chiefComplaint && !diagnosis) {
      toast({
        title: "Missing Information",
        description: "Please enter a chief complaint or select a diagnosis first.",
        variant: "destructive",
      });
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    setSuggestion("");

    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-prescription-assistant`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          chiefComplaint,
          diagnosis,
          patientAge,
          patientGender,
          allergies,
          diseases,
          vitalSigns,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get AI suggestion");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setSuggestion(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "AI Error",
        description: error.message || "Failed to generate suggestion",
        variant: "destructive",
      });
      if (!suggestion) setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    onApplySuggestion(suggestion);
    toast({ title: "Applied", description: "AI suggestion applied to prescription" });
    setIsOpen(false);
    setSuggestion("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion);
    toast({ title: "Copied", description: "Suggestion copied to clipboard" });
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={generateSuggestion}
        disabled={isLoading}
        className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-950"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        AI Prescription Assistant
      </Button>

      {isOpen && (
        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI Suggestion
              <Badge variant="outline" className="text-[10px] border-purple-300 text-purple-600">
                For Review Only
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setIsOpen(false); setSuggestion(""); }}>
              <X className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-background rounded-md p-3 text-sm whitespace-pre-wrap min-h-[100px] max-h-[300px] overflow-y-auto border">
              {suggestion || (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing patient profile and generating suggestions...
                </div>
              )}
            </div>
            {suggestion && !isLoading && (
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={handleApply} className="gap-1 bg-purple-600 hover:bg-purple-700">
                  <Sparkles className="h-3 w-3" />
                  Apply to Prescription
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={handleCopy} className="gap-1">
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={generateSuggestion} className="gap-1">
                  Regenerate
                </Button>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">
              ⚠️ AI suggestions are for reference only. Always verify medications, dosages, and contraindications before prescribing.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
