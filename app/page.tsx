"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import { LiquidButton } from "@/components/ui/liquid-button";
import { GlassInput } from "@/components/ui/glass-input";
import { AuthModal } from "@/components/auth/auth-modal";
import { Search, MapPin, Users, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { validateGroupCode } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; } | null>(null);

  // Auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsCheckingAuth(false);

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });

      return () => subscription.unsubscribe();
    };

    checkAuth();

    // Attempt to get user location on mount
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.log("Geolocation denied or error:", err);
          // Fallback to Milan is handled by initialViewState if userLocation remains null
        }
      );
    }
  }, [supabase]);

  const handleCreateGroup = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/create-group");
    } else {
      setShowAuthModal(true);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (joinCode.length > 0) {
      setIsLoading(true);

      const result = await validateGroupCode(joinCode);

      if (result.valid) {
        router.push(`/group/${result.code}`);
      } else {
        setError("Invalid group code. Please try again.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-20">


      {/* Background Map: Static Image for Homepage Performance */}
      <div className="fixed inset-0 z-0">
        <img
          src="/mapbg_3.png"
          alt="Map Background"
          className="w-full h-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Dark Overlay for extra contrast */}
      <div className="fixed inset-0 z-0 bg-black/40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl text-center space-y-8">

        {/* Header Section with Glass Effect for Visibility */}
        <GlassPanel variant="ghost" className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700 bg-black/20 backdrop-blur-md border-white/5 p-8 rounded-[3rem]">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-4">
            <span className="text-xs font-medium text-blue-300 tracking-wider uppercase">Social Travel Map</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-white drop-shadow-xl">
            Local<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Map</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-lg mx-auto font-light leading-relaxed drop-shadow-md">
            Create shared circles. Pin your favorite spots.{" "}
            <br className="hidden sm:block" />
            Explore the city together.
          </p>
        </GlassPanel>

        {/* Action Panel */}
        <GlassPanel className="p-8 md:p-10 space-y-8 backdrop-blur-3xl bg-black/40 border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-200">

          {!isJoining ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiquidButton
                  className="w-full text-lg h-14"
                  onClick={handleCreateGroup}
                  isLoading={isCheckingAuth} // Show loading state while checking auth
                >
                  <Users className="w-5 h-5" />
                  Create Group
                </LiquidButton>

                <LiquidButton
                  variant="secondary"
                  className="w-full text-lg h-14"
                  onClick={() => setIsJoining(true)}
                >
                  <ArrowRight className="w-5 h-5" />
                  Join Existing
                </LiquidButton>
              </div>

              <p className="text-sm text-white/40">
                No account needed to browse your friends' map
              </p>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-6 animate-in slide-in-from-right-10 duration-300">
              <div className="space-y-4">
                <div className="text-left">
                  <button
                    type="button"
                    onClick={() => setIsJoining(false)}
                    className="text-xs text-white/50 hover:text-white mb-2 flex items-center gap-1"
                  >
                    ← Back
                  </button>
                  <h3 className="text-xl font-bold text-white">Enter Group Code</h3>
                </div>

                <GlassInput
                  placeholder="e.g. ROMA24"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  className="text-center tracking-widest font-mono text-xl uppercase"
                  autoFocus
                  required
                />

                {error && (
                  <div className="flex items-center justify-center gap-2 text-red-400 text-sm bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <LiquidButton isLoading={isLoading} className="w-full h-12">
                  Enter Group
                </LiquidButton>
              </div>
            </form>
          )}

        </GlassPanel>

      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          router.push("/create-group");
        }}
      />
    </div>
  );
}
