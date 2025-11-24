import React, { useState } from "react";
import { MessageSquare, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import TwoFactorVerify from "../components/TwoFactorVerify";

export default function LoginPage() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const verify2FA = useAuthStore((state) => state.verify2FA);
  const isLoggingIn = useAuthStore((state) => state.isLoggingIn);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [show2FA, setShow2FA] = useState(false);

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    const result = await login(formData);

    if (result.is2FARequired) {
      setShow2FA(true);
    } else if (result.success) {
      navigate("/"); // redirect home
    }
  };

  const handle2FAVerify = async (token) => {
    const success = await verify2FA({ ...formData, twoFactorToken: token });
    if (success) {
      navigate("/");
    }
  };

  if (show2FA) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#256494" }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <TwoFactorVerify onVerified={handle2FAVerify} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#256494" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: "#256494" }}
          >
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "#256494" }}>
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-2">
            Sign in to your{" "}<span className="font-bold"> ChitChat </span>{" "}account
          </p>
        </div>

        <div className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#256494]"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#256494]"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                className="absolute right-3 top-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoggingIn}
            className="w-full text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all shadow-lg mt-6 flex items-center justify-center gap-2"
            style={{
              backgroundColor: "#256494",
              opacity: isLoggingIn ? 0.7 : 1,
            }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Loading...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-semibold hover:underline"
              style={{ color: "#256494" }}
            >
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
