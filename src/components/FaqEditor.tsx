import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, HelpCircle, GripVertical } from "lucide-react";

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

interface FaqEditorProps {
  faqs: FaqItem[];
  onFaqsChange: (faqs: FaqItem[]) => void;
}

const FaqEditor = ({ faqs, onFaqsChange }: FaqEditorProps) => {
  const addFaq = () => {
    onFaqsChange([...faqs, { question: "", answer: "" }]);
  };

  const updateFaq = (index: number, updates: Partial<FaqItem>) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], ...updates };
    onFaqsChange(newFaqs);
  };

  const removeFaq = (index: number) => {
    onFaqsChange(faqs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Frequently Asked Questions
        </h3>
        <Button type="button" variant="outline" size="sm" onClick={addFaq} className="gap-2">
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {faqs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">
          No FAQs added yet. Click "Add FAQ" to create one.
        </p>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card key={index} className="border-muted">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    FAQ {index + 1}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFaq(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Question *</Label>
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFaq(index, { question: e.target.value })}
                    placeholder="e.g., What conditions does this doctor treat?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Answer *</Label>
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, { answer: e.target.value })}
                    placeholder="Write the answer here..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FaqEditor;
