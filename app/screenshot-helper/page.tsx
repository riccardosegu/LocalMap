"use client";

import { MapBackground } from "@/components/ui/map-background";

export default function ScreenshotHelper() {
    return (
        <div className="w-screen h-screen">
            <MapBackground
                interactive={false}
                viewState={{
                    longitude: 9.1900,
                    latitude: 45.4642,
                    zoom: 12,
                    pitch: 60
                }}
            />
        </div>
    );
}
