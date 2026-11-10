/**
 * Sign-in / registration screens. Public helpers (WhatsApp bubble, doctor-finder
 * chat) must stay off these pages so the app subdomain reads as a clean login
 * surface — marketing lives on the main website.
 */
export const AUTH_ROUTES = [
  "/login",
  "/auth",
  "/doctor-auth",
  "/receptionist-auth",
  "/admin-login",
  "/referral-partner/login",
  "/forgot-password",
];

export const isAuthRoute = (pathname: string) => {
  const path = pathname.replace(/\/+$/, "") || "/";
  return AUTH_ROUTES.includes(path);
};
