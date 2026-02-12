"use client";

import React, { useEffect, useMemo } from "react";
// ... imports
import Map, { MapRef, Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { type LngLatBoundsLike } from "mapbox-gl";
import { PlaceData, PoiDetailsCard } from "../poi-details-modal";

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
    selectedPlace?: PlaceData | null;
    onPopupClose?: () => void;
    focusedLocation?: { latitude: number; longitude: number; timestamp?: number } | null;
}

export function MapBackground({
    viewState,
    markers = [],
    onMarkerClick,
    onClick,
    mapStyle = "mapbox://styles/mapbox/standard",
    interactive = true,
    userLocation,
    autoFit = true,
    selectedPlace,
    onPopupClose,
    focusedLocation
}: MapBackgroundProps) {
    const mapRef = React.useRef<MapRef>(null);

    // Auto-zoom to fit markers Logic...
    useEffect(() => {
        if (!mapRef.current || markers.length === 0 || !autoFit) return;
        // Don't auto-fit if we just asked to fly to user or a specific location
        if ((userLocation?.timestamp && Date.now() - userLocation.timestamp < 5000) ||
            (focusedLocation?.timestamp && Date.now() - focusedLocation.timestamp < 5000)) return;

        // ... existing bounds calculation ...
        const longitudes = markers.map(m => m.longitude);
        const latitudes = markers.map(m => m.latitude);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const bounds: LngLatBoundsLike = [[minLng, minLat], [maxLng, maxLat]];
        mapRef.current.fitBounds(bounds, { padding: 80, duration: 1500, pitch: 60 });
    }, [markers, userLocation, autoFit, focusedLocation]);

    // Fly to User Location
    useEffect(() => {
        if (userLocation && mapRef.current) {
            mapRef.current.flyTo({
                center: [userLocation.longitude, userLocation.latitude],
                zoom: 16,
                pitch: 60,
                duration: 2000,
                essential: true
            });
        }
    }, [userLocation]);

    // Fly to Focused Location (POI Click)
    useEffect(() => {
        if (focusedLocation && mapRef.current) {
            mapRef.current.flyTo({
                center: [focusedLocation.longitude, focusedLocation.latitude],
                zoom: 17, // Closer zoom for POI
                pitch: 60,
                duration: 1500,
                essential: true
            });
        }
    }, [focusedLocation]);


    // Handle Map Load... (existing)
    const onMapLoad = (e: any) => {
        const map = e.target;
        if (mapStyle.includes("standard")) {
            try {
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

    return (
        <div className="fixed inset-0 z-0">
            <Map
                ref={mapRef}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                onClick={onClick}
                onLoad={onMapLoad}
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

                            {/* Tooltip (Simple) - Only show if NO popup is open or selected, avoiding clutter */}
                            {marker.title && !selectedPlace && (
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {marker.title}
                                </div>
                            )}
                        </div>
                    </Marker>
                ))}

                {selectedPlace && (
                    <Popup
                        longitude={selectedPlace.lng}
                        latitude={selectedPlace.lat}
                        anchor="bottom"
                        offset={25}
                        closeButton={false}
                        closeOnClick={false}
                        maxWidth="400px"
                        className="poi-popup"
                    >
                        <PoiDetailsCard place={selectedPlace} onClose={() => onPopupClose && onPopupClose()} />
                    </Popup>
                )}

                {/* Styled JSX for Popup transparency overrides */}
                <style jsx global>{`
                    .poi-popup .mapboxgl-popup-content {
                        background: transparent !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                    }
                    .poi-popup .mapboxgl-popup-tip {
                        border-top-color: rgba(0,0,0,0.8) !important; 
                        margin-bottom: -1px; /* visual tweak */
                    }
                `}</style>

            </Map>
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
        </div >
    );
}
