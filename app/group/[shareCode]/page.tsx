"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MapBackground } from "@/components/ui/map-background";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AddPlaceForm } from "@/components/add-place-form";
import { AuthModal } from "@/components/auth/auth-modal";
import { Plus, X, Loader2, MapPin, Share2 } from "lucide-react";
import Link from "next/link";
import { LiquidButton } from "@/components/ui/liquid-button";

interface GroupData {
    id: string;
    name: string;
    description: string;
    share_code: string;
}

interface PlaceData {
    id: string;
    name: string;
    description: string;
    lat: number;
    lng: number;
    rating: number;
    user_full_name: string;
}

export default function GroupPage() {
    const { shareCode } = useParams();
    const supabase = createClient();

    const [group, setGroup] = useState<GroupData | null>(null);
    const [places, setPlaces] = useState<PlaceData[]>([]);
    const [user, setUser] = useState<any>(null);
    // ... inside component
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Add Place State
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);

    // Auth Modal State
    const [showAuthModal, setShowAuthModal] = useState(false);

    // State to control auto-fitting. 
    // We want to auto-fit on initial load, but disable it once the user adds a place.
    const [autoFitEnabled, setAutoFitEnabled] = useState(true);

    const handleMapClick = (e: any) => {
        if (!isAddingMode || !user) return;
        const { lng, lat } = e.lngLat;
        setTempMarker({ lng, lat });
        setIsAddingMode(false);
    };

    const handlePlaceAdded = (newPlace: any) => {
        // Optimistic update: Add the new place to the list
        // We need to ensure the user_full_name is present (it might not be in the raw return from RPC/action if it just returns the record)
        // The action returns `place` which is the row from `places` table. 
        // We need to attach user info for display consistency.

        const placeWithUser = {
            ...newPlace,
            user_full_name: user?.user_metadata?.full_name || user?.email || "Anonymous"
        };

        // Disable auto-fit so the map doesn't move when we add this place
        setAutoFitEnabled(false);
        setPlaces(prev => [...prev, placeWithUser]);
        setTempMarker(null);
        // NO RELOAD: window.location.reload(); 
    };

    useEffect(() => {
        async function fetchData() {
            // ... (keeping existing fetch logic, just hidden for brevity in replacement if not touched)
            if (!shareCode) return;

            // 0. Check User Session
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });

            // 1. Fetch Group Details
            const { data: groupData, error: groupError } = await supabase.rpc('get_group_by_code', {
                code_input: shareCode as string
            });

            if (groupError) {
                console.error(groupError);
                setError("Failed to load group.");
                setLoading(false);
                return;
            }

            if (!groupData || groupData.length === 0) {
                setError("Group not found. Check the code.");
                setLoading(false);
                return;
            }

            const currentGroup = groupData[0];
            setGroup(currentGroup);

            // 2. Fetch Places for this Group
            const { data: placesData, error: placesError } = await supabase.rpc('get_group_places', {
                group_id_input: currentGroup.id
            });

            if (placesError) {
                console.error("Error fetching places:", placesError);
            } else if (placesData) {
                setPlaces(placesData);
            }

            // 3. User Geolocation (Only if places list is empty or explicitly requested)
            // For now, let's just log it or we could center the map. 
            // Better: update the map view state if we have a ref interactively, but here we just load data.
            // We'll trust MapBackground to handle centering on markers if they exist.
            // If NO markers, we try to center on user.

            setLoading(false);
        }

        fetchData();
    }, [shareCode, supabase]);

    const [viewState, setViewState] = useState<{ longitude: number, latitude: number, zoom: number } | undefined>(undefined);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; timestamp?: number } | null>(null);

    useEffect(() => {
        // Initial Geolocation
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    timestamp: Date.now()
                });
            });
        }
    }, []);

    // Prepare markers for the map
    const mapMarkers = useMemo(() => [
        ...places.map(p => ({
            id: p.id,
            latitude: p.lat,
            longitude: p.lng,
            title: p.name,
        })),
        ...(tempMarker ? [{
            id: 'temp-marker',
            latitude: tempMarker.lat,
            longitude: tempMarker.lng,
            title: 'New Place'
        }] : [])
    ], [places, tempMarker]);

    // ... (rest of render)

    // WAIT, I should fix the RPC first to return loose lat/lng columns.
    // That's cleaner than parsing WKT on the client.

    return (
        <div className="relative min-h-screen">
            {/* Pass Places to Map */}
            <div className={isAddingMode ? "cursor-crosshair" : ""}>
                <MapBackground
                    markers={mapMarkers}
                    // @ts-ignore
                    onClick={handleMapClick}
                    viewState={viewState}
                    userLocation={userLocation}
                    autoFit={autoFitEnabled && !tempMarker}
                />
            </div>

            {/* Locate Me Button */}
            <div className="fixed bottom-24 right-4 z-30 md:bottom-10 md:right-10">
                <button
                    onClick={() => {
                        if ("geolocation" in navigator) {
                            navigator.geolocation.getCurrentPosition((pos) => {
                                console.log("Locate Me Triggered", pos.coords);
                                setUserLocation({
                                    latitude: pos.coords.latitude,
                                    longitude: pos.coords.longitude,
                                    timestamp: Date.now()
                                });
                            }, (err) => console.error(err));
                        }
                    }}
                    className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-xl hover:bg-blue-600 transition-colors"
                >
                    <div className="w-6 h-6 flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24" height="24" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="w-5 h-5"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                        </svg>
                    </div>
                </button>
            </div>

            {/* UI Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start pointer-events-none">

                {/* Header Card */}
                <GlassPanel className="pointer-events-auto p-4 md:p-6 backdrop-blur-xl bg-black/60 border-white/10 max-w-sm">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-white">{group?.name}</h1>
                        <p className="text-sm text-white/60">{group?.description}</p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-full w-fit border border-blue-500/20">
                        <Share2 className="w-3 h-3" />
                        Code: <span className="font-mono font-bold tracking-wider">{group?.share_code}</span>
                    </div>
                </GlassPanel>

                {/* Actions */}
                <div className="pointer-events-auto flex gap-2 ml-auto">
                    {user ? (
                        <LiquidButton
                            className={`px-4 py-2 text-sm ${isAddingMode ? "bg-red-500 hover:bg-red-600 border-red-400" : ""}`}
                            onClick={() => {
                                setIsAddingMode(!isAddingMode);
                                setTempMarker(null);
                            }}
                        >
                            {isAddingMode ? (
                                <>
                                    <X className="w-4 h-4" /> Cancel
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" /> Add Place
                                </>
                            )}
                        </LiquidButton>
                    ) : (
                        <LiquidButton
                            variant="secondary"
                            className="px-4 py-2 text-sm"
                            onClick={() => setShowAuthModal(true)}
                        >
                            Login to Add Place
                        </LiquidButton>
                    )}
                </div>
            </div>

            {/* Add Place Form Overlay */}
            {tempMarker && user && group && (
                <div className="absolute inset-x-0 bottom-0 top-0 z-20 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <AddPlaceForm
                        lat={tempMarker.lat}
                        lng={tempMarker.lng}
                        groupId={group.id}
                        shareCode={group.share_code}
                        onClose={() => setTempMarker(null)}
                        onSuccess={handlePlaceAdded}
                    />
                </div>
            )}

            {/* Places List (Hide when adding) */}
            {!tempMarker && (
                <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none flex justify-center">
                    <GlassPanel className="pointer-events-auto w-full max-w-2xl max-h-[40vh] overflow-y-auto p-0 bg-black/80 backdrop-blur-xl border-white/10">
                        <div className="p-4 border-b border-white/10 sticky top-0 bg-black/40 backdrop-blur-md z-20">
                            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest">
                                {places.length} Recommendations
                            </h3>
                        </div>
                        <div className="p-4 space-y-2">
                            {places.length === 0 && (
                                <div className="p-8 text-center text-white/40">
                                    No places yet. Be the first to add one!
                                </div>
                            )}

                            {places.map((place, i) => (
                                <div key={place.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4 items-center group hover:bg-white/10 transition-colors cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">{place.name}</h4>
                                        <p className="text-xs text-white/50">Added by {place.user_full_name}</p>
                                    </div>
                                    <div className="ml-auto text-yellow-400 font-bold text-sm bg-yellow-400/10 px-2 py-1 rounded-lg">
                                        {place.rating}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </div>
            )}
            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={() => setShowAuthModal(false)}
            />
        </div>
    );
}
