import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

import type { ReactNode } from "react";

import type { TBrandingNoticeTone } from "@vertix.gg/dashboard/src/features/branding/lib/describe-branding-report";

const NOTICE_TONES = {
    success: {
        icon: CheckCircle2,
        className: "bg-success/10 border-success/40 text-success"
    },
    info: {
        icon: Info,
        className: "bg-accent/10 border-border-accent text-text-accent"
    },
    warning: {
        icon: AlertTriangle,
        className: "bg-warning/10 border-warning/40 text-warning"
    },
    error: {
        icon: XCircle,
        className: "bg-error/10 border-error/40 text-error"
    }
} as const;

export interface BrandingNoticeLineProps {
    tone: TBrandingNoticeTone;
    children: ReactNode;
    /** Drawn at the end of the line - a way to dismiss it, or to try again. */
    action?: ReactNode;
}

/**
 * Function BrandingNoticeLine() :: One sentence about where the profile stands, coloured by how it went.
 */
export function BrandingNoticeLine( { tone, children, action }: BrandingNoticeLineProps ) {
    const { icon: Icon, className } = NOTICE_TONES[ tone ];

    return (
        <div className={ `flex items-start gap-2 px-3 py-2 border rounded-lg text-sm ${ className }` }>
            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">{ children }</div>
            { action }
        </div>
    );
}

export default BrandingNoticeLine;
