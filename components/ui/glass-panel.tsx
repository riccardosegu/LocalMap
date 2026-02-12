import { cn } from "@/lib/utils";
import React from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: "default" | "dark" | "ghost";
}

export function GlassPanel({
    children,
    className,
    variant = "default",
    ...props
}: GlassPanelProps) {
    return (
        <div
            className={cn(
                "glass-panel rounded-3xl p-6 transition-all duration-300",
                variant === "default" && "bg-black/20 border-white/10 shadow-xl backdrop-blur-xl",
                variant === "dark" && "bg-black/30 border-white/5",
                variant === "ghost" && "bg-transparent border-transparent shadow-none hover:bg-white/5",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
