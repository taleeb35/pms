import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, X, Send, MapPin, Stethoscope, Search, ArrowLeft, User, Loader2, Calendar, ExternalLink } from "lucide-react";
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
  gender?: string | null;
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

const RESULT_FOLLOW_UP_OPTIONS = [
  { label: "🔄 New Search", value: "browse_city" },
  { label: "💬 Ask something else", value: "free_chat" },
];

export const PublicDoctorFinderChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [budgetFilter, setBudgetFilter] = useState<{ maxFee?: number; gender?: string; city?: string; specialty?: string } | null>(null);
  const [step, setStep] = useState<"intake_name" | "intake_phone" | "intake_email" | "welcome" | "city" | "specialty" | "results" | "free_chat" | "search_name" | "budget_city" | "budget_specialty" | "budget_fee">("intake_name");
  const [userInfo, setUserInfo] = useState<{ full_name?: string; phone?: string; email?: string }>({});
  const [leadSaved, setLeadSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingScrollTargetRef = useRef<"result" | "latest_bot" | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Only show on public pages
  const dashboardPaths = ["/dashboard", "/patients", "/appointments", "/admin", "/receptionist", "/content-writer", "/referral-partner/dashboard"];
  const dashboardPrefixes = ["/clinic/", "/admin/", "/receptionist/", "/content-writer/", "/referral-partner/dashboard"];
  const isDoctorDashboard = /^\/doctor\/(dashboard|patients|appointments|profile|schedule|finance|reports|subscription|support|walk-in|templates|diseases|allergies|icd-codes|procedures|receptionists|activity-logs)/.test(location.pathname) || /^\/doctor-receptionist\//.test(location.pathname);
  const isDashboard = isDoctorDashboard || dashboardPrefixes.some(p => location.pathname.startsWith(p)) || dashboardPaths.includes(location.pathname);

  const scrollToTargetMessage = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const selector = pendingScrollTargetRef.current === "result"
      ? '[data-result-msg="true"]'
      : '[data-bot-msg="true"]';

    const candidates = container.querySelectorAll(selector);
    const fallbackCandidates = container.querySelectorAll('[data-bot-msg="true"]');
    const target = (candidates[candidates.length - 1] || fallbackCandidates[fallbackCandidates.length - 1]) as HTMLElement | undefined;

    if (!target) return;

    const targetOffset = target.offsetTop - container.offsetTop;
    container.scrollTo({
      top: Math.max(0, targetOffset),
      behavior: "smooth",
    });

    pendingScrollTargetRef.current = null;
  };

  useEffect(() => {
    if (!pendingScrollTargetRef.current) return;
    const t = setTimeout(scrollToTargetMessage, 80);
    return () => clearTimeout(t);
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "intake-name",
        type: "bot",
        text: "👋 Hi! I'm your Doctor Finder assistant.\n\nBefore we start, may I know your **name**? (so I can assist you better)",
      }]);
      setStep("intake_name");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const showWelcomeMenu = (greetingName?: string) => {
    const name = greetingName || userInfo.full_name;
    addBotMessage(
      `Thanks${name ? `, ${name}` : ""}! 🎉\n\nHow would you like to find a doctor?`,
      {
        options: [
          { label: "🏙️ Browse by City", value: "browse_city", icon: "city" },
          { label: "🔍 Search by Name", value: "search_name" },
          { label: "👩‍⚕️ Female Doctor", value: "filter_female" },
          { label: "👨‍⚕️ Male Doctor", value: "filter_male" },
          { label: "💰 Filter by Budget", value: "filter_budget" },
          { label: "💬 Describe what you need", value: "free_chat" },
        ],
        step: "welcome",
      }
    );
    setStep("welcome");
  };

  const saveLead = async (info: { full_name: string; phone: string; email?: string }) => {
    if (leadSaved) return;
    try {
      await supabase.from("chatbot_leads").insert({
        full_name: info.full_name,
        phone: info.phone,
        email: info.email || null,
        source: "doctor_finder_chat",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
      setLeadSaved(true);
    } catch (err) {
      console.error("Failed to save lead:", err);
    }
  };

  if (isDashboard) return null;

  const createMessageId = () => crypto.randomUUID();

  const addBotMessage = (
    text: string,
    extras?: Partial<ChatMessage>,
    scrollTargetOverride?: "result" | "latest_bot"
  ) => {
    const isResultMessage = Boolean(extras?.doctors?.length);
    pendingScrollTargetRef.current = scrollTargetOverride
      ? scrollTargetOverride
      : isResultMessage
        ? "result"
        : (pendingScrollTargetRef.current ?? "latest_bot");

    const msg: ChatMessage = {
      id: createMessageId(),
      type: "bot",
      text,
      ...extras,
    };
    setMessages(prev => [...prev, msg]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { id: createMessageId(), type: "user", text }]);
  };

  const handleOptionClick = async (value: string, label: string) => {
    if (value === "skip_email" && step === "intake_email") {
      addUserMessage("Skip");
      await saveLead({ full_name: userInfo.full_name!, phone: userInfo.phone! });
      showWelcomeMenu(userInfo.full_name);
      return;
    }
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
    } else if (value === "filter_female" || value === "filter_male") {
      const gender = value === "filter_female" ? "female" : "male";
      const genderLabel = gender === "female" ? "Female" : "Male";
      addUserMessage(`${genderLabel} Doctor`);
      setStep("city");
      addBotMessage(`👤 Looking for ${genderLabel} doctors. Select a city:`, {
        options: CITIES.map(c => ({ label: c, value: `gender_${gender}_${c}`, icon: "city" as const })),
        step: "city",
      });
    } else if (value.startsWith("gender_")) {
      const parts = value.split("_");
      const gender = parts[1];
      const city = parts.slice(2).join("_");
      addUserMessage(city);
      setSelectedCity(city);
      setStep("results");
      await searchDoctors(city, null, null, undefined, gender);
    } else if (value === "filter_budget") {
      addUserMessage("Filter by Budget");
      setStep("budget_city");
      setBudgetFilter({});
      addBotMessage("💰 Let's find doctors within your budget!\n\nFirst, select a city:", {
        options: CITIES.map(c => ({ label: c, value: `budget_city_${c}`, icon: "city" as const })),
        step: "budget_city",
      });
    } else if (value.startsWith("budget_city_")) {
      const city = value.replace("budget_city_", "");
      addUserMessage(city);
      setBudgetFilter(prev => ({ ...prev, city }));
      setStep("budget_specialty");
      // Fetch specializations for this city
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
        const popular = POPULAR_SPECIALTIES.filter(s => specs.includes(s));
        const others = specs.filter(s => !popular.includes(s));
        const allSpecs = [...popular, ...others];
        addBotMessage("Now select a doctor type (or skip for all):", {
          options: [
            { label: "All Types", value: "budget_spec_all" },
            ...allSpecs.map(s => ({ label: s, value: `budget_spec_${s}`, icon: "specialty" as const })),
          ],
          step: "budget_specialty",
        });
      } catch {
        addBotMessage("Select a fee range:", {
          options: [
            { label: "Under Rs. 1,000", value: "budget_fee_1000" },
            { label: "Under Rs. 1,500", value: "budget_fee_1500" },
            { label: "Under Rs. 2,000", value: "budget_fee_2000" },
            { label: "Under Rs. 3,000", value: "budget_fee_3000" },
          ],
          step: "budget_fee",
        });
      } finally {
        setLoading(false);
      }
    } else if (value.startsWith("budget_spec_")) {
      const spec = value.replace("budget_spec_", "");
      const specLabel = spec === "all" ? "All Types" : spec;
      addUserMessage(specLabel);
      setBudgetFilter(prev => ({ ...prev, specialty: spec === "all" ? undefined : spec }));
      setStep("budget_fee");
      addBotMessage("💵 Select your maximum budget:", {
        options: [
          { label: "Under Rs. 1,000", value: "budget_fee_1000" },
          { label: "Under Rs. 1,500", value: "budget_fee_1500" },
          { label: "Under Rs. 2,000", value: "budget_fee_2000" },
          { label: "Under Rs. 3,000", value: "budget_fee_3000" },
          { label: "Any Budget", value: "budget_fee_any" },
        ],
        step: "budget_fee",
      });
    } else if (value.startsWith("budget_fee_")) {
      const feeStr = value.replace("budget_fee_", "");
      const maxFee = feeStr === "any" ? undefined : parseInt(feeStr);
      const feeLabel = maxFee ? `Under Rs. ${maxFee.toLocaleString()}` : "Any Budget";
      addUserMessage(feeLabel);
      setStep("results");
      const city = budgetFilter?.city || null;
      const specialty = budgetFilter?.specialty || null;
      await searchDoctors(city, specialty, null, undefined, undefined, maxFee, "fee_low");
    } else if (value.startsWith("cheap_")) {
      const city = value.replace("cheap_", "");
      addUserMessage(city);
      setSelectedCity(city);
      setStep("results");
      await searchDoctors(city, null, null, undefined, undefined, 1500, "fee_low");
    } else if (value === "free_chat") {
      addUserMessage("Describe what I need");
      setStep("free_chat");
      addBotMessage("Tell me what you need — for example:\n\n• \"Female skin doctor in DHA Karachi\"\n• \"Cheapest cardiologist in Lahore\"\n• \"ENT specialist in Gulshan-e-Iqbal\"\n• \"Lady gynecologist near Model Town\"");
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

  const searchDoctors = async (city: string | null, specialization: string | null, name: string | null, area?: string, gender?: string, max_fee?: number, sort_by?: string) => {
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
          body: JSON.stringify({ action: "search_doctors", city, specialization, name, area, gender, max_fee, sort_by }),
        }
      );
      const data = await res.json();
      const doctors: Doctor[] = data.doctors || [];

      if (doctors.length === 0) {
        const noResultMsg = name 
          ? `😔 I couldn't find a doctor named "${name}". Try a different spelling or search by specialization instead.`
          : "😔 No doctors found matching your criteria. Try a different specialization or city.";
        addBotMessage(noResultMsg, {
          options: [
            { label: "🔍 Search by Name", value: "search_name" },
            { label: "🏙️ Browse by City", value: "browse_city" },
            { label: "💬 Describe what you need", value: "free_chat" },
          ],
        });
      } else {
        const cityText = city ? ` in ${city}` : "";
        const specText = specialization ? ` ${specialization}` : "";
        addBotMessage(`Found **${doctors.length}${specText}** doctor${doctors.length > 1 ? "s" : ""}${cityText}:`, {
          doctors,
          options: RESULT_FOLLOW_UP_OPTIONS,
        });
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
          addBotMessage(data.response_text, {
            doctors,
            options: RESULT_FOLLOW_UP_OPTIONS,
          });
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

    // Intake flow: collect name → phone → optional email
    if (step === "intake_name") {
      if (text.length < 2) {
        addBotMessage("Please enter your full name (at least 2 characters).");
        return;
      }
      setUserInfo(prev => ({ ...prev, full_name: text }));
      setStep("intake_phone");
      addBotMessage(`Nice to meet you, ${text}! 👋\n\nWhat's your **phone number**? (so we can reach you if needed)`);
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    if (step === "intake_phone") {
      const digits = text.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) {
        addBotMessage("Please enter a valid phone number (10–15 digits). e.g. 03001234567");
        return;
      }
      setUserInfo(prev => ({ ...prev, phone: text }));
      setStep("intake_email");
      addBotMessage("Got it! 📱\n\nLastly, your **email** is optional — type it now or tap **Skip** to continue.", {
        options: [{ label: "⏭️ Skip", value: "skip_email" }],
      });
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    if (step === "intake_email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(text)) {
        addBotMessage("That doesn't look like a valid email. Try again or tap **Skip**.", {
          options: [{ label: "⏭️ Skip", value: "skip_email" }],
        });
        return;
      }
      const updated = { ...userInfo, email: text };
      setUserInfo(updated);
      await saveLead({ full_name: updated.full_name!, phone: updated.phone!, email: updated.email });
      showWelcomeMenu(updated.full_name);
      return;
    }

    if (step === "search_name") {
      // Direct name search — faster than AI for name lookups
      await searchDoctors(null, null, text);
    } else if (step === "free_chat" || step === "welcome" || step === "results") {
      await handleAISearch(text);
    } else if (step === "specialty" || step === "budget_specialty") {
      setSelectedSpecialty(text);
      setStep("results");
      await searchDoctors(selectedCity || budgetFilter?.city || null, text, null);
    } else if (step === "city" || step === "budget_city") {
      const matchedCity = CITIES.find(c => c.toLowerCase() === text.toLowerCase());
      if (matchedCity) {
        if (step === "budget_city") {
          handleOptionClick(`budget_city_${matchedCity}`, matchedCity);
        } else {
          setSelectedCity(matchedCity);
          setStep("specialty");
          await fetchSpecializations(matchedCity);
        }
      } else {
        await handleAISearch(text);
      }
    } else if (step === "budget_fee") {
      // Try to parse a number from user input
      const num = parseInt(text.replace(/[^0-9]/g, ""));
      if (num > 0) {
        setStep("results");
        await searchDoctors(budgetFilter?.city || null, budgetFilter?.specialty || null, null, undefined, undefined, num, "fee_low");
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
    setBudgetFilter(null);
    if (leadSaved && userInfo.full_name) {
      // User already gave info — go straight to welcome menu
      setStep("welcome");
      setMessages([{
        id: createMessageId(),
        type: "bot",
        text: `Welcome back, ${userInfo.full_name}! 👋\n\nHow would you like to find a doctor?`,
        options: [
          { label: "🏙️ Browse by City", value: "browse_city", icon: "city" },
          { label: "🔍 Search by Name", value: "search_name" },
          { label: "👩‍⚕️ Female Doctor", value: "filter_female" },
          { label: "👨‍⚕️ Male Doctor", value: "filter_male" },
          { label: "💰 Filter by Budget", value: "filter_budget" },
          { label: "💬 Describe what you need", value: "free_chat" },
        ],
        step: "welcome",
      }]);
    } else {
      // Restart full intake
      setStep("intake_name");
      setMessages([{
        id: createMessageId(),
        type: "bot",
        text: "👋 Hi! I'm your Doctor Finder assistant.\n\nBefore we start, may I know your **name**?",
      }]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const getDoctorProfileUrl = (doctor: Doctor) => {
    if (doctor.city && doctor.specialization) {
      return generateDoctorProfileUrl(doctor.city, doctor.specialization, doctor.full_name);
    }
    const slug = generateDoctorSlug(doctor.full_name);
    return `/doctors/${slug}`;
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
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                {...(msg.type === "bot" ? { "data-bot-msg": true } : {})}
                {...(msg.doctors?.length ? { "data-result-msg": true } : {})}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
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
                  {msg.options && !msg.doctors?.length && (
                    <div className={`mt-2 ${msg.options.length > 6 ? "max-h-40 overflow-y-auto overscroll-contain rounded-xl border bg-background scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent" : "flex flex-wrap gap-1.5"}`}>
                      {msg.options.length > 6 ? (
                        msg.options.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleOptionClick(opt.value, opt.label)}
                            className="w-full text-left text-xs px-3 py-2.5 hover:bg-primary hover:text-primary-foreground transition-colors text-foreground border-b last:border-b-0 flex items-center gap-2 group/item"
                          >
                            {opt.icon === "city" && <MapPin className="h-3 w-3 text-muted-foreground group-hover/item:text-primary-foreground shrink-0" />}
                            {opt.icon === "specialty" && <Stethoscope className="h-3 w-3 text-muted-foreground group-hover/item:text-primary-foreground shrink-0" />}
                            {opt.label}
                          </button>
                        ))
                      ) : (
                        msg.options.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleOptionClick(opt.value, opt.label)}
                            className="text-xs px-3 py-2 rounded-full border border-primary/30 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md transition-all duration-200 text-foreground font-medium"
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
                        <div
                          key={doc.id}
                          className="w-full text-left p-3 border rounded-xl bg-background hover:bg-accent/50 transition-colors"
                        >
                          <button
                            onClick={() => handleDoctorClick(doc)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center gap-3">
                               <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={doc.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {doc.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-semibold text-sm truncate">{doc.full_name}</h4>
                                  {doc.gender && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${doc.gender === "female" ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"}`}>
                                      {doc.gender === "female" ? "♀" : "♂"}
                                    </span>
                                  )}
                                </div>
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
                                    <span className={`text-xs font-medium ${doc.today_timing === "Closed" ? "text-destructive" : "text-blue-600 dark:text-blue-400"}`}>
                                      🕐 Today: {doc.today_timing}
                                    </span>
                                  </div>
                                )}
                                {/* Clinic with location */}
                                {doc.clinic_name && (
                                  <div className="mt-0.5">
                                    <span className="text-xs text-muted-foreground">
                                      🏥 {doc.clinic_name}{doc.clinic_location ? ` — ${doc.clinic_location}` : ""}
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
                          {/* Book Appointment Button */}
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const url = getDoctorProfileUrl(doc);
                                navigate(url);
                                setIsOpen(false);
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                            >
                              <Calendar className="h-3 w-3" />
                              Book Appointment
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const url = getDoctorProfileUrl(doc);
                                navigate(url);
                                setIsOpen(false);
                              }}
                              className="flex items-center justify-center gap-1 text-xs py-2 px-3 rounded-lg border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-muted-foreground"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Profile
                            </button>
                          </div>
                        </div>
                      ))}

                      {msg.options && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.options.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleOptionClick(opt.value, opt.label)}
                              className="text-xs px-3 py-2 rounded-full border border-primary/30 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md transition-all duration-200 text-foreground font-medium"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
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
                  step === "search_name" ? "Enter doctor's name e.g. Dr. Ahmed..." :
                  step === "city" ? "Type a city name..." :
                  step === "specialty" ? "Type a specialization..." :
                  step === "free_chat" ? "Describe what you need e.g. skin doctor in Lahore..." :
                  "Type your question..."
                }
                ref={inputRef}
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
