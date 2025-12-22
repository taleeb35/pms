import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for password recovery in hash params
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    
    if (type === "recovery") {
      // Redirect to reset-password page with the hash intact
      navigate(`/reset-password${window.location.hash}`, { replace: true });
    }
  }, [navigate, location]);

  return null;
};

export default AuthRedirectHandler;
