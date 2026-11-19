import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Building2, CheckCircle, Eye, EyeOff, Loader2, Stethoscope, XCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PhoneInput from "@/components/PhoneInput";
import { CitySelect } from "@/components/CitySelect";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { activeRegion, countryName, currencyForCountry, licenceLabel } from "@/lib/region";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useToast } from "@/hooks/use-toast";
import { PRICE_MONTHLY, PRICE_YEARLY_MONTHLY, usd } from "@/lib/pricingConfig";
import { validateClinicName, validateEmail, validateName, validatePassword, validatePhone } from "@/lib/validations";
import clinicLogo from "@/assets/main-logo.webp";

// One sign-up page for doctors and clinics: choose the account type, then two short steps.
// Only what the system needs is required; everything else can be added later in Profile.
type Kind = "doctor" | "clinic";
type Step = "choose" | "account" | "practice";
type RefStatus = "idle" | "checking" | "valid" | "invalid" | "inactive";

const fieldErr = (m?: string) => (m ? <p className="text-xs text-destructive mt-1">{m}</p> : null);

export default function SignUp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const preset: Kind | null = pathname.startsWith("/doctor-auth") ? "doctor"
    : params.get("type") === "doctor" ? "doctor" : params.get("type") === "clinic" ? "clinic" : null;

  const [kind, setKind] = useState<Kind | null>(preset);
  const [step, setStep] = useState<Step>(preset ? "account" : "choose");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState<string>(activeRegion().country_code);
  const [countryPicked, setCountryPicked] = useState(false);
  const [specialization, setSpecialization] = useState("");
  const [doctorsCount, setDoctorsCount] = useState("1");
  const [address, setAddress] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [experience, setExperience] = useState("");
  const [fee, setFee] = useState("");
  const [licence, setLicence] = useState("");
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [refOpen, setRefOpen] = useState(!!params.get("ref"));
  const [referral, setReferral] = useState(params.get("ref") || "");
  const [refStatus, setRefStatus] = useState<RefStatus>("idle");
  const [specs, setSpecs] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // The phone number's country (e.g. +1 -> US) decides the country, unless it was changed in step 2.
  useEffect(() => {
    if (countryPicked) return;
    const p = phone.startsWith("+") ? parsePhoneNumberFromString(phone) : null;
    const next = p?.country || activeRegion().country_code;
    if (next !== country) { setCountry(next); setCity(""); }
  }, [phone, countryPicked, country]);

  useEffect(() => {
    document.title = "Sign up | Zonoir";
    supabase.from("specializations").select("name").order("name").then(({ data }) => {
      if (data) setSpecs([...new Set(data.map((s) => s.name))]);
    });
  }, []);

  // Live referral check (works before the visitor has an account).
  useEffect(() => {
    const code = referral.trim();
    if (!code) { setRefStatus("idle"); return; }
    setRefStatus("checking");
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc("check_referral_code" as any, { p_code: code });
      setRefStatus(error ? "invalid" : ((data as RefStatus) || "invalid"));
    }, 450);
    return () => clearTimeout(t);
  }, [referral]);

  const count = kind === "clinic" ? Math.max(1, parseInt(doctorsCount) || 1) : 1;
  const perDoctor = plan === "yearly" ? PRICE_YEARLY_MONTHLY : PRICE_MONTHLY;
  const total = Math.round(count * perDoctor * 100) / 100;
  const specOptions = useMemo(() => specs.map((s) => ({ value: s, label: s })), [specs]);

  const choose = (k: Kind) => { setKind(k); setErrors({}); setStep("account"); };

  const checkAccount = () => {
    const e: Record<string, string> = {};
    const n = kind === "clinic" ? validateClinicName(name) : validateName(name);
    if (!n.isValid) e.name = n.message;
    const em = validateEmail(email); if (!em.isValid) e.email = em.message;
    const ph = validatePhone(phone); if (!ph.isValid) e.phone = ph.message;
    const pw = validatePassword(password); if (!pw.isValid) e.password = pw.message;
    setErrors(e);
    if (!Object.keys(e).length) setStep("practice");
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!city) e.city = "Choose your city";
    if (kind === "doctor" && !specialization) e.specialization = "Choose your specialization";
    if (kind === "clinic" && !(parseInt(doctorsCount) >= 1 && parseInt(doctorsCount) <= 100)) e.doctorsCount = "Enter a number from 1 to 100";
    if (experience && !(Number(experience) >= 0 && Number(experience) <= 70)) e.experience = "Enter years as a number";
    if (fee && !(Number(fee) >= 0)) e.fee = "Enter the fee as a number";
    if (referral.trim() && refStatus !== "valid") e.referral = refStatus === "inactive" ? "This referral code is not active" : "This referral code is not valid";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const code = referral.trim() ? referral.trim().toUpperCase() : null;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { data: { full_name: name.trim() }, emailRedirectTo: "https://app.zonoir.com/login" },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Could not create the account");
      const uid = data.user.id;

      if (kind === "doctor") {
        const { error: dErr } = await supabase.from("doctors").insert({
          id: uid, specialization, qualification: "Medical Doctor", contact_number: phone,
          experience_years: experience ? parseInt(experience) : null,
          consultation_fee: fee ? parseFloat(fee) : null,
          clinic_percentage: 0, introduction: null, pmdc_number: licence.trim() || null,
          city, clinic_id: null, approved: true, referred_by: code, payment_plan: plan,
          country_code: country, currency_code: currencyForCountry(country), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || activeRegion().timezone,
        });
        if (dErr) throw dErr;
        try {
          await supabase.functions.invoke("send-doctor-signup-email", {
            body: { doctorName: name.trim(), email: email.trim(), specialization, city, country: countryName(country), phone, monthlyFee: perDoctor },
          });
        } catch (mailErr) { console.error("Signup email failed", mailErr); }
        await supabase.auth.signOut();
      } else {
        const { error: pErr } = await supabase.from("profiles").update({ phone, city, address: address.trim() || null }).eq("id", uid);
        if (pErr) throw pErr;
        const { error: cErr } = await supabase.from("clinics").insert({
          id: uid, clinic_name: name.trim(), city, phone_number: phone, address: address.trim(),
          requested_doctors: count, referred_by: code, status: "active", payment_plan: plan,
          country_code: country, currency_code: currencyForCountry(country), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || activeRegion().timezone,
        });
        if (cErr) throw cErr;
        // The clinic role is added by the database when the clinic record is created.
        try {
          await supabase.functions.invoke("send-clinic-welcome-email", {
            body: { clinicName: name.trim(), email: email.trim(), phoneNumber: phone, city, country: countryName(country), address: address.trim(), requestedDoctors: count },
          });
        } catch (mailErr) { console.error("Welcome email failed", mailErr); }
      }
      setPassword("");
      setDone(true);
    } catch (err: any) {
      toast({ title: "Could not create the account", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const stepNo = step === "account" ? 1 : step === "practice" ? 2 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-background dark:via-background dark:to-background px-4 py-8 flex items-start sm:items-center justify-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <img src={clinicLogo} alt="Zonoir" className="h-9 w-auto" />
            <button type="button" onClick={() => navigate("/login")} className="text-sm text-primary hover:underline">Have an account? Log in</button>
          </div>

          {step === "choose" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-sm text-muted-foreground">Who is this account for?</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  { k: "doctor" as Kind, icon: Stethoscope, title: "Doctor", sub: "One doctor with their own practice" },
                  { k: "clinic" as Kind, icon: Building2, title: "Clinic", sub: "A clinic with one or more doctors" },
                ]).map((o) => (
                  <button key={o.k} type="button" onClick={() => choose(o.k)}
                    className="flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition hover:border-primary hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <o.icon className="h-6 w-6 text-primary" />
                    <span className="font-semibold">{o.title}</span>
                    <span className="text-xs text-muted-foreground">{o.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step !== "choose" && kind && (
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Back" onClick={() => setStep(step === "practice" ? "account" : "choose")}
                className="rounded-md p-1.5 hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{kind === "doctor" ? "Doctor sign up" : "Clinic sign up"}</h1>
                <p className="text-xs text-muted-foreground">Step {stepNo} of 2 · {step === "account" ? "Your account" : kind === "doctor" ? "Your practice" : "Your clinic"}</p>
              </div>
              <div className="flex gap-1">
                <span className={`h-1.5 w-8 rounded-full ${stepNo >= 1 ? "bg-primary" : "bg-muted"}`} />
                <span className={`h-1.5 w-8 rounded-full ${stepNo >= 2 ? "bg-primary" : "bg-muted"}`} />
              </div>
            </div>
          )}

          {step === "account" && kind && (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); checkAccount(); }} noValidate>
              <div>
                <Label htmlFor="su-name">{kind === "doctor" ? "Full name" : "Clinic name"}</Label>
                <Input id="su-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete={kind === "doctor" ? "name" : "organization"}
                  placeholder={kind === "doctor" ? "e.g. Dr. Ayesha Khan" : "e.g. City Care Clinic"} autoFocus />
                {fieldErr(errors.name)}
              </div>
              <div>
                <Label htmlFor="su-email">Email</Label>
                <Input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" />
                {fieldErr(errors.email)}
              </div>
              <div>
                <Label htmlFor="su-phone">Mobile number</Label>
                <PhoneInput id="su-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                {fieldErr(errors.phone)}
              </div>
              <div>
                <Label htmlFor="su-pw">Password</Label>
                <div className="relative">
                  <Input id="su-pw" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="pr-10" placeholder="At least 8 characters" />
                  <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErr(errors.password)}
              </div>
              <Button type="submit" className="w-full" size="lg">Continue</Button>
            </form>
          )}

          {step === "practice" && kind && (
            <form className="space-y-4" onSubmit={submit} noValidate>
              {kind === "doctor" && (
                <div>
                  <SearchableSelect value={specialization} onValueChange={setSpecialization} options={specOptions}
                    label="Specialization" placeholder="Choose your specialization" searchPlaceholder="Search specializations..." />
                  {fieldErr(errors.specialization)}
                </div>
              )}
              <div>
                <CitySelect value={city} onValueChange={setCity} label="Country and city" country={country}
                  onCountryChange={(c) => { setCountryPicked(true); setCountry(c); setCity(""); }} />
                {country !== "PK" && !city && <p className="mt-1 text-xs text-muted-foreground">Type your city in the box and choose it.</p>}
                {fieldErr(errors.city)}
              </div>
              {kind === "clinic" && (
                <>
                  <div>
                    <Label htmlFor="su-docs">How many doctors?</Label>
                    <Input id="su-docs" inputMode="numeric" value={doctorsCount} onChange={(e) => setDoctorsCount(e.target.value.replace(/\D/g, "").slice(0, 3))} />
                    {fieldErr(errors.doctorsCount)}
                  </div>
                  <div>
                    <Label htmlFor="su-addr">Address <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
                    <Input id="su-addr" value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" />
                  </div>
                </>
              )}

              {kind === "doctor" && (
                <div className="rounded-lg border">
                  <button type="button" onClick={() => setMoreOpen(!moreOpen)} className="flex w-full items-center justify-between px-3 py-2.5 text-sm">
                    <span>More details <span className="text-muted-foreground">(optional, you can add these later)</span></span>
                    <span className="text-primary">{moreOpen ? "Hide" : "Add"}</span>
                  </button>
                  {moreOpen && (
                    <div className="grid gap-3 border-t p-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="su-exp" className="text-xs">Experience (years)</Label>
                        <Input id="su-exp" inputMode="numeric" value={experience} onChange={(e) => setExperience(e.target.value.replace(/\D/g, "").slice(0, 2))} />
                        {fieldErr(errors.experience)}
                      </div>
                      <div>
                        <Label htmlFor="su-fee" className="text-xs">Consultation fee ({currencyForCountry(country)})</Label>
                        <Input id="su-fee" inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value.replace(/[^\d.]/g, ""))} />
                        {fieldErr(errors.fee)}
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="su-lic" className="text-xs">{licenceLabel(country)}</Label>
                        <Input id="su-lic" value={licence} onChange={(e) => setLicence(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Plan after the free trial</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["monthly", "yearly"] as const).map((p) => (
                    <button key={p} type="button" onClick={() => setPlan(p)}
                      className={`rounded-lg border-2 p-3 text-left transition ${plan === p ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}>
                      <span className="flex items-center justify-between text-sm font-semibold capitalize">{p}{plan === p && <Check className="h-4 w-4 text-primary" />}</span>
                      <span className="text-xs text-muted-foreground">{usd(p === "yearly" ? PRICE_YEARLY_MONTHLY : PRICE_MONTHLY)} per doctor / month</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  14-day free trial. No payment required during trial period. Then {usd(total)} / month{count > 1 ? ` for ${count} doctors` : ""}{plan === "yearly" ? ", billed yearly" : ""}.
                </p>
              </div>

              <div>
                {!refOpen ? (
                  <button type="button" onClick={() => setRefOpen(true)} className="text-sm text-primary hover:underline">Have a referral code?</button>
                ) : (
                  <>
                    <Label htmlFor="su-ref">Referral code</Label>
                    <div className="relative">
                      <Input id="su-ref" value={referral} onChange={(e) => setReferral(e.target.value.toUpperCase())} className="pr-9 uppercase" />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        {refStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        {refStatus === "valid" && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                        {(refStatus === "invalid" || refStatus === "inactive") && <XCircle className="h-4 w-4 text-destructive" />}
                      </span>
                    </div>
                    {errors.referral ? fieldErr(errors.referral)
                      : refStatus === "invalid" ? <p className="text-xs text-destructive mt-1">This referral code is not valid</p>
                      : refStatus === "inactive" ? <p className="text-xs text-destructive mt-1">This referral code is not active</p> : null}
                  </>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Dialog open={done} onOpenChange={setDone}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle className="h-10 w-10 text-green-600" /></div>
            </div>
            <DialogTitle className="text-center text-2xl">Welcome to Zonoir!</DialogTitle>
            <DialogDescription className="text-center text-base space-y-2 pt-2">
              <span className="block font-semibold text-foreground">Your {kind === "clinic" ? "clinic " : ""}account is now active with a 14-day free trial!</span>
              <span className="block">You can now login and start using all features. A welcome email with details has been sent to your inbox.</span>
            </DialogDescription>
          </DialogHeader>
          <Button className="w-full" onClick={() => { setDone(false); navigate("/login"); }}>Go to Login</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
