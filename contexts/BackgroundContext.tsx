"use client";

import React, { createContext, useContext, useState } from "react";

interface BackgroundContextType {
  showEffects: boolean;
  toggleEffects: () => void;
  showTopRightEffect: boolean;
  toggleTopRightEffect: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(
  undefined,
);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [showEffects, setShowEffects] = useState(true);
  const [showTopRightEffect, setShowTopRightEffect] = useState(true);

  const toggleEffects = () => {
    setShowEffects((prev) => !prev);
  };

  const toggleTopRightEffect = () => {
    setShowTopRightEffect((prev) => !prev);
  };

  return (
    <BackgroundContext.Provider
      value={{
        showEffects,
        toggleEffects,
        showTopRightEffect,
        toggleTopRightEffect,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
};
