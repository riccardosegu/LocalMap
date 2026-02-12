"use client";

import React, { useEffect, useMemo } from "react";
import Map, { MapRef, Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { type LngLatBoundsLike } from "mapbox-gl";

export interface PlaceMarker {
    id: string;
    latitude: number;
    longitude: number;
    color?: string;
    title?: string;
}

interface MapBackgroundProps {
    viewState?: {
        longitude: number;
        latitude: number;
        zoom: number;
        pitch?: number;
    };
    markers?: PlaceMarker[];
    onMarkerClick?: (placeId: string) => void;
    onClick?: (e: any) => void;
    mapStyle?: string;
    interactive?: boolean;
    userLocation?: { latitude: number; longitude: number; timestamp?: number } | null;
    autoFit?: boolean;
}

export function MapBackground({
    viewState,
    markers = [],
    onMarkerClick,
    onClick,
    mapStyle = "mapbox://styles/mapbox/standard", // Updated to Standard
    interactive = true,
    userLocation,
    autoFit = true
}: MapBackgroundProps) {
    const mapRef = React.useRef<MapRef>(null);

    console.log("MAP BACKGROUND COMPONENT RENDERED");

    // Auto-zoom to fit markers (Initial or when markers change drastically)
    useEffect(() => {
        if (!mapRef.current || markers.length === 0 || !autoFit) return;
        // Don't auto-fit if we just asked to fly to user (recent timestamp)
        if (userLocation && userLocation.timestamp && Date.now() - userLocation.timestamp < 5000) return;

        // ... build bounds ...
        const longitudes = markers.map(m => m.longitude);
        const latitudes = markers.map(m => m.latitude);

        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);

        const bounds: LngLatBoundsLike = [[minLng, minLat], [maxLng, maxLat]];
        mapRef.current.fitBounds(bounds, { padding: 80, duration: 1500, pitch: 60 }); // Increased pitch for 3D effect
    }, [markers, userLocation, autoFit]);

    // Handle Map Load to set Config
    const onMapLoad = (e: any) => {
        const map = e.target;
        // console.log("Map Loaded, setting config for style:", mapStyle); 

        if (mapStyle.includes("standard")) {
            try {
                // Set the config for the Standard style
                map.setConfig('basemap', {
                    lightPreset: 'night',
                    showPointOfInterestLabels: true,
                    showTransitLabels: true
                });
            } catch (error) {
                console.error("Error setting map config:", error);
            }
        }
    };

    useEffect(() => {
        console.log("MapBackground: userLocation effect triggered", userLocation);
        if (userLocation && mapRef.current) {
            console.log("Flying to:", userLocation);
            mapRef.current.flyTo({
                center: [userLocation.longitude, userLocation.latitude],
                zoom: 16,
                pitch: 60,
                duration: 2000,
                essential: true
            });
        } else {
            console.log("MapBackground: skipping flyTo. mapRef:", !!mapRef.current, "userLocation:", userLocation);
        }
    }, [userLocation]);

    return (
        <div className="fixed inset-0 z-0">
            <Map
                ref={mapRef}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                onClick={onClick}
                onLoad={onMapLoad} // Use onLoad to guarantee map instance is ready
                initialViewState={
                    viewState || {
                        longitude: 12.4964,
                        latitude: 41.9028,
                        zoom: 11,
                        pitch: 60,
                    }
                }
                style={{ width: "100%", height: "100%" }}
                mapStyle={mapStyle}
                attributionControl={false}
                reuseMaps
                scrollZoom={interactive}
                dragPan={interactive}
                doubleClickZoom={interactive}
                touchZoomRotate={interactive}
            >
                {userLocation && (
                    <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
                        <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-lg"></span>
                        </span>
                    </Marker>
                )}

                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        longitude={marker.longitude}
                        latitude={marker.latitude}
                        anchor="bottom"
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            onMarkerClick && onMarkerClick(marker.id);
                        }}
                    >
                        <div className="relative group cursor-pointer transition-transform hover:scale-110 duration-200">
                            {/* Glow Effect */}
                            <div className="absolute -inset-2 bg-blue-500/50 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity" />

                            {/* Pin */}
                            <div className="relative flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full border border-white/20 shadow-xl">
                                <div className="w-2 h-2 bg-white rounded-full" />
                            </div>

                            {/* Tooltip (Simple) */}
                            {marker.title && (
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {marker.title}
                                </div>
                            )}
                        </div>
                    </Marker>
                ))}
            </Map>
            {/* Overlay gradient to ensure UI text legibility over the map */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
        </div >
    );
}
