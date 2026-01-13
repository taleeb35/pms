import { Star, Quote } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

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

const Reviews = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <PublicHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full border-2 border-purple-200 shadow-md">
            <Star className="h-5 w-5 text-purple-600 fill-purple-600" />
            <span className="text-sm font-bold text-purple-900">Trusted by Healthcare Professionals</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              What Our Users Say
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover why hundreds of healthcare professionals trust Zonoir for their clinic management needs
          </p>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="container mx-auto px-4 py-12 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="group relative bg-white/90 backdrop-blur border-2 border-purple-100 rounded-3xl p-8 hover:border-purple-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-20 w-20 border-3 border-purple-200 shadow-lg">
                  <AvatarImage 
                    src={review.image} 
                    alt={review.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl">
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="pt-2">
                  <h3 className="font-bold text-foreground text-lg">{review.name}</h3>
                  <p className="text-sm text-muted-foreground">{review.role}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              
              <Quote className="h-8 w-8 text-purple-200 mb-3" />
              
              <p className="text-muted-foreground leading-relaxed">
                "{review.review}"
              </p>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Reviews;
