import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import * as fm from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "Rohit" && password === "Rohit@1991") {
      localStorage.setItem("oms_auth", JSON.stringify({ user: "Rohit", ts: Date.now() }));

      // Hint the browser's password manager to save credentials (best-effort)
      try {
        if (window.PasswordCredential && navigator.credentials) {
          const cred = new window.PasswordCredential({
            id: username,
            name: username,
            password,
          });
          // This promise may be rejected in unsupported contexts; ignore errors
          navigator.credentials.store(cred).catch(() => {});
        }
      } catch {}

      navigate("/", { replace: true });
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 p-6">
      <fm.motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <fm.motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Welcome to OMS</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on" name="login" id="login-form">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                </div>
                {error && (
                  <div className="text-red-600 text-sm" role="alert">{error}</div>
                )}
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
        </fm.motion.div>
      </fm.motion.div>
    </div>
  );
}
