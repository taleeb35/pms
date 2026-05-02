import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Navigation } from "lucide-react";

interface DoctorLocationMapProps {
  locationName?: string | null;
  city?: string | null;
  mapQuery?: string | null;
}

const buildEmbedUrl = (q: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;

const buildExternalUrl = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const DoctorLocationMap = ({
  locationName,
  city,
  mapQuery,
}: DoctorLocationMapProps) => {
  const query =
    mapQuery ||
    [locationName, city, "Pakistan"].filter(Boolean).join(", ") ||
    "Pakistan";

  // If location is already a google maps URL, just link it externally
  const isGoogleMapsLink =
    typeof locationName === "string" && locationName.includes("google.com/maps");

  const embedQuery = isGoogleMapsLink ? `${city || ""} Pakistan` : query;
  const externalQuery = isGoogleMapsLink ? locationName! : query;

  return (
    <Card className="overflow-hidden border-2 border-primary/10">
      <CardContent className="p-0">
        <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-foreground">Clinic Location</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {!isGoogleMapsLink && locationName
                  ? locationName
                  : city || "View location on map"}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <a
              href={buildExternalUrl(externalQuery)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </a>
          </Button>
        </div>

        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-muted">
          <iframe
            title={`Map of ${query}`}
            src={buildEmbedUrl(embedQuery)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorLocationMap;
