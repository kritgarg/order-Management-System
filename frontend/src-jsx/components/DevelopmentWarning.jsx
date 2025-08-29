import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import config from "../config/env.js";

export const DevelopmentWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const url = import.meta.env.VITE_API_URL;
    setApiUrl(url);
    
    // Show warning if no environment variable is set
    if (!url) {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <Alert className="mb-4 border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <strong>Environment Variable Missing:</strong> VITE_API_URL is not set. 
        The app will not be able to connect to the backend.
        <br />
        <code className="bg-yellow-100 px-2 py-1 rounded text-sm">
          VITE_API_URL=https://order-management-system-backend-amber.vercel.app/api
        </code>
        <br />
        <small className="text-yellow-700">
          Add this to your .env file or Vercel environment variables.
        </small>
      </AlertDescription>
    </Alert>
  );
};
