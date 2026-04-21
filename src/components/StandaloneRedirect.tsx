import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isStandalonePWA } from "@/lib/pwaUtils";

/**
 * When the app is launched as an installed PWA (standalone display mode),
 * automatically redirect users from the website routes into the native app shell at /app.
 * Public landing pages are skipped only if they explicitly bypass — by default we send to /app.
 */
const StandaloneRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isStandalonePWA()) return;
    const path = location.pathname;
    // Already inside the app shell or on auth flows — leave alone
    if (
      path.startsWith("/app") ||
      path.startsWith("/login") ||
      path.startsWith("/auth") ||
      path.startsWith("/doctor-auth") ||
      path.startsWith("/admin-login") ||
      path.startsWith("/receptionist-auth") ||
      path.startsWith("/forgot-password") ||
      path.startsWith("/reset-password") ||
      path.startsWith("/~oauth")
    ) {
      return;
    }
    navigate("/app", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return null;
};

export default StandaloneRedirect;
