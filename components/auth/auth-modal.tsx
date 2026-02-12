"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassInput } from "@/components/ui/glass-input";
import { LiquidButton } from "@/components/ui/liquid-button";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type AuthView = "login" | "register";

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [view, setView] = useState<AuthView>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (view === "login") {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // Success
                if (onSuccess) onSuccess();
                onClose();
            } else {
                // Register
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }

                console.log("Attempting Registration...");
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: email.split("@")[0],
                        }
                    }
                });

                console.log("SignUp Response:", { data, error });

                if (error) throw error;

                if (data.session) {
                    if (onSuccess) onSuccess();
                    onClose();
                } else if (data.user && !data.session) {
                    throw new Error("Please disable 'Confirm Email' in Supabase Dashboard.");
                }


            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const toggleView = () => {
        setView(view === "login" ? "register" : "login");
        setError(null);
        // Keep email, maybe clear password?
        setPassword("");
        setConfirmPassword("");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <GlassPanel className="p-8 space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white">
                        {view === "login" ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-white/50 text-sm">
                        {view === "login"
                            ? "Sign in to create your group"
                            : "Join to start your journey"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <GlassInput
                            type="email"
                            placeholder="Email"
                            icon={Mail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <GlassInput
                            type="password"
                            placeholder="Password"
                            icon={Lock}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {view === "register" && (
                            <GlassInput
                                type="password"
                                placeholder="Confirm Password"
                                icon={Lock}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <LiquidButton className="w-full" isLoading={loading}>
                        {view === "login" ? "Sign In" : "Sign Up"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </LiquidButton>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0a0a0a] px-2 text-white/30">Or</span>
                    </div>
                </div>

                <button
                    onClick={toggleView}
                    className="w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors flex items-center justify-center gap-2"
                >
                    {view === "login" ? (
                        <>
                            <UserPlus className="w-4 h-4" />
                            Create new account
                        </>
                    ) : (
                        <>
                            <LogIn className="w-4 h-4" />
                            I already have an account
                        </>
                    )}
                </button>
            </GlassPanel>
        </Modal>
    );
}
