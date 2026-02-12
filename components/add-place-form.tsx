"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassInput } from "@/components/ui/glass-input";
import { LiquidButton } from "@/components/ui/liquid-button";
import { useActionState, useEffect, useState } from "react";
import { addPlaceAction } from "@/app/actions";
import { MapPin, Star, X } from "lucide-react";

interface AddPlaceFormProps {
    lat: number;
    lng: number;
    groupId: string;
    shareCode: string;
    onClose: () => void;
    onSuccess: (place: any) => void;
}

const initialState = {
    message: "",
    success: false,
    place: null
};

export function AddPlaceForm({ lat, lng, groupId, shareCode, onClose, onSuccess }: AddPlaceFormProps) {
    const [state, formAction, isPending] = useActionState(addPlaceAction, initialState);
    const [rating, setRating] = useState(8);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        if (state.success && state.place) {
            onSuccess(state.place);
        }
    }, [state.success, state.place, onSuccess]);

    return (
        <GlassPanel className="w-full max-w-md mx-auto relative bg-black/80 border-white/20 backdrop-blur-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        Add New Place
                    </h2>
                    <p className="text-sm text-white/50 mt-1">
                        Pinning at <span className="font-mono text-blue-300">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
                    </p>
                </div>

                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="lat" value={lat} />
                    <input type="hidden" name="lng" value={lng} />
                    <input type="hidden" name="groupId" value={groupId} />
                    <input type="hidden" name="shareCode" value={shareCode} />

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Name</label>
                        <GlassInput name="name" placeholder="e.g. Best Pizza Place" required autoFocus />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Description</label>
                        <textarea
                            name="description"
                            placeholder="Why is it special?"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:bg-white/10 focus:border-white/20 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Rating</label>
                        <div className="hidden">
                            <input type="number" name="rating" value={rating} readOnly />
                        </div>
                        <div className="flex items-center gap-2 justify-center p-4 bg-white/5 rounded-2xl border border-white/10">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-6 h-6 transition-colors ${star <= (hoverRating || rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "fill-transparent text-white/20"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="text-center text-xs text-white/40 font-mono">
                            {rating}/10
                        </div>
                    </div>

                    {state.message && (
                        <p className={`text-sm ${state.success ? 'text-green-400' : 'text-red-400'}`}>
                            {state.message}
                        </p>
                    )}

                    <LiquidButton type="submit" className="w-full" isLoading={isPending}>
                        Save Place
                    </LiquidButton>
                </form>
            </div>
        </GlassPanel>
    );
}
