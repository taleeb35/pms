import { createContext, useContext, ReactNode } from "react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const KBEmbeddedContext = createContext(false);

export const KBEmbeddedProvider = ({ children }: { children: ReactNode }) => (
  <KBEmbeddedContext.Provider value={true}>{children}</KBEmbeddedContext.Provider>
);

export const useKBEmbedded = () => useContext(KBEmbeddedContext);

export const KBHeader = () => {
  const embedded = useKBEmbedded();
  return embedded ? null : <PublicHeader />;
};

export const KBFooter = () => {
  const embedded = useKBEmbedded();
  return embedded ? null : <PublicFooter />;
};
