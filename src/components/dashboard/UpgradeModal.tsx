import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UPGRADE_MODAL_DISMISSED_KEY = "upgrade-modal-dismissed";

export function UpgradeModal() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = sessionStorage.getItem(UPGRADE_MODAL_DISMISSED_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(UPGRADE_MODAL_DISMISSED_KEY, "true");
  };

  const handleUpgrade = () => {
    navigate("/upgrades");
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-fade-in md:left-[280px]">
      <Card className="bg-card border-border rounded-xl shadow-lg max-w-[280px]">
        <CardContent className="p-5 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-warning/20 mb-4">
            <Crown className="w-6 h-6 text-warning" />
          </div>

          <h3 className="font-bold text-lg text-foreground mb-2">
            Upgrade to Premium!
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Unlock unlimited funnels, boards, and credits. Get access to all templates and priority support.
          </p>

          <Button
            onClick={handleUpgrade}
            className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
          >
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
