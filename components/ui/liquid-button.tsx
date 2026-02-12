import { cn } from "@/lib/utils";
import React from "react";
import { Loader2 } from "lucide-react";

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "ghost";
    isLoading?: boolean;
}

export function LiquidButton({
    children,
    className,
    variant = "primary",
    isLoading = false,
    disabled,
    ...props
}: LiquidButtonProps) {
    return (
        <button
            disabled={disabled || isLoading}
            className={cn(
                "relative flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold tracking-wide transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",

                // Primary: The "Liquid" Gradient
                variant === "primary" &&
                "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 border border-white/10",

                // Secondary: The "Glass" Button
                variant === "secondary" &&
                "glass-button text-white hover:bg-white/10",

                // Ghost: Text only
                variant === "ghost" &&
                "bg-transparent text-white/70 hover:text-white hover:bg-white/5",

                className
            )}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}
