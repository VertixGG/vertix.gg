import { twMerge } from "tailwind-merge";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "secondary";

const base = "relative overflow-hidden inline-flex items-center justify-center gap-2 tw-pill px-5 py-2.5 font-semibold transition-all duration-200 btn-glint";

const variants: Record<Variant, string> = {
    primary: "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border border-[hsl(var(--accent))] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:brightness-110 active:translate-y-[1px]",
    ghost: "bg-transparent text-[hsl(var(--accent))] border border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/12 active:translate-y-[1px]",
    secondary: "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] shadow-[0_6px_16px_rgba(0,0,0,0.2)] active:translate-y-[1px]"
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    icon?: ReactNode;
};

export default function Button( { children, className, variant = "primary", icon, ...rest }: Props ) {
    return (
        <button className={ twMerge( base, variants[ variant ], className ) } { ...rest }>
            <span className="btn-glint-span" aria-hidden="true" />
            { icon && <span className="text-lg">{ icon }</span> }
            <span className="relative z-10">{ children }</span>
        </button>
    );
}
