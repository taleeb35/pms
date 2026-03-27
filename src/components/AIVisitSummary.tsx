import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Loader2, Copy, Check, Printer, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIVisitSummaryProps {
  patientName: string;
  patientAge: number;
  patientGender: string;
  bloodGroup?: string | null;
  allergies?: string | null;
  diseases?: string | null;
  chiefComplaint?: string;
  diagnosis?: string;
  prescription?: string;
  vitalSigns?: string;
  testReports?: string;
  nextVisitNotes?: string;
  nextVisitDate?: string;
}

export const AIVisitSummary = ({
  patientName,
  patientAge,
  patientGender,
  bloodGroup,
  allergies,
  diseases,
  chiefComplaint,
  diagnosis,
  prescription,
  vitalSigns,
  testReports,
  nextVisitNotes,
  nextVisitDate,
}: AIVisitSummaryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const generateSummary = async () => {
    if (!chiefComplaint && !prescription && !diagnosis) {
      toast({
        title: "Insufficient data",
        description: "Please fill in at least a chief complaint, diagnosis, or prescription before generating a summary.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSummary("");
    setIsOpen(true);

    abortRef.current = new AbortController();

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-visit-summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            patientName,
            patientAge,
            patientGender,
            bloodGroup,
            allergies,
            diseases,
            chiefComplaint,
            diagnosis,
            prescription,
            vitalSigns,
            testReports,
            nextVisitNotes,
            nextVisitDate,
          }),
          signal: abortRef.current.signal,
        }
      );

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "AI service error" }));
        throw new Error(errData.error || "Failed to generate summary");
      }

      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

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
              setSummary(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setSummary(fullText);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast({
          title: "Error generating summary",
          description: err.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Visit Summary - ${patientName}</title>
          <style>
            @page { margin: 2cm; size: A4; }
            body { font-family: 'Segoe UI', sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a2e; max-width: 700px; margin: 0 auto; padding: 20px; }
            h1 { font-size: 18pt; color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 8px; }
            h2 { font-size: 13pt; color: #0f766e; margin-top: 16px; }
            h3 { font-size: 11pt; color: #334155; margin-top: 12px; }
            ul, ol { padding-left: 20px; }
            li { margin-bottom: 4px; }
            p { margin: 6px 0; }
            .meta { font-size: 9pt; color: #64748b; margin-top: 30px; border-top: 1px dashed #e2e8f0; padding-top: 10px; text-align: center; }
            strong { color: #1e293b; }
          </style>
        </head>
        <body>
          <h1>Clinical Visit Summary</h1>
          ${summary.replace(/\n/g, "<br/>")}
          <div class="meta">Generated on ${new Date().toLocaleString()} — AI-assisted summary for doctor review</div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleCancel = () => {
    if (abortRef.current) abortRef.current.abort();
    setLoading(false);
  };

  const handleClose = () => {
    handleCancel();
    setIsOpen(false);
    setSummary("");
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={generateSummary}
        className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
      >
        <Sparkles className="h-4 w-4" />
        AI Summary
      </Button>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            AI Visit Summary
            <Badge variant="secondary" className="text-[10px]">AI Generated</Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            {loading && (
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancel}>
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
            {!loading && summary && (
              <>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrint}>
                  <Printer className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={generateSummary}>
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !summary && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating clinical summary...
          </div>
        )}
        {summary && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</div>
            {loading && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Still generating...
              </div>
            )}
          </div>
        )}
        {!loading && summary && (
          <p className="text-[10px] text-muted-foreground mt-3 italic">
            ⚠️ AI-generated summary — review and verify before adding to patient records.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
