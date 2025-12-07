import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import apexLogo from "@/assets/apex-logo-auth.png";

interface PostLoginLoadingProps {
  onComplete: () => void;
}

export const PostLoginLoading = ({ onComplete }: PostLoginLoadingProps) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const intervals = [
      { delay: 100, value: 15 },
      { delay: 400, value: 35 },
      { delay: 800, value: 55 },
      { delay: 1200, value: 75 },
      { delay: 1600, value: 90 },
      { delay: 2000, value: 100 },
    ];

    const timers = intervals.map(({ delay, value }) =>
      setTimeout(() => setProgress(value), delay)
    );

    // When progress reaches 100%, start fade out
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2200);

    // Complete after fade out
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2700);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center space-y-8">
        {/* Logo with pulse animation */}
        <div className="animate-pulse">
          <img src={apexLogo} alt="Apex Logo" className="h-16 w-auto" />
        </div>

        {/* Progress bar */}
        <div className="w-64">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Loading text */}
        <p className="text-sm text-muted-foreground animate-pulse">
          Preparando sua experiência...
        </p>
      </div>
    </div>
  );
};
