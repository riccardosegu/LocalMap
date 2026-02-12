"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import { X, Calendar, User, Star } from "lucide-react";

export interface PlaceData {
    id: string;
    name: string;
    description: string;
    lat: number;
    lng: number;
    rating: number;
    user_full_name: string;
    created_at?: string;
}

interface PoiDetailsCardProps {
    place: PlaceData;
    onClose: () => void;
}

export function PoiDetailsCard({ place, onClose }: PoiDetailsCardProps) {
    // Format date if available
    const formattedDate = place.created_at
        ? new Date(place.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : "Unknown date";

    return (
        <GlassPanel className="relative w-full min-w-[300px] max-w-sm p-4 space-y-3 backdrop-blur-xl bg-black/80 border-white/10 shadow-2xl">
            {/* Close Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute top-3 right-3 p-1 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
            >
                <X className="w-3.5 h-3.5" />
            </button>

            {/* Header */}
            <div className="space-y-1 pr-6">
                <h2 className="text-lg font-bold text-white break-words leading-tight">{place.name}</h2>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        <span className="font-bold text-xs">{place.rating}</span>
                    </div>
                    <span className="text-xs text-white/30">•</span>
                    <div className="text-xs text-white/50 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{place.user_full_name || "Anonymous"}</span>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5 w-full" />

            {/* Content */}
            <div className="space-y-3">
                <p className="text-white/80 leading-relaxed text-xs">
                    {place.description || "No description provided."}
                </p>

                <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    <span>{formattedDate}</span>
                </div>
            </div>
        </GlassPanel>
    );
}
