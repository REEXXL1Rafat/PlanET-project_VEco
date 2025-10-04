import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Wifi } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { useEffect, useState } from "react";

export const OfflineIndicator = () => {
  const { isOnline } = usePWA();
  const [showAlert, setShowAlert] = useState(false);
  const [justWentOnline, setJustWentOnline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowAlert(true);
      setJustWentOnline(false);
    } else {
      if (showAlert) {
        // User just came back online
        setJustWentOnline(true);
        setTimeout(() => {
          setShowAlert(false);
          setJustWentOnline(false);
        }, 3000);
      }
    }
  }, [isOnline, showAlert]);

  if (!showAlert) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Alert variant={justWentOnline ? "default" : "destructive"}>
        <div className="flex items-center gap-2">
          {justWentOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <AlertDescription>
            {justWentOnline
              ? "You're back online! Syncing data..."
              : "You're offline. Some features may be limited."}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};
