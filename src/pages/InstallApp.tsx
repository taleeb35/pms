import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Zap, WifiOff, BellRing, ShieldCheck, Home } from "lucide-react";
import InstallPWAButton from "@/components/InstallPWAButton";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useSEO } from "@/hooks/useSEO";

const features = [
  { icon: Zap, title: "One-tap access", desc: "No more logging in every time. Open the app and you're in." },
  { icon: WifiOff, title: "Works offline", desc: "View your last reports & today's appointments without internet." },
  { icon: BellRing, title: "Stay updated", desc: "Get end-of-day summaries and important alerts (where supported)." },
  { icon: ShieldCheck, title: "Secure & private", desc: "Same enterprise-grade security as the web dashboard." },
  { icon: Home, title: "Home screen icon", desc: "Launches full screen — looks and feels like a native app." },
  { icon: Smartphone, title: "iPhone & Android", desc: "Works on every modern phone, tablet, and desktop." },
];

const InstallApp = () => {
  useSEO({
    title: "Install the Zonoir App | Clinic Dashboard on Your Phone",
    description:
      "Install Zonoir on your phone or tablet. Open your clinic dashboard, reports & analytics in one tap — no need to log in every time.",
    canonical: "https://zonoir.com/install",
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <PublicHeader />

      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Smartphone className="h-4 w-4" /> New — Mobile App
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Your clinic, one tap away
          </h1>
          <p className="text-lg text-muted-foreground">
            Install Zonoir on your phone and check appointments, revenue and reports
            instantly — without logging in every time.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <InstallPWAButton size="lg" />
          </div>
          <p className="text-xs text-muted-foreground">
            On iPhone, open this page in Safari and tap <strong>Share → Add to Home Screen</strong>.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-16 max-w-5xl mx-auto">
          {features.map((f) => (
            <Card key={f.title} className="border-primary/10 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-16 space-y-6">
          <h2 className="text-2xl font-bold text-center">How to install</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Smartphone className="h-4 w-4" /> Android / Chrome
                </h3>
                <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                  <li>Tap the <strong>Install Zonoir App</strong> button above.</li>
                  <li>Confirm <strong>Install</strong> in the browser prompt.</li>
                  <li>Open Zonoir from your home screen — done!</li>
                </ol>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Smartphone className="h-4 w-4" /> iPhone / Safari
                </h3>
                <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                  <li>Tap the <strong>Share</strong> icon at the bottom of Safari.</li>
                  <li>Scroll and tap <strong>Add to Home Screen</strong>.</li>
                  <li>Tap <strong>Add</strong>. The Zonoir icon will appear.</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default InstallApp;
