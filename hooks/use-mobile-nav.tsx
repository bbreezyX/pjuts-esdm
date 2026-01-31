"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface MobileNavContextType {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  setAutoHide: (enabled: boolean) => void;
  autoHideEnabled: boolean;
}

const MobileNavContext = createContext<MobileNavContextType | null>(null);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [autoHideEnabled, setAutoHideEnabled] = useState(false);

  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);
  const toggle = useCallback(() => setIsVisible((v) => !v), []);
  const setAutoHide = useCallback((enabled: boolean) => {
    setAutoHideEnabled(enabled);
    if (enabled) {
      // When enabling auto-hide, hide the nav immediately
      setIsVisible(false);
    } else {
      // When disabling, show the nav
      setIsVisible(true);
    }
  }, []);

  return (
    <MobileNavContext.Provider
      value={{ isVisible, show, hide, toggle, setAutoHide, autoHideEnabled }}
    >
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  const context = useContext(MobileNavContext);
  if (!context) {
    // Return a default implementation if used outside provider
    return {
      isVisible: true,
      show: () => {},
      hide: () => {},
      toggle: () => {},
      setAutoHide: () => {},
      autoHideEnabled: false,
    };
  }
  return context;
}
