import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Award } from "lucide-react";
import { generateCitySlug, generateSpecialtySlug, generateDoctorSlug } from "@/lib/slugUtils";

interface RelatedDoctorCardProps {
  doctor: {
    id: string;
    full_name: string;
    specialization: string;
    qualification: string;
    city: string;
    experience_years: number | null;
    avatar_url: string | null;
  };
}

const RelatedDoctorCard = ({ doctor }: RelatedDoctorCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const doctorUrl = `/doctors/${generateCitySlug(doctor.city)}/${generateSpecialtySlug(doctor.specialization)}/${generateDoctorSlug(doctor.full_name)}`;

  return (
    <Link to={doctorUrl} className="block group">
      <Card className="h-full transition-all duration-300 hover:shadow-xl hover:border-primary/40 group-hover:-translate-y-1.5 bg-card">
        <CardContent className="p-5">
          <div className="flex flex-col items-center text-center gap-3">
            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-sm">
              <AvatarImage src={doctor.avatar_url || undefined} alt={doctor.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {getInitials(doctor.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {doctor.full_name}
              </h3>
              <p className="text-sm text-primary font-medium">{doctor.specialization}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{doctor.qualification}</p>
              <div className="flex items-center justify-center gap-3 pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary/70" />
                  {doctor.city}
                </span>
                {doctor.experience_years && (
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-primary/70" />
                    {doctor.experience_years}+ yrs
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RelatedDoctorCard;
