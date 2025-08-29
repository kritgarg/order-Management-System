import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";
import config from "../config/env.js";

export const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkConnection = async () => {
    try {
      setIsChecking(true);
      // Use the same API URL as the main app
      const apiUrl = config.API_URL;
      if (!apiUrl) {
        setIsConnected(false);
        setIsChecking(false);
        return;
      }
      const baseUrl = apiUrl.replace('/api', '');
      const response = await fetch(baseUrl);
      if (response.ok) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.log('Connection check failed:', error.message);
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
