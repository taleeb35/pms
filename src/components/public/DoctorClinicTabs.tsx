import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Building2, Banknote } from "lucide-react";
import DoctorWeeklySchedule, { type ScheduleDay } from "./DoctorWeeklySchedule";

export interface ClinicInfo {
  id: string;
  name: string;
  location: string;
  fee?: number | null;
  timing?: string | null;
  scheduleData?: ScheduleDay[];
  mapQuery?: string;
}

interface DoctorClinicTabsProps {
  clinics: ClinicInfo[];
  defaultClinicId?: string;
}

const DoctorClinicTabs = ({ clinics, defaultClinicId }: DoctorClinicTabsProps) => {
  if (clinics.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No clinic information available
        </CardContent>
      </Card>
    );
  }

  const getGoogleMapEmbedUrl = (input: string) => {
    // If it's a Google Maps URL, extract the search query or coordinates
    if (input.includes("google.com/maps")) {
      try {
        const url = new URL(input);
        // Extract from /maps/search/QUERY pattern
        const searchMatch = url.pathname.match(/\/maps\/search\/(.+)/);
        if (searchMatch) {
          const query = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
          return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
        }
        // Extract from /maps/place/QUERY pattern
        const placeMatch = url.pathname.match(/\/maps\/place\/(.+)/);
        if (placeMatch) {
          const query = decodeURIComponent(placeMatch[1].split('/')[0].replace(/\+/g, ' '));
          return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
        }
        // Extract coordinates from @lat,lng pattern
        const coordMatch = input.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (coordMatch) {
          return `https://www.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`;
        }
      } catch {
        // Fall through to default
      }
    }
    const encodedLocation = encodeURIComponent(input);
    return `https://www.google.com/maps?q=${encodedLocation}&output=embed`;
  };

  const getGoogleMapLinkUrl = (input: string) => {
    // If it's already a Google Maps URL, return it directly
    if (input.includes("google.com/maps")) {
      return input;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(input)}`;
  };

  // Single clinic - no tabs needed
  if (clinics.length === 1) {
    const clinic = clinics[0];
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-b">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{clinic.name}</h3>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{clinic.location}</span>
                </div>
                {clinic.fee && (
                  <div className="flex items-center gap-2 text-primary mt-2">
                    <Banknote className="h-4 w-4" />
                    <span className="font-medium">Rs. {clinic.fee}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-0">
            {/* Schedule */}
            <div className="p-6 border-b md:border-b-0 md:border-r">
              <DoctorWeeklySchedule timing={clinic.timing} scheduleData={clinic.scheduleData} />
            </div>

            {/* Map */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location
              </h3>
              <div className="aspect-video rounded-lg overflow-hidden border shadow-sm">
                <iframe
                  src={getGoogleMapEmbedUrl(clinic.mapQuery || clinic.location)}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${clinic.name} location`}
                />
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.mapQuery || clinic.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-3"
              >
                <MapPin className="h-4 w-4" />
                View larger map
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Multiple clinics - show tabs
  return (
    <Tabs defaultValue={defaultClinicId || clinics[0].id} className="w-full">
      <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0 mb-4">
        {clinics.map((clinic) => (
          <TabsTrigger
            key={clinic.id}
            value={clinic.id}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border shadow-sm px-4 py-2.5"
          >
            <Building2 className="h-4 w-4 mr-2" />
            {clinic.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {clinics.map((clinic) => (
        <TabsContent key={clinic.id} value={clinic.id} className="mt-0">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-b">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{clinic.name}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{clinic.location}</span>
                    </div>
                    {clinic.fee && (
                      <div className="flex items-center gap-2 text-primary mt-2">
                        <Banknote className="h-4 w-4" />
                        <span className="font-medium">Rs. {clinic.fee}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-0">
                {/* Schedule */}
                <div className="p-6 border-b md:border-b-0 md:border-r">
                  <DoctorWeeklySchedule timing={clinic.timing} scheduleData={clinic.scheduleData} />
                </div>

                {/* Map */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Location
                  </h3>
                  <div className="aspect-video rounded-lg overflow-hidden border shadow-sm">
                    <iframe
                      src={getGoogleMapEmbedUrl(clinic.mapQuery || clinic.location)}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${clinic.name} location`}
                    />
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.mapQuery || clinic.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-3"
                  >
                    <MapPin className="h-4 w-4" />
                    View larger map
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default DoctorClinicTabs;
