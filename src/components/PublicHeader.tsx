import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, Gift, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import clinicLogo from "@/assets/main-logo.webp";

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
            <img src={clinicLogo} alt="Clinic Logo" className="main_logo new_logo hover-scale" />
          </div>

          {/* Desktop Navigation */}
          <div className="des_nav hidden md:flex items-center gap-3">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                asChild
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                <Link to={item.path}>
                  {item.icon && <item.icon className="mr-1.5 h-4 w-4" />}
                  {item.label}
                </Link>
              </Button>
            ))}

            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link to="/auth">
                <Sparkles className="mr-2 h-4 w-4" />
                Get Zonoir Free
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
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
              <SheetContent side="right" className="w-[280px] sm:w-[320px] z-[100]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img src={clinicLogo} alt="Clinic Logo" className="" />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"></span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      asChild
                      className="w-full justify-start text-lg font-medium"
                    >
                      <Link to={item.path} onClick={() => setMobileMenuOpen(false)}>
                        {item.icon && <item.icon className="mr-2 h-5 w-5" />}
                        {item.label}
                      </Link>
                    </Button>
                  ))}
                  <div className="border-t my-4" />
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get Zonoir Free
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Link>
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
