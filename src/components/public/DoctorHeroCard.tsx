import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  GraduationCap,
  Award,
  Loader2,
  MapPin,
  ShieldCheck,
  Phone,
  CheckCircle2,
  Facebook,
  Instagram,
  Youtube,
  Music2,
  Star,
} from "lucide-react";
import VerifiedBadge from "@/components/public/VerifiedBadge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  handleNameInput,
  handlePhoneInput,
  validateName,
  validatePhone,
} from "@/lib/validations";

interface HeroDoctor {
  id: string;
  full_name: string;
  specialization: string;
  qualification: string;
  experience_years: number | null;
  avatar_url: string | null;
  introduction?: string | null;
  pmdc_verified?: boolean | null;
  contact_number?: string | null;
  consultation_fee?: number | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
}

interface DoctorHeroCardProps {
  doctor: HeroDoctor;
  isRegistered: boolean;
  primaryLocation?: string;
  primaryMapQuery?: string;
}

const DoctorHeroCard = ({
  doctor,
  isRegistered,
  primaryLocation,
  primaryMapQuery,
}: DoctorHeroCardProps) => {
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return format(d, "yyyy-MM-dd");
  }, []);

  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<{ value: string; label: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // Fetch availability
  useEffect(() => {
    if (!isRegistered || !doctor.id || !date) return;
    let cancelled = false;
    const load = async () => {
      setLoadingSlots(true);
      setTime("");
      setUnavailableReason(null);
      try {
        const { data, error } = await supabase.rpc(
          "get_public_doctor_booking_availability",
          { _doctor_id: doctor.id, _appointment_date: date }
        );
        if (error) throw error;
        const availability = (data ?? {}) as {
          available?: boolean;
          reason?: string | null;
          slots?: Array<{ value?: string; label?: string }>;
        };
        if (!availability.available) {
          if (!cancelled) {
            setSlots([]);
            setUnavailableReason(
              availability.reason || "Doctor is not available on this date."
            );
          }
          return;
        }
        const all = (availability.slots ?? [])
          .filter(
            (s): s is { value: string; label: string } => !!s.value && !!s.label
          )
          .map((s) => ({ value: s.value, label: s.label }));
        const now = new Date();
        const isToday = date === format(now, "yyyy-MM-dd");
        const currentHM = `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}`;
        const free = all.filter((s) => !(isToday && s.value <= currentHM));
        if (!cancelled) {
          setSlots(free);
          if (free.length === 0) {
            setUnavailableReason(
              "No available time slots for this date. Please choose another day."
            );
          }
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setSlots([]);
          setUnavailableReason("Could not load availability. Please try again.");
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isRegistered, doctor.id, date]);

  const proceedToForm = () => {
    if (!time) return toast.error("Please select a time slot");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const nm = validateName(fullName);
    if (!nm.isValid) return toast.error(nm.message);
    const ph = validatePhone(phone);
    if (!ph.isValid) return toast.error(ph.message);
    if (!time || !date) return toast.error("Please select date and time");

    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc(
        "public_book_appointment" as any,
        {
          _doctor_id: doctor.id,
          _full_name: fullName,
          _phone: phone,
          _appointment_date: date,
          _appointment_time: time,
          _reason: reason || null,
          _gender: gender,
        }
      );
      if (error) throw error;
      if (!data) throw new Error("Booking failed");
      setSuccess(true);
      toast.success("Appointment booked successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Could not book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setShowForm(false);
    setSuccess(false);
    setFullName("");
    setPhone("");
    setGender("male");
    setReason("");
    setTime("");
  };

  const hasSocials =
    doctor.facebook_url ||
    doctor.instagram_url ||
    doctor.youtube_url ||
    doctor.tiktok_url;

  return (
    <Card className="overflow-hidden border-2 border-primary/10 shadow-lg">
      <CardContent className="p-6 md:p-8">
        <div className={isRegistered ? "grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8" : "grid grid-cols-1 gap-6"}>
          {/* LEFT: Profile info */}
          <div className={isRegistered ? "lg:col-span-3" : ""}>
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Avatar with online dot */}
              <div className="flex flex-col items-center sm:items-start flex-shrink-0">
                <div className="relative">
                  <Avatar className="h-32 w-32 md:h-36 md:w-36 border-4 border-background shadow-xl ring-2 ring-primary/20">
                    <AvatarImage
                      src={doctor.avatar_url || undefined}
                      alt={doctor.full_name}
                    />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                      {getInitials(doctor.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {isRegistered && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0">
                      <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white border-0 shadow-md gap-1.5 px-2.5 py-0.5">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        Online
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground inline-flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <span>{doctor.full_name}</span>
                  {isRegistered && <VerifiedBadge size="md" />}
                </h1>

                <p className="text-primary font-semibold text-base mt-1">
                  {doctor.specialization}
                </p>

                <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {doctor.qualification}
                  </span>
                  {doctor.experience_years && (
                    <>
                      <span className="text-muted-foreground/50">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {doctor.experience_years}+ Years Experience
                      </span>
                    </>
                  )}
                </p>

                {doctor.introduction && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-3">
                    {doctor.introduction}
                  </p>
                )}

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                  {doctor.pmdc_verified && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      PMDC Verified
                    </Badge>
                  )}
                  {isRegistered && (
                    <Badge className="bg-[#1d9bf0]/10 text-[#1d9bf0] border-[#1d9bf0]/20 hover:bg-[#1d9bf0]/20">
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                      Registered with Zonoir
                    </Badge>
                  )}
                  {doctor.consultation_fee && (
                    <Badge variant="secondary" className="font-semibold">
                      Fee: Rs. {doctor.consultation_fee}
                    </Badge>
                  )}
                </div>

                {/* Socials */}
                {hasSocials && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-4">
                    {doctor.facebook_url && (
                      <a
                        href={doctor.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                        className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow"
                      >
                        <Facebook className="h-4 w-4" />
                      </a>
                    )}
                    {doctor.instagram_url && (
                      <a
                        href={doctor.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="h-9 w-9 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    {doctor.youtube_url && (
                      <a
                        href={doctor.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube"
                        className="h-9 w-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow"
                      >
                        <Youtube className="h-4 w-4" />
                      </a>
                    )}
                    {doctor.tiktok_url && (
                      <a
                        href={doctor.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="TikTok"
                        className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform shadow"
                      >
                        <Music2 className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick info chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {primaryLocation && (
                <div className="flex items-start gap-3 bg-muted/40 rounded-xl px-4 py-3 border border-border/40">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      Location
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {primaryLocation}
                    </p>
                  </div>
                </div>
              )}
              {doctor.contact_number && (
                <a
                  href={`tel:${doctor.contact_number}`}
                  className="flex items-start gap-3 bg-muted/40 rounded-xl px-4 py-3 border border-border/40 hover:border-primary/40 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      Contact
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {doctor.contact_number}
                    </p>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* RIGHT: Booking widget (2 cols) - only for registered doctors */}
          {isRegistered && (
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-primary/5 via-primary/[0.03] to-transparent border-2 border-primary/15 rounded-2xl p-5 h-full">
              {!isRegistered ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Call to Book
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    This doctor is not yet registered for online booking.
                  </p>
                  {doctor.contact_number && (
                    <Button asChild className="w-full">
                      <a href={`tel:${doctor.contact_number}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        {doctor.contact_number}
                      </a>
                    </Button>
                  )}
                </div>
              ) : success ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-4">
                  <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">
                    Appointment Requested
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    The clinic will call <strong>{phone}</strong> to confirm.
                  </p>
                  <Button
                    onClick={resetBooking}
                    variant="outline"
                    className="w-full"
                  >
                    Book Another
                  </Button>
                </div>
              ) : !showForm ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground">
                      Book an Appointment
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Choose a date and time
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="hero-date" className="text-xs">
                        Date
                      </Label>
                      <Input
                        id="hero-date"
                        type="date"
                        value={date}
                        min={today}
                        max={maxDate}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Available Times
                      </Label>

                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading…
                        </div>
                      ) : slots.length === 0 ? (
                        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-md p-2">
                          {unavailableReason || "No slots available."}
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                          {slots.map((s) => {
                            const selected = s.value === time;
                            return (
                              <button
                                key={s.value}
                                type="button"
                                onClick={() => setTime(s.value)}
                                className={
                                  selected
                                    ? "text-xs font-semibold rounded-lg px-2 py-2 bg-primary text-primary-foreground border-2 border-primary shadow-sm transition-all"
                                    : "text-xs font-medium rounded-lg px-2 py-2 bg-background text-foreground border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                                }
                              >
                                {s.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={proceedToForm}
                      disabled={!time || loadingSlots}
                      size="lg"
                      className="w-full font-semibold"
                    >
                      Book Appointment
                    </Button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-foreground">Your Details</h3>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Change time
                    </button>
                  </div>

                  <div className="rounded-lg bg-primary/10 px-3 py-2 text-xs">
                    <span className="font-semibold text-primary">
                      {format(new Date(date + "T00:00:00"), "PPP")}
                    </span>
                    <span className="mx-1.5 text-muted-foreground">at</span>
                    <span className="font-semibold text-primary">
                      {slots.find((s) => s.value === time)?.label || time}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hero-name" className="text-xs">
                      Full name *
                    </Label>
                    <Input
                      id="hero-name"
                      value={fullName}
                      onChange={(e) => setFullName(handleNameInput(e))}
                      placeholder="Your full name"
                      required
                      className="bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="hero-phone" className="text-xs">
                        Phone number *
                      </Label>
                      <Input
                        id="hero-phone"
                        value={phone}
                        onChange={(e) => setPhone(handlePhoneInput(e))}
                        placeholder="03001234567"
                        inputMode="tel"
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="hero-gender" className="text-xs">
                        Gender *
                      </Label>
                      <select
                        id="hero-gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as "male" | "female" | "other")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        required
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hero-reason" className="text-xs">
                      Reason (optional)
                    </Label>
                    <Textarea
                      id="hero-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Brief description"
                      rows={2}
                      maxLength={500}
                      className="bg-background resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full font-semibold"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Booking…
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Trust strip */}
        <div className="mt-6 pt-5 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>
            <strong className="text-foreground">Secure</strong> • Private •
            Information stays confidential
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorHeroCard;
