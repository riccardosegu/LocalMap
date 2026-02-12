"use client";

import { MapBackground } from "@/components/ui/map-background";

export default function ScreenshotMapPage() {
    return (
        <div className="w-screen h-screen">
            <MapBackground
                initialViewState={{
                    longitude: 9.0864,
                    latitude: 45.8107,
                    zoom: 13,
                    pitch: 60,
                }}
                interactive={true}
                mapStyle="mapbox://styles/mapbox/standard"
            />
        </div>
    );
}
