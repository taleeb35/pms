import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2, Bot, User, Trash2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  role: "clinic" | "doctor";
}

const CLINIC_SUGGESTIONS = [
  "How many patients did we see today?",
  "What's our revenue this month vs last?",
  "Which doctor has the most appointments?",
  "What are our top expense categories?",
  "How is our clinic performing overall?",
  "Any doctors with no appointments today?",
];

const DOCTOR_SUGGESTIONS = [
  "How many patients do I have today?",
  "What's my revenue this month?",
  "How many patients are on my waitlist?",
  "Compare my revenue to last month",
  "What complaints are patients coming with today?",
  "How many pending appointments do I have?",
];

const AIChatbot = ({ role }: AIChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const suggestions = role === "clinic" ? CLINIC_SUGGESTIONS : DOCTOR_SUGGESTIONS;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", timestamp: new Date() }]);

    try {
      abortRef.current = new AbortController();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please log in", variant: "destructive" });
        setLoading(false);
        return;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/ai-clinic-chatbot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ question: question.trim(), role }),
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
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
                );
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: "Sorry, I couldn't process your question. Please try again." } : m
        )
      );
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("### ")) return <h3 key={i} className="font-bold text-sm mt-2">{line.replace("### ", "")}</h3>;
      if (line.startsWith("## ")) return <h2 key={i} className="font-bold text-sm mt-2">{line.replace("## ", "")}</h2>;
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={i} className="ml-3 list-disc text-xs leading-relaxed">
            {line.replace(/^[-*] /, "").split("**").map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </li>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return (
        <p key={i} className="text-xs leading-relaxed">
          {line.split("**").map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        >
          <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-success rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[600px] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          <Card className="flex flex-col h-[580px] shadow-2xl border-primary/20">
            {/* Header */}
            <CardHeader className="pb-2 pt-4 px-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">AI Assistant</CardTitle>
                    <p className="text-[10px] text-muted-foreground">
                      {role === "clinic" ? "Clinic Intelligence" : "Doctor Assistant"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={clearChat}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                      Hi! 👋 I'm your AI assistant. Ask me anything about your {role === "clinic" ? "clinic's" : ""} patients, appointments, revenue, or operations.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-1">Suggested questions</p>
                    {suggestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q)}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary/30 transition-colors text-foreground/80"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10"
                    }`}>
                      {msg.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3 text-primary" />}
                    </div>
                    <div className={`max-w-[85%] rounded-lg p-2.5 ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted/50"
                    }`}>
                      {msg.role === "user" ? (
                        <p className="text-xs">{msg.content}</p>
                      ) : msg.content ? (
                        <div className="prose-sm">{renderContent(msg.content)}</div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          <span className="text-xs text-muted-foreground">Thinking...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="p-3 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your data..."
                  className="text-xs h-9"
                  disabled={loading}
                />
                <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!input.trim() || loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
