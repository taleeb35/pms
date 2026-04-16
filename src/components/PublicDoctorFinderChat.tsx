import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, X, Send, MapPin, Stethoscope, Search, ArrowLeft, User, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { generateDoctorProfileUrl, generateDoctorSlug } from "@/lib/slugUtils";
import { useNavigate } from "react-router-dom";

interface DoctorClinic {
  clinic_name: string;
  clinic_location?: string;
  fee?: number | null;
  timing?: string | null;
  today_timing?: string | null;
}

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  city: string | null;
  qualification?: string;
  experience_years?: number;
  avatar_url?: string | null;
  clinic_name?: string;
  clinic_location?: string;
  consultation_fee?: number | null;
  timing?: string | null;
  today_timing?: string | null;
  introduction?: string | null;
  all_clinics?: DoctorClinic[];
  source: string;
}

interface ChatMessage {
  id: string;
  type: "bot" | "user";
  text: string;
  doctors?: Doctor[];
  options?: { label: string; value: string; icon?: "city" | "specialty" }[];
  step?: string;
}

const CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
  "Hyderabad", "Bahawalpur", "Sargodha", "Sukkur", "Abbottabad",
];

const POPULAR_SPECIALTIES = [
  "General Physician", "Dermatologist", "Gynecologist", "Cardiologist",
  "Orthopedic Surgeon", "Pediatrician", "ENT Specialist", "Dentist",
  "Neurologist", "Ophthalmologist", "Psychiatrist", "Gastroenterologist",
];

export const PublicDoctorFinderChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [step, setStep] = useState<"welcome" | "city" | "specialty" | "results" | "free_chat" | "search_name">("welcome");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Only show on public pages
  const dashboardPaths = ["/dashboard", "/patients", "/appointments", "/admin", "/receptionist", "/content-writer", "/referral-partner/dashboard"];
  const dashboardPrefixes = ["/clinic/", "/admin/", "/receptionist/", "/content-writer/", "/referral-partner/dashboard"];
  const isDoctorDashboard = /^\/doctor\/(dashboard|patients|appointments|profile|schedule|finance|reports|subscription|support|walk-in|templates|diseases|allergies|icd-codes|procedures|receptionists|activity-logs)/.test(location.pathname) || /^\/doctor-receptionist\//.test(location.pathname);
  const isDashboard = isDoctorDashboard || dashboardPrefixes.some(p => location.pathname.startsWith(p)) || dashboardPaths.includes(location.pathname);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        type: "bot",
        text: "👋 Hi! I'm your Doctor Finder assistant. I can help you find the right doctor in your city.\n\nHow would you like to search?",
        options: [
          { label: "🏙️ Browse by City", value: "browse_city", icon: "city" },
          { label: "🔍 Search by Name", value: "search_name" },
          { label: "💬 Describe what you need", value: "free_chat" },
        ],
        step: "welcome",
      }]);
    }
  }, [isOpen]);

  if (isDashboard) return null;

  const addBotMessage = (text: string, extras?: Partial<ChatMessage>) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      type: "bot",
      text,
      ...extras,
    };
    setMessages(prev => [...prev, msg]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type: "user", text }]);
  };

  const handleOptionClick = async (value: string, label: string) => {
    if (value === "browse_city") {
      addUserMessage("Browse by City");
      setStep("city");
      addBotMessage("📍 Please select your city:", {
        options: CITIES.map(c => ({ label: c, value: c, icon: "city" as const })),
        step: "city",
      });
    } else if (value === "search_name") {
      addUserMessage("Search by Name");
      setStep("search_name");
      addBotMessage("🔍 Type the doctor's name below and I'll find them for you:");
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (value === "free_chat") {
      addUserMessage("Describe what I need");
      setStep("free_chat");
      addBotMessage("Tell me what kind of doctor you need and which city — for example:\n\n• \"I need a skin doctor in Lahore\"\n• \"Best cardiologist in Karachi\"\n• \"Child specialist near Islamabad\"");
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (step === "city" || CITIES.includes(value)) {
      addUserMessage(value);
      setSelectedCity(value);
      setStep("specialty");
      await fetchSpecializations(value);
    } else if (step === "specialty") {
      addUserMessage(value);
      setSelectedSpecialty(value);
      setStep("results");
      // If user selected a specialty from AI suggestions without a city set, use AI search
      if (!selectedCity) {
        await handleAISearch(`${value} doctor`);
      } else {
        await searchDoctors(selectedCity, value, null);
      }
    }
  };

  const fetchSpecializations = async (city: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/find-doctor-chatbot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ action: "get_specializations", city }),
        }
      );
      const data = await res.json();
      const specs: string[] = data.specializations || [];

      // Show popular ones first, then rest
      const popular = POPULAR_SPECIALTIES.filter(s => specs.includes(s));
      const others = specs.filter(s => !popular.includes(s));
      const allSpecs = [...popular, ...others];

      addBotMessage(`Great! Here are the available specializations in **${city}**.\n\nSelect one or type to search:`, {
        options: allSpecs.map(s => ({ label: s, value: s, icon: "specialty" as const })),
        step: "specialty",
      });
    } catch {
      addBotMessage("Sorry, I couldn't load specializations. Please try again or type what you need.");
    } finally {
      setLoading(false);
    }
  };

  const searchDoctors = async (city: string | null, specialization: string | null, name: string | null) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/find-doctor-chatbot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ action: "search_doctors", city, specialization, name }),
        }
      );
      const data = await res.json();
      const doctors: Doctor[] = data.doctors || [];

      if (doctors.length === 0) {
        addBotMessage("😔 No doctors found matching your criteria. Try a different specialization or city.", {
          options: [
            { label: "🔄 Start Over", value: "browse_city" },
            { label: "💬 Try different search", value: "free_chat" },
          ],
        });
      } else {
        const cityText = city ? ` in ${city}` : "";
        const specText = specialization ? ` ${specialization}` : "";
        addBotMessage(`Found **${doctors.length}${specText}** doctor${doctors.length > 1 ? "s" : ""}${cityText}:`, {
          doctors,
        });
        // Add restart options after results
        setTimeout(() => {
          addBotMessage("Need more help?", {
            options: [
              { label: "🔄 New Search", value: "browse_city" },
              { label: "💬 Ask something else", value: "free_chat" },
            ],
          });
        }, 500);
      }
    } catch {
      addBotMessage("Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAISearch = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/find-doctor-chatbot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ action: "ai_search", name: query }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        addBotMessage(errData.error || "Something went wrong. Please try again.");
        return;
      }

      const data = await res.json();
      const doctors: Doctor[] = data.doctors || [];

      if (data.response_text) {
        if (doctors.length > 0) {
          addBotMessage(data.response_text, { doctors });
          setTimeout(() => {
            addBotMessage("Need more help?", {
              options: [
                { label: "🔄 New Search", value: "browse_city" },
                { label: "💬 Ask something else", value: "free_chat" },
              ],
            });
          }, 500);
        } else {
          // Show available specializations as clickable options if provided
          const availableSpecs: string[] = data.available_specializations || [];
          const options = availableSpecs.length > 0
            ? availableSpecs.slice(0, 8).map((s: string) => ({ label: s, value: s, icon: "specialty" as const }))
            : [
                { label: "🏙️ Browse by City", value: "browse_city" },
                { label: "💬 Try different search", value: "free_chat" },
              ];
          
          addBotMessage(data.response_text, { options, step: availableSpecs.length > 0 ? "specialty" : undefined });
        }
      } else if (doctors.length === 0) {
        addBotMessage("😔 I couldn't find any matching doctors. Try a different search.", {
          options: [
            { label: "🏙️ Browse by City", value: "browse_city" },
            { label: "💬 Try different search", value: "free_chat" },
          ],
        });
      }
    } catch {
      addBotMessage("Sorry, I couldn't process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || loading) return;
    setInputValue("");
    addUserMessage(text);

    if (step === "free_chat" || step === "welcome" || step === "results") {
      await handleAISearch(text);
    } else if (step === "specialty") {
      // User typed a specialty instead of clicking
      setSelectedSpecialty(text);
      setStep("results");
      await searchDoctors(selectedCity, text, null);
    } else if (step === "city") {
      // Check if user typed a city name
      const matchedCity = CITIES.find(c => c.toLowerCase() === text.toLowerCase());
      if (matchedCity) {
        setSelectedCity(matchedCity);
        setStep("specialty");
        await fetchSpecializations(matchedCity);
      } else {
        await handleAISearch(text);
      }
    }
  };

  const handleDoctorClick = (doctor: Doctor) => {
    if (doctor.city && doctor.specialization) {
      const url = generateDoctorProfileUrl(doctor.city, doctor.specialization, doctor.full_name);
      navigate(url);
    } else {
      const slug = generateDoctorSlug(doctor.full_name);
      navigate(`/doctors/${slug}`);
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    setMessages([]);
    setSelectedCity(null);
    setSelectedSpecialty(null);
    setStep("welcome");
    setMessages([{
      id: "welcome",
      type: "bot",
      text: "👋 Hi! I'm your Doctor Finder assistant. I can help you find the right doctor in your city.\n\nHow would you like to search?",
      options: [
        { label: "🏙️ Browse by City", value: "browse_city", icon: "city" },
        { label: "🔍 Search by Name", value: "search_name" },
        { label: "💬 Describe what you need", value: "free_chat" },
      ],
      step: "welcome",
    }]);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          aria-label="Find a Doctor"
        >
          <Search className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Find a Doctor</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[520px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Doctor Finder</h3>
                <p className="text-xs opacity-80">Find the right doctor for you</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={handleReset}
                title="Start Over"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          {(selectedCity || selectedSpecialty) && (
            <div className="px-4 py-2 bg-muted/50 border-b flex items-center gap-1 text-xs shrink-0">
              {selectedCity && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedCity}
                </Badge>
              )}
              {selectedSpecialty && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Stethoscope className="h-3 w-3" />
                  {selectedSpecialty}
                </Badge>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${msg.type === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2"
                    : "space-y-2"
                  }`}>
                  {msg.type === "bot" ? (
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <p className="text-sm whitespace-pre-line">{msg.text.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )}

                  {/* Clickable options */}
                  {msg.options && (
                    <div className={`mt-2 ${msg.options.length > 6 ? "max-h-40 overflow-y-auto overscroll-contain rounded-xl border bg-background scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent" : "flex flex-wrap gap-1.5"}`}>
                      {msg.options.length > 6 ? (
                        msg.options.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleOptionClick(opt.value, opt.label)}
                            className="w-full text-left text-xs px-3 py-2.5 hover:bg-primary hover:text-primary-foreground transition-colors text-foreground border-b last:border-b-0 flex items-center gap-2"
                          >
                            {opt.icon === "city" && <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />}
                            {opt.icon === "specialty" && <Stethoscope className="h-3 w-3 text-muted-foreground shrink-0" />}
                            {opt.label}
                          </button>
                        ))
                      ) : (
                        msg.options.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleOptionClick(opt.value, opt.label)}
                            className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-accent transition-colors text-foreground"
                          >
                            {opt.label}
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {/* Doctor cards */}
                  {msg.doctors && msg.doctors.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {msg.doctors.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => handleDoctorClick(doc)}
                          className="w-full text-left p-3 border rounded-xl bg-background hover:bg-accent/50 transition-colors block"
                        >
                          <div className="flex items-center gap-3">
                             <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage src={doc.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {doc.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-sm truncate">{doc.full_name}</h4>
                              <p className="text-xs text-muted-foreground truncate">{doc.specialization}</p>
                              {doc.qualification && (
                                <p className="text-xs text-muted-foreground truncate">{doc.qualification}</p>
                              )}
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {doc.city && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                    <MapPin className="h-3 w-3" />{doc.city}
                                  </span>
                                )}
                                {doc.experience_years && (
                                  <span className="text-xs text-muted-foreground">
                                    {doc.experience_years}y exp
                                  </span>
                                )}
                              </div>
                              {/* Fee */}
                              {doc.consultation_fee && (
                                <div className="mt-1">
                                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                    💰 Rs. {doc.consultation_fee}
                                  </span>
                                </div>
                              )}
                              {/* Today's timing */}
                              {doc.today_timing && (
                                <div className="mt-0.5">
                                  <span className={`text-xs font-medium ${doc.today_timing === "Closed" ? "text-red-500" : "text-blue-600 dark:text-blue-400"}`}>
                                    🕐 Today: {doc.today_timing}
                                  </span>
                                </div>
                              )}
                              {/* Clinic */}
                              {doc.clinic_name && (
                                <div className="mt-0.5">
                                  <span className="text-xs text-muted-foreground">
                                    🏥 {doc.clinic_name}
                                  </span>
                                </div>
                              )}
                              {/* Multiple clinics */}
                              {doc.all_clinics && doc.all_clinics.length > 1 && (
                                <div className="mt-1 text-xs text-primary font-medium">
                                  📍 Available at {doc.all_clinics.length} clinics
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-background shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  step === "city" ? "Type a city name..." :
                  step === "specialty" ? "Type a specialization..." :
                  "Type your question..."
                }
                className="flex-1 rounded-full text-sm"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={loading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
