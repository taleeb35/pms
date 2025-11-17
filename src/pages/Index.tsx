import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Patient Management System</h1>
        <p className="text-muted-foreground">Please sign in to continue</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/admin-login")} size="lg">
            Admin Login
          </Button>
          <Button onClick={() => navigate("/doctor-auth")} variant="outline" size="lg">
            Doctor Login / Signup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
