"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassInput } from "@/components/ui/glass-input";
import { LiquidButton } from "@/components/ui/liquid-button";
import { AuthModal } from "@/components/auth/auth-modal";
import { useActionState, useState, useEffect } from "react";
import { createGroupAction } from "@/app/actions";
import { Users, ArrowRight, Hash, Copy, Check, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { MapBackground } from "@/components/ui/map-background";

import { createClient } from "@/lib/supabase/client";

const initialState = {
    message: "",
    success: false,
    group: null as any
};

export default function CreateGroupPage() {
    const [state, formAction, isPending] = useActionState(createGroupAction, initialState);
    const [name, setName] = useState("");
    const [customCode, setCustomCode] = useState("");
    const [copied, setCopied] = useState(false);

    // Auth State
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // If not logged in, show the modal
                setShowAuthModal(true);
            }
            setIsLoadingAuth(false);
        };
        checkAuth();

        // Listen for auth changes to auto-close modal or redirect
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setShowAuthModal(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [router, supabase]);

    const handleCopy = () => {
        if (!state.group) return;
        const link = `${window.location.origin}/group/${state.group?.share_code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoadingAuth) {
        return null; // Or a loading spinner
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden">

            <MapBackground
                interactive={false}
                viewState={{
                    longitude: 12.4964,
                    latitude: 41.9028,
                    zoom: 12,
                    pitch: 0
                }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
            />
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-0" />

            <div className="relative z-10 w-full max-w-md">

                {!state.success ? (
                    <GlassPanel className="space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="space-y-2 text-center">
                            <h1 className="text-3xl font-bold text-white">Create Circle</h1>
                            <p className="text-white/50">Start a new map for your friends.</p>
                        </div>

                        <form action={formAction} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-white/60 uppercase tracking-widest pl-1">Group Name</label>
                                    <GlassInput
                                        name="name"
                                        placeholder="e.g. Summer Trip 2024"
                                        icon={Users}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center pl-1 pr-1">
                                        <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Group Code</label>
                                        <span className="text-[10px] text-white/40 uppercase">Optional</span>
                                    </div>
                                    <GlassInput
                                        name="customCode"
                                        placeholder="e.g. ROMA24"
                                        icon={Hash}
                                        value={customCode}
                                        onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                        className="font-mono tracking-wider uppercase"
                                    />
                                    <p className="text-[10px] text-white/30 pl-1">
                                        Leave empty for a random code. This code is used to join the group.
                                    </p>
                                </div>
                            </div>

                            {state.message && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                    {state.message}
                                </div>
                            )}

                            <LiquidButton className="w-full" isLoading={isPending}>
                                Create Group
                            </LiquidButton>
                        </form>
                    </GlassPanel>
                ) : (
                    // Success View
                    <GlassPanel className="space-y-8 animate-in zoom-in-95 duration-500 border-green-500/30 bg-green-900/10">
                        <div className="space-y-4 text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400 mb-4 animate-bounce">
                                <Check className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Group Created!</h2>
                            <p className="text-white/60">Your circle is ready.</p>
                        </div>

                        <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4 text-center">
                            <div className="text-xs text-white/40 uppercase tracking-widest">Share Code</div>
                            <div className="text-4xl font-mono font-bold text-blue-400 tracking-widest select-all">
                                {state.group?.share_code}
                            </div>
                            <p className="text-xs text-white/30">Anyone with this code can verify & join.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <LiquidButton variant="secondary" onClick={handleCopy}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? "Copied" : "Copy Link"}
                            </LiquidButton>

                            <LiquidButton onClick={() => router.push(`/group/${state.group?.share_code}`)}>
                                Enter Map <ArrowRight className="w-4 h-4" />
                            </LiquidButton>
                        </div>
                    </GlassPanel>
                )}
            </div>

            {/* Auth Modal - Forced if not logged in */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => router.push("/")} // If closed without login, go home
                onSuccess={() => setShowAuthModal(false)}
            />
        </div>
    );
}
