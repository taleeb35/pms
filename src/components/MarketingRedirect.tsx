import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const APP_HOSTS = ["app.zonoir.com", "zonoir.lovable.app", "staging.72-62-45-147.sslip.io"];
export const isAppHost = () =>
  typeof window !== "undefined" && APP_HOSTS.includes(window.location.hostname);

/** Marketing, city and doctor-listing pages were removed from the app (19 Nov 2026).
 *  Old links go to the main website's homepage. */
export const MarketingRedirect = ({ children }: { children: ReactNode }) => {
  const { pathname, search, hash } = useLocation();
  void pathname; void search; void hash; void children;
  useEffect(() => { window.location.replace("https://zonoir.com/"); }, []);
  return null;
};

/** On the app subdomain, the homepage goes straight to login. */
export const AppHomeGate = ({ children }: { children: ReactNode }) =>
  isAppHost() ? <Navigate to="/login" replace /> : <>{children}</>;
