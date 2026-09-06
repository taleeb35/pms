import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useSEO } from "@/hooks/useSEO";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wrench,
  CircleAlert,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";

type StatusKey = "operational" | "degraded" | "partial" | "major" | "maintenance";

const STATUS_META: Record<
  StatusKey,
  { label: string; color: string; bg: string; Icon: any }
> = {
  operational: {
    label: "Operational",
    color: "text-green-600",
    bg: "bg-green-50",
    Icon: CheckCircle2,
  },
  degraded: {
    label: "Degraded Performance",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    Icon: CircleAlert,
  },
  partial: {
    label: "Partial Outage",
    color: "text-orange-600",
    bg: "bg-orange-50",
    Icon: AlertTriangle,
  },
  major: {
    label: "Major Outage",
    color: "text-red-600",
    bg: "bg-red-50",
    Icon: XCircle,
  },
  maintenance: {
    label: "Maintenance",
    color: "text-blue-600",
    bg: "bg-blue-50",
    Icon: Wrench,
  },
};

const services: { name: string; status: StatusKey; description: string }[] = [
  {
    name: "Web Application",
    status: "operational",
    description: "Clinic, doctor, and admin dashboards",
  },
  {
    name: "Patient Booking",
    status: "operational",
    description: "Public appointment booking system",
  },
  {
    name: "Authentication",
    status: "operational",
    description: "Login, signup, and password reset",
  },
  {
    name: "Database & Storage",
    status: "operational",
    description: "Patient records, files, and backups",
  },
  {
    name: "Email Notifications",
    status: "operational",
    description: "Welcome emails, reminders, and reports",
  },
  {
    name: "Video Consultations",
    status: "operational",
    description: "Daily.co powered video calls",
  },
  {
    name: "AI Assistants",
    status: "operational",
    description: "Doctor finder, patient insights, prescription AI",
  },
  {
    name: "SMS & WhatsApp",
    status: "operational",
    description: "Patient communication channels",
  },
  {
    name: "Public Website & SEO",
    status: "operational",
    description: "Find Doctors, blogs, and landing pages",
  },
];

const ServiceStatus = () => {
  useSEO({
    title: "Service Status | Zonoir",
    description:
      "Real-time status of Zonoir services including web app, patient booking, authentication, video calls, and more.",
    canonicalUrl: "https://zonoir.com/service-status",
  });

  const allOperational = services.every((s) => s.status === "operational");
  const overallMeta = allOperational
    ? STATUS_META.operational
    : STATUS_META.degraded;
  const OverallIcon = overallMeta.Icon;

  const lastChecked = format(new Date(), "PPP 'at' p");

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
          {/* Header */}
          <header className="text-center mb-10">
            <div
              className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${overallMeta.bg} mb-5`}
            >
              <OverallIcon className={`h-9 w-9 ${overallMeta.color}`} />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
              {allOperational
                ? "All Systems Operational"
                : "Some Systems Affected"}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Last checked: {lastChecked}
            </p>
          </header>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8">
            {(Object.keys(STATUS_META) as StatusKey[]).map((key) => {
              const meta = STATUS_META[key];
              const Icon = meta.Icon;
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Icon className={`h-4 w-4 ${meta.color}`} />
                  <span>{meta.label}</span>
                </div>
              );
            })}
          </div>

          {/* Service list */}
          <Card className="overflow-hidden border-2">
            <CardContent className="p-0 divide-y">
              {services.map((service) => {
                const meta = STATUS_META[service.status];
                const Icon = meta.Icon;
                return (
                  <div
                    key={service.name}
                    className="flex items-center justify-between gap-4 px-5 md:px-6 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Icon
                        className={`h-5 w-5 ${meta.color} flex-shrink-0 mt-0.5`}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {service.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs md:text-sm font-medium ${meta.color} flex-shrink-0`}
                    >
                      {meta.label}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Footer note */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Some issues affecting a small percentage of users may not be
              reflected here.
            </p>
            <p className="text-sm text-muted-foreground">
              Having trouble?{" "}
              <a
                href="/contact"
                className="text-primary hover:underline font-medium"
              >
                Contact support
              </a>
            </p>
          </div>

          {/* Trust strip */}
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>
              <strong className="text-foreground">99.9%</strong> uptime over the
              last 90 days
            </span>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default ServiceStatus;
