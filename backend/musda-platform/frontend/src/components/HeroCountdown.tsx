import React from "react";
import { CountdownTimer } from "./CountdownTimer";

interface HeroCountdownProps {
  targetDate: string;
}

export const HeroCountdown: React.FC<HeroCountdownProps> = ({ targetDate }) => {
  // Fallback jika targetDate kosong atau invalid
  const validTargetDate = targetDate || "2025-10-28T08:00:00";
  
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <CountdownTimer targetDate={validTargetDate} />
    </div>
  );
};
