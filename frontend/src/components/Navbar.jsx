import React from "react";
import { MessageSquare, Settings, User, LogOut, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { authUser, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isProfilePage = location.pathname === "/profile";

  return (
    <header
      className="fixed w-full top-0 z-40 border-b shadow-sm"
      style={{
        backgroundColor: "rgba(17, 38, 63, 0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-all"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">ChitChat</h1>
          </a>

          {/* Buttons */}
          <div className="flex items-center gap-2"> 
            {authUser && (
              <>
                {isProfilePage ? (
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                ) : (
                  <a
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">Profile</span>
                  </a>
                )}

                {/* Logout */}
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors text-sm font-medium"
                  onClick={logout}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
