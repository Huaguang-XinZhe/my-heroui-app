"use client";

import React from "react";
import { useBackground } from "@/contexts/BackgroundContext";

export const BackgroundControl: React.FC = () => {
  const { showEffects, toggleEffects } = useBackground();

  return (
    <button
      onClick={toggleEffects}
      className="fixed bottom-4 right-4 rounded-lg bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm hover:bg-white/20"
    >
      {showEffects ? "隐藏光效" : "显示光效"}
    </button>
  );
};

export default BackgroundControl;
