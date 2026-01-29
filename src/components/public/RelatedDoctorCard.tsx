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
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/30 group-hover:-translate-y-1">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/10">
              <AvatarImage src={doctor.avatar_url || undefined} alt={doctor.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(doctor.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {doctor.full_name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{doctor.qualification}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {doctor.city}
                </span>
                {doctor.experience_years && (
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
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
