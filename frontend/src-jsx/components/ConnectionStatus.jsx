import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkConnection = async () => {
    try {
      setIsChecking(true);
      const response = await fetch('http://localhost:3000');
      if (response.ok) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {isChecking ? (
        <Badge variant="secondary" className="text-xs">
          Checking connection...
        </Badge>
      ) : isConnected ? (
        <Badge variant="default" className="text-xs bg-green-600">
          <Wifi className="w-3 h-3 mr-1" />
          Backend Connected
        </Badge>
      ) : (
        <Badge variant="destructive" className="text-xs">
          <WifiOff className="w-3 h-3 mr-1" />
          Backend Disconnected
        </Badge>
      )}
    </div>
  );
};
