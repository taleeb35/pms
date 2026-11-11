import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const APP_HOSTS = ["app.zonoir.com", "zonoir.lovable.app"];
export const isAppHost = () =>
  typeof window !== "undefined" && APP_HOSTS.includes(window.location.hostname);

/** On the app subdomain, send marketing pages to the main website. */
export const MarketingRedirect = ({ children }: { children: ReactNode }) => {
  const { pathname, search, hash } = useLocation();
  const redirect = isAppHost();
  useEffect(() => {
    if (redirect) window.location.replace(`https://zonoir.com${pathname}${search}${hash}`);
  }, [redirect, pathname, search, hash]);
  return redirect ? null : <>{children}</>;
};

/** On the app subdomain, the homepage goes straight to login. */
export const AppHomeGate = ({ children }: { children: ReactNode }) =>
  isAppHost() ? <Navigate to="/login" replace /> : <>{children}</>;
