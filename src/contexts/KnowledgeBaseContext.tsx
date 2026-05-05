import { createContext, useContext, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const KBEmbeddedContext = createContext(false);

export const KBEmbeddedProvider = ({ children }: { children: ReactNode }) => (
  <KBEmbeddedContext.Provider value={true}>{children}</KBEmbeddedContext.Provider>
);

export const useKBEmbedded = () => useContext(KBEmbeddedContext);

export const useKBBase = () => {
  const embedded = useKBEmbedded();
  const { pathname } = useLocation();
  if (!embedded) return "/knowledge-base";
  if (pathname.startsWith("/doctor/")) return "/doctor/knowledge-base";
  if (pathname.startsWith("/clinic/")) return "/clinic/knowledge-base";
  return "/knowledge-base";
};

export const KBHeader = () => {
  const embedded = useKBEmbedded();
  return embedded ? null : <PublicHeader />;
};

export const KBFooter = () => {
  const embedded = useKBEmbedded();
  return embedded ? null : <PublicFooter />;
};
