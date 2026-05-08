import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight,
  Calendar,
  Users,
  FileText,
  Stethoscope,
  Bell,
  Lock,
  BarChart3,
  MapPin,
  UserCog,
  ListOrdered,
  Sparkles,
  CheckCircle2,
  Star,
  Search,
  Globe,
  MessageCircle,
  Facebook,
  Instagram,
  Pill,
  NotebookPen,
  TrendingUp,
} from "lucide-react";

const DemoLanding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useSEO({
    title: "Zonoir — Run your clinic smarter, not harder",
    description:
      "Pakistan's #1 clinic management software. EMR, patient management, AI prescriptions, and revenue analytics — all in one beautifully simple platform.",
    canonicalUrl: "https://zonoir.com/demo-landing",
  });

  const features = [
    { icon: Calendar, title: "Appointment Management", desc: "Create, reschedule, cancel, and track bookings from one calendar.", bullets: ["Daily appointment list", "Doctor-wise schedule", "Available slots"] },
    { icon: Stethoscope, title: "Doctor Management", desc: "Add multiple doctors, specialties, profile details, timings, and availability.", bullets: ["Individual doctor pages", "Clinic hours", "Online booking links"] },
    { icon: Users, title: "Patient Records", desc: "Keep patient information organized so your team can serve returning visitors faster.", bullets: ["Patient contact info", "Visit history", "Booking notes"] },
    { icon: ListOrdered, title: "Patient Queue", desc: "Manage walk-ins, waiting patients, in-progress visits, and completed appointments.", bullets: ["Queue numbers", "Status tracking", "Front-desk visibility"] },
    { icon: UserCog, title: "Receptionist Logins", desc: "Give your front desk the right tools to handle bookings without giving full owner access.", bullets: ["Multiple receptionists", "Clinic owner login", "Team-friendly dashboard"] },
    { icon: MapPin, title: "Clinic Location & Timings", desc: "Show the right clinic address, timings, and availability for every doctor.", bullets: ["Location display", "Clinic hours", "Doctor-specific times"] },
    { icon: BarChart3, title: "Reports & Analytics", desc: "Understand appointments, cancellations, active doctors, completed visits, and clinic activity.", bullets: ["Daily reports", "Doctor performance", "Booking trends"] },
    { icon: Bell, title: "Notifications", desc: "Keep staff informed about upcoming bookings, schedule changes, and patient status.", bullets: ["Booking alerts", "Patient reminders", "Admin updates"] },
    { icon: Lock, title: "Secure Access", desc: "Organize clinic data with secure logins for owners, doctors, and reception staff.", bullets: ["Role-based access", "Private dashboard", "Clinic-level control"] },
  ];

  const aiCards = [
    { icon: Pill, title: "AI Prescription Assistant", desc: "Context-aware prescription suggestions based on the patient's current complaint, history, and vitals. Reduce typing, increase accuracy." },
    { icon: NotebookPen, title: "AI Visit Summary", desc: "One click generates a concise clinical summary of the full visit — perfect for referrals, handovers, or quick review before follow-ups." },
    { icon: TrendingUp, title: "AI Revenue Forecasting", desc: "Get AI-powered revenue predictions, trend analysis, and actionable growth recommendations based on your clinic's historical data." },
  ];

  const channels = [
    { icon: Search, label: "Google\nSearch", color: "text-blue-400" },
    { icon: MapPin, label: "Google\nMaps", color: "text-emerald-400" },
    { icon: Instagram, label: "Instagram", color: "text-pink-400" },
    { icon: Facebook, label: "Facebook", color: "text-blue-500" },
    { icon: Globe, label: "Clinic\nWebsite", color: "text-violet-400" },
    { icon: MessageCircle, label: "WhatsApp", color: "text-green-400" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white antialiased overflow-x-hidden">
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#0a0f1c]/70 border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 font-bold text-lg">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-violet-500 grid place-items-center text-black font-black">Z</span>
            Zonoir
          </button>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#ai" className="hover:text-white transition">AI</a>
            <a href="#profiles" className="hover:text-white transition">Doctor Profiles</a>
            <a href="#analytics" className="hover:text-white transition">Analytics</a>
            <a onClick={() => navigate("/pricing")} className="hover:text-white transition cursor-pointer">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/login")} className="text-white hover:bg-white/10">Login</Button>
            <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-violet-500 to-emerald-400 text-black hover:opacity-90 font-semibold">
              Start free trial
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-32 pb-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-emerald-500/10 blur-[140px]" />
          <div className="absolute top-40 right-0 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_60%)]" />
        </div>

        <div className="container mx-auto px-6 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/5 text-emerald-300 text-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Pakistan's #1 Clinic Management Software
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-8">
            Run your clinic{" "}
            <span className="italic font-serif bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              smarter,
            </span>{" "}
            not harder
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Zonoir gives doctors a complete EMR, patient management, AI prescriptions,
            and revenue analytics — all in one beautifully simple platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="h-14 px-8 text-base bg-gradient-to-r from-emerald-400 to-emerald-500 text-black hover:opacity-90 font-semibold rounded-xl"
            >
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate("/features")}
              className="h-14 px-6 text-base text-white hover:bg-white/5 rounded-xl"
            >
              See all features <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {["bg-blue-500","bg-violet-500","bg-orange-500","bg-emerald-500"].map((c,i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-[#0a0f1c] grid place-items-center text-xs font-bold`}>
                  {["S","A","R","M"][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/60">
              Trusted by <span className="text-white font-semibold">500+ doctors</span> across Pakistan
            </p>
          </div>
        </div>

        {/* Mock dashboard */}
        <div className="container mx-auto px-6 mt-20">
          <div className="relative max-w-6xl mx-auto rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-3 shadow-2xl shadow-emerald-500/10">
            <div className="rounded-xl bg-[#0d1424] border border-white/5 p-6">
              <div className="grid grid-cols-12 gap-4">
                <aside className="col-span-3 space-y-1 text-sm">
                  <div className="font-bold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-violet-500 grid place-items-center text-black text-xs font-black">Z</span>
                    Zonoir
                  </div>
                  {["Overview","Appointments","Doctors","Patients","Queue","Timings","Reports","Settings"].map((item, i) => (
                    <div key={item} className={`px-3 py-2 rounded-lg ${i===0 ? "bg-violet-500/20 text-violet-200" : "text-white/60"}`}>
                      {item}
                    </div>
                  ))}
                </aside>
                <main className="col-span-9 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">Good morning, Reception 👋</h3>
                    <p className="text-sm text-white/50">Here is what is happening at HealthPlus Clinic today.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="text-sm text-white/50 mb-3">Today's Appointments</div>
                      <div className="flex gap-6">
                        <div><div className="text-3xl font-bold">18</div><div className="text-xs text-white/50">Scheduled</div></div>
                        <div><div className="text-3xl font-bold text-emerald-400">5</div><div className="text-xs text-white/50">Completed</div></div>
                        <div><div className="text-3xl font-bold text-rose-400">2</div><div className="text-xs text-white/50">Cancelled</div></div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="text-sm text-white/50 mb-3">Doctor Schedule</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between"><span>Dr. Sarah Khan</span><span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">On Duty</span></div>
                        <div className="flex items-center justify-between"><span>Dr. Imran Malik</span><span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">On Duty</span></div>
                        <div className="flex items-center justify-between"><span>Dr. Aisha Rahman</span><span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">On Leave</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="text-sm text-white/50 mb-3">Patient Queue</div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span>1 · Ayesha Khan</span><span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">In Progress</span></div>
                        <div className="flex justify-between"><span>2 · Bilal Ahmed</span><span className="px-2 py-0.5 rounded bg-white/10">Waiting</span></div>
                        <div className="flex justify-between"><span>3 · Sara Ali</span><span className="px-2 py-0.5 rounded bg-white/10">Waiting</span></div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="text-sm text-white/50 mb-3">Quick Booking</div>
                      <div className="space-y-2">
                        <div className="h-7 rounded-md bg-white/5" />
                        <div className="h-7 rounded-md bg-white/5" />
                        <button className="w-full h-8 rounded-md bg-gradient-to-r from-violet-500 to-emerald-400 text-black text-xs font-semibold">Book Appointment</button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="text-sm text-white/50 mb-3">Upcoming Slots</div>
                      <div className="space-y-1.5 text-xs">
                        {["12:00 PM","12:30 PM","01:00 PM","02:00 PM"].map(t => (
                          <div key={t} className="flex justify-between"><span>{t}</span><span className="text-emerald-400">Available</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {["Built for clinics that want fewer calls","14-day free trial","Per-doctor pricing","Receptionist access included","Online patient booking"].map(t => (
              <span key={t} className="px-4 py-2 rounded-full border border-white/10 text-sm text-white/70 bg-white/[0.02]">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-4">Everything your clinic needs</p>
            <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight">
              One platform for doctors,<br/>reception and clinic owners.
            </h2>
            <p className="text-white/60 text-lg">Zonoir is designed to reduce manual work, organize daily operations, and improve the patient booking experience.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-emerald-400/30 transition-all">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/30 to-emerald-400/30 border border-white/10 grid place-items-center mb-5">
                  <f.icon className="w-5 h-5 text-emerald-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/60 mb-4 leading-relaxed">{f.desc}</p>
                <ul className="space-y-1.5">
                  {f.bullets.map(b => (
                    <li key={b} className="text-xs text-white/50 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />{b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ANALYTICS */}
      <section id="analytics" className="py-24 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="font-serif text-4xl md:text-6xl font-bold leading-[1.1] mb-6">Know what is happening inside your clinic.</h2>
              <p className="text-white/60 text-lg leading-relaxed">
                Track booked appointments, completed visits, cancellations, active doctors, busy hours, and front-desk activity without waiting for manual reports.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0e1a2f] to-[#0a0f1c] p-8">
              <div className="flex items-end justify-between h-48 gap-3 mb-6">
                {[60, 90, 50, 110, 75, 140, 175].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-violet-500 to-emerald-400" style={{ height: `${h}px` }} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { v: "284", l: "Monthly bookings" },
                  { v: "92%", l: "Slot utilization" },
                  { v: "17", l: "Active doctors" },
                ].map(s => (
                  <div key={s.l} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-2xl font-bold">{s.v}</div>
                    <div className="text-xs text-white/50">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section id="ai" className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0e1a2f] via-[#0a0f1c] to-[#1a0f2e] p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[200px] font-serif font-bold text-white/[0.02] leading-none select-none">AI</div>
            <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-4">Artificial Intelligence</p>
            <h2 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6 max-w-2xl">AI that works as hard as you do</h2>
            <p className="text-white/60 text-lg max-w-xl mb-12">Zonoir embeds AI throughout the platform — not as a gimmick, but as a genuine time-saver for busy doctors.</p>

            <div className="grid md:grid-cols-3 gap-5">
              {aiCards.map(c => (
                <div key={c.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-emerald-400/30 transition">
                  <c.icon className="w-8 h-8 text-emerald-300 mb-4" />
                  <h3 className="font-semibold mb-3">{c.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DOCTOR PROFILE + DISCOVERY */}
      <section id="profiles" className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Profile card */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0e1a2f] to-[#0a0f1c] p-8">
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 grid place-items-center text-xl font-bold">SK</div>
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-lg">Dr. Sarah Khan <CheckCircle2 className="w-4 h-4 text-blue-400" /></div>
                    <div className="text-violet-400 text-sm">Cardiologist</div>
                  </div>
                </div>
                <p className="text-xs text-white/60 mb-4">MBBS, MD · 8+ years experience</p>
                <div className="flex gap-2 mb-4 text-xs">
                  <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">📍 Karachi</span>
                  <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> 4.9 Reviews</span>
                  <span className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">Available Today</span>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                  <p className="text-xs text-white/60 mb-3">Book an Appointment</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="py-2 rounded-lg bg-gradient-to-r from-violet-500 to-emerald-400 text-black text-sm font-semibold">10:00</button>
                    <button className="py-2 rounded-lg bg-white/5 border border-white/10 text-sm">12:00</button>
                    <button className="py-2 rounded-lg bg-white/5 border border-white/10 text-sm">3:00</button>
                  </div>
                </div>
              </div>
              <h3 className="font-serif text-3xl font-bold mb-3">Give every doctor their own profile page</h3>
              <p className="text-white/60 text-sm">Show doctor info, clinic times, location, services, availability, and let patients book online with <span className="text-violet-400">Zonoir</span>.</p>
            </div>

            {/* Discovery card */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0e1a2f] to-[#0a0f1c] p-8">
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 mb-6 relative">
                <div className="grid grid-cols-3 gap-3">
                  {channels.slice(0,3).map(c => (
                    <div key={c.label} className="aspect-square rounded-xl bg-white/[0.04] border border-white/10 grid place-items-center">
                      <c.icon className={`w-8 h-8 ${c.color}`} />
                    </div>
                  ))}
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-violet-500 to-emerald-400 grid place-items-center text-black text-2xl font-black col-start-2 -mt-2">Z</div>
                  {channels.slice(3).map(c => (
                    <div key={c.label} className="aspect-square rounded-xl bg-white/[0.04] border border-white/10 grid place-items-center">
                      <c.icon className={`w-8 h-8 ${c.color}`} />
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="font-serif text-3xl font-bold mb-3">Help patients find doctors everywhere</h3>
              <p className="text-white/60 text-sm">Use shareable doctor pages across social, website, Google, WhatsApp, and clinic campaigns so patients can discover and book faster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-[#0a0f1c] to-violet-600/10 p-12 md:p-20 text-center relative overflow-hidden">
            <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-6" />
            <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight">Ready to run your clinic <span className="italic bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">smarter?</span></h2>
            <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">No setup headache. Includes owner login + receptionist logins. Built for clinics in Pakistan.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="h-14 px-8 bg-gradient-to-r from-emerald-400 to-emerald-500 text-black hover:opacity-90 font-semibold rounded-xl">
                Start 14-day free trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate("/contact")} className="h-14 px-8 text-white hover:bg-white/5 rounded-xl border border-white/10">
                Talk to sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-violet-500 grid place-items-center text-black text-xs font-black">Z</span>
            © 2026 Zonoir. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a onClick={() => navigate("/privacy-policy")} className="hover:text-white cursor-pointer">Privacy</a>
            <a onClick={() => navigate("/terms-of-service")} className="hover:text-white cursor-pointer">Terms</a>
            <a onClick={() => navigate("/contact")} className="hover:text-white cursor-pointer">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DemoLanding;
