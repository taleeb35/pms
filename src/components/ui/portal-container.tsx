import * as React from "react";

const PortalContainerContext = React.createContext<Element | null>(null);

export function PortalContainerProvider({ children }: { children: React.ReactNode }) {
  const [container, setContainer] = React.useState<Element | null>(null);

  const setHostRef = React.useCallback((node: HTMLDivElement | null) => {
    setContainer(node);
  }, []);

  return (
    <PortalContainerContext.Provider value={container}>
      {children}
      {/*
        Host for Radix portals (Select/Popover/Dropdown etc.) when rendered inside a modal.
        We keep it out of layout flow (absolute) to avoid affecting spacing.
      */}
      <div ref={setHostRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />
    </PortalContainerContext.Provider>
  );
}

export function usePortalContainer() {
  return React.useContext(PortalContainerContext);
}
