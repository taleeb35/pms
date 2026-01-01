import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, BookOpen, Menu, Gift } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import clinicLogo from "@/assets/Asset-2.png";

const PublicHeader = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const navItems = [
    { label: "Features", path: "/features" },
    { label: "Pricing", path: "/pricing" },
    { label: "Contact", path: "/contact" },
    { label: "Help", path: "/knowledge-base", icon: BookOpen },
    { label: "Referral", path: "/referral-program", icon: Gift },
  ];

  return (
    <>
      {/* Header/Navbar */}
      <header className="border-b bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 sm:gap-3 animate-fade-in cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={clinicLogo} alt="Clinic Logo" className="h-10 w-10 sm:h-12 sm:w-12 hover-scale" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                MedCare Pro
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Complete Clinic Management</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {navItems.map((item) => (
              <Button 
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)} 
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                {item.icon && <item.icon className="mr-1.5 h-4 w-4" />}
                {item.label}
              </Button>
            ))}
            <Button 
              onClick={() => navigate("/login")} 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            <Button 
              onClick={() => navigate("/login")} 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <LogIn className="h-4 w-4" />
            </Button>
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img src={clinicLogo} alt="Clinic Logo" className="h-8 w-8" />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      MedCare Pro
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Button 
                      key={item.path}
                      variant="ghost"
                      onClick={() => handleNavClick(item.path)} 
                      className="w-full justify-start text-lg font-medium"
                    >
                      {item.icon && <item.icon className="mr-2 h-5 w-5" />}
                      {item.label}
                    </Button>
                  ))}
                  <div className="border-t my-4" />
                  <Button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/login");
                    }} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
};

export default PublicHeader;
