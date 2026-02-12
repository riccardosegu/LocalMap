import { cn } from "@/lib/utils";
import React from "react";
import { LucideIcon } from "lucide-react";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
    ({ className, icon: Icon, ...props }, ref) => {
        return (
            <div className="relative w-full group">
                {Icon && (
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white/80 transition-colors" />
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all duration-300",
                        "focus:bg-white/10 focus:border-white/20 focus:ring-2 focus:ring-blue-500/20",
                        Icon && "pl-12",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
GlassInput.displayName = "GlassInput";
