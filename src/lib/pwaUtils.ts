// Helpers for detecting if the app is launched as an installed PWA
export const isStandalonePWA = (): boolean => {
  if (typeof window === "undefined") return false;
  const displayModeStandalone = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as any).standalone === true;
  return Boolean(displayModeStandalone || iosStandalone);
};

export const isMobileViewport = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
};
