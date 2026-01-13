import { Star, Quote } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import drAzkaZahra from "@/assets/dr-azka-zahra.jpeg";
import drSarmadAli from "@/assets/dr-sarmad-ali.jpg";
import drNayabGul from "@/assets/dr-nayab-gul.jpg";
import drMahnoorMalik from "@/assets/dr-mahnoor-malik.jpeg";

const reviews = [
  {
    name: "Dr. Azka Zahra",
    role: "General Physician",
    image: drAzkaZahra,
    rating: 5,
    review: "Zonoir has completely transformed how I manage my practice. The patient tracking and appointment scheduling features save me hours every week. Highly recommended for all healthcare professionals!",
  },
  {
    name: "Dr. Sarmad Ali",
    role: "Family Medicine Specialist",
    image: drSarmadAli,
    rating: 5,
    review: "The best clinic management software I've ever used. The activity logs and finance tracking features give me complete visibility into my practice. Exceptional customer support too!",
  },
  {
    name: "Dr. Nayab Gul",
    role: "Internal Medicine",
    image: drNayabGul,
    rating: 5,
    review: "As a busy doctor, I needed a system that's easy to use and reliable. Zonoir exceeded my expectations. The medical records feature is incredibly well-designed and secure.",
  },
  {
    name: "Dr. Mahnoor Malik",
    role: "Pediatrician",
    image: drMahnoorMalik,
    rating: 5,
    review: "Managing my clinic has never been easier. From patient appointments to financial reports, everything is streamlined. Zonoir is a game-changer for modern healthcare practices!",
  },
];

const DoctorReviewsSection = () => {
  return (
    <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-purple-50/30 to-white/50">
      <div className="text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full border-2 border-purple-200 mb-6 shadow-md">
          <Star className="h-5 w-5 text-purple-600 fill-purple-600" />
          <span className="text-sm font-bold text-purple-900">Trusted by Healthcare Professionals</span>
        </div>
        <h3 className="text-5xl font-extrabold mb-6">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            What Doctors Say About Us
          </span>
        </h3>
        <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
          Join hundreds of satisfied healthcare professionals who trust Zonoir for their clinic management
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="group relative bg-white/90 backdrop-blur border-2 border-purple-100 rounded-3xl p-6 hover:border-purple-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-fade-in overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            
            <Quote className="h-8 w-8 text-purple-200 mb-4" />
            
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-4">
              "{review.review}"
            </p>
            
            <div className="flex items-center gap-1 mb-4">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            
            <div className="flex items-center gap-4 pt-4 border-t border-purple-100">
              <Avatar className="h-24 w-24 border-2 border-purple-200">
                <AvatarImage
                  src={review.image} 
                  alt={review.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-lg">
                  {review.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold text-foreground">{review.name}</h4>
                <p className="text-sm text-muted-foreground">{review.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DoctorReviewsSection;
