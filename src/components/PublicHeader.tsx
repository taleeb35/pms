import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Users, Stethoscope, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import clinicLogo from "@/assets/clinic-logo.png";

const PublicHeader = () => {
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleLoginSelect = (type: string) => {
    setShowLoginDialog(false);
    if (type === "clinic") {
      navigate("/auth");
    } else if (type === "doctor") {
      navigate("/doctor-auth");
    } else if (type === "receptionist") {
      navigate("/receptionist-auth");
    }
  };

  return (
    <>
      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Login to MedCare Pro
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="clinic" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clinic">Clinic</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
              <TabsTrigger value="receptionist">Receptionist</TabsTrigger>
            </TabsList>
            <TabsContent value="clinic" className="mt-6 text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <UserPlus className="h-12 w-12 mx-auto text-blue-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Clinic Owner</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your clinic, doctors, and staff
                </p>
                <Button 
                  onClick={() => handleLoginSelect("clinic")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Continue as Clinic
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="doctor" className="mt-6 text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <Stethoscope className="h-12 w-12 mx-auto text-purple-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Doctor</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Access your patients and appointments
                </p>
                <Button 
                  onClick={() => handleLoginSelect("doctor")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Continue as Doctor
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="receptionist" className="mt-6 text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl">
                <Users className="h-12 w-12 mx-auto text-teal-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Receptionist</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage clinic operations as staff
                </p>
                <Button 
                  onClick={() => handleLoginSelect("receptionist")}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                >
                  Continue as Receptionist
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Header/Navbar */}
      <header className="border-b bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 animate-fade-in cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={clinicLogo} alt="Clinic Logo" className="h-12 w-12 hover-scale" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                MedCare Pro
              </h1>
              <p className="text-xs text-muted-foreground">Complete Clinic Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost"
              onClick={() => navigate("/features")} 
              className="text-muted-foreground hover:text-foreground font-medium"
            >
              Features
            </Button>
            <Button 
              variant="ghost"
              onClick={() => navigate("/pricing")} 
              className="text-muted-foreground hover:text-foreground font-medium"
            >
              Pricing
            </Button>
            <Button 
              variant="ghost"
              onClick={() => navigate("/contact")} 
              className="text-muted-foreground hover:text-foreground font-medium"
            >
              Contact
            </Button>
            <Button 
              onClick={() => setShowLoginDialog(true)} 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </div>
        </div>
      </header>
    </>
  );
};

export default PublicHeader;
