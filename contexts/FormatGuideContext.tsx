"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FormatGuideContextType {
  showFormatGuide: boolean;
  setShowFormatGuide: (show: boolean) => void;
  toggleFormatGuide: () => void;
}

const FormatGuideContext = createContext<FormatGuideContextType | undefined>(
  undefined,
);

export function FormatGuideProvider({ children }: { children: ReactNode }) {
  const [showFormatGuide, setShowFormatGuide] = useState(false);

  const toggleFormatGuide = () => {
    setShowFormatGuide(!showFormatGuide);
  };

  return (
    <FormatGuideContext.Provider
      value={{
        showFormatGuide,
        setShowFormatGuide,
        toggleFormatGuide,
      }}
    >
      {children}
    </FormatGuideContext.Provider>
  );
}

export function useFormatGuide() {
  const context = useContext(FormatGuideContext);
  if (context === undefined) {
    throw new Error("useFormatGuide must be used within a FormatGuideProvider");
  }
  return context;
}
