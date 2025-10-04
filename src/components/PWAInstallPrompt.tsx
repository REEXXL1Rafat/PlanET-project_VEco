import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { toast } from "sonner";

export const PWAInstallPrompt = () => {
  const { isInstallable, installPWA } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt after 30 seconds if installable
    const timer = setTimeout(() => {
      if (isInstallable) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [isInstallable]);

  const handleInstall = async () => {
    const installed = await installPWA();
    if (installed) {
      toast.success("EcoVerify installed successfully!");
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt || !isInstallable) {
    return null;
  }

  // Check if user previously dismissed
  if (localStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="border-primary/20 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Install EcoVerify</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Install our app for faster access, offline scanning, and a better experience!
              </p>
              <div className="flex gap-2">
                <Button onClick={handleInstall} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </Button>
                <Button onClick={handleDismiss} variant="outline" size="sm">
                  Maybe Later
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
