import { twMerge } from "tailwind-merge";

import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    className?: string;
}>;

export default function DocCard( { children, className }: Props ) {
    return (
        <div className={ twMerge( "rounded-md border border-[hsl(var(--border))] bg-[var(--surface)]", className ) }>
            { children }
        </div>
    );
}
