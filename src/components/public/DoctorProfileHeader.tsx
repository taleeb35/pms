import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  GraduationCap, 
  Award, 
  Stethoscope,
  Phone,
  Share2,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

interface DoctorProfileHeaderProps {
  doctor: {
    full_name: string;
    specialization: string;
    qualification: string;
    experience_years: number | null;
    avatar_url: string | null;
    pmdc_verified?: boolean | null;
    contact_number?: string | null;
    consultation_fee?: number | null;
    introduction?: string | null;
  };
}

const DoctorProfileHeader = ({ doctor }: DoctorProfileHeaderProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${doctor.full_name} - ${doctor.specialization}`,
          text: `Book an appointment with ${doctor.full_name}, ${doctor.qualification}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center md:items-start">
          <div className="relative">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
              <AvatarImage src={doctor.avatar_url || undefined} alt={doctor.full_name} />
              <AvatarFallback className="text-2xl md:text-3xl bg-primary/10 text-primary font-semibold">
                {getInitials(doctor.full_name)}
              </AvatarFallback>
            </Avatar>
            {doctor.pmdc_verified && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                <CheckCircle className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {doctor.full_name}
              </h1>
              
              {doctor.pmdc_verified && (
                <Badge className="mb-3 bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  PMDC Verified
                </Badge>
              )}

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  <Stethoscope className="h-4 w-4 mr-1.5" />
                  {doctor.specialization}
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="self-center md:self-start"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-muted-foreground">
            <div className="flex items-center justify-center md:justify-start gap-2 bg-background/50 rounded-lg px-3 py-2">
              <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm">{doctor.qualification}</span>
            </div>

            {doctor.experience_years && (
              <div className="flex items-center justify-center md:justify-start gap-2 bg-background/50 rounded-lg px-3 py-2">
                <Award className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">{doctor.experience_years}+ years experience</span>
              </div>
            )}

            {doctor.consultation_fee && (
              <div className="flex items-center justify-center md:justify-start gap-2 bg-background/50 rounded-lg px-3 py-2">
                <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">Rs. {doctor.consultation_fee}</span>
              </div>
            )}
          </div>

          {/* Call Button for Mobile */}
          {doctor.contact_number && (
            <div className="mt-6 md:hidden">
              <Button asChild className="w-full" size="lg">
                <a href={`tel:${doctor.contact_number}`}>
                  <Phone className="h-5 w-5 mr-2" />
                  Call for Appointment
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Desktop CTA */}
        {doctor.contact_number && (
          <div className="hidden md:flex flex-col gap-3">
            <Button asChild size="lg" className="min-w-[200px]">
              <a href={`tel:${doctor.contact_number}`}>
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </a>
            </Button>
          </div>
        )}
      </div>

      {/* Introduction */}
      {doctor.introduction && (
        <div className="mt-6 pt-6 border-t border-border/50">
          <h2 className="text-lg font-semibold text-foreground mb-2">About</h2>
          <p className="text-muted-foreground leading-relaxed">{doctor.introduction}</p>
        </div>
      )}
    </div>
  );
};

export default DoctorProfileHeader;
