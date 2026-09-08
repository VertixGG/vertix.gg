import { Link } from "react-router-dom";

import { Boxes, Radio, BookOpen, MessageSquare } from "lucide-react";

import type { LucideIcon } from "lucide-react";

interface QuickAction {
    icon: LucideIcon;
    title: string;
    body: string;
    to: string;
    external?: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
    {
        icon: Boxes,
        title: "Interface Editor",
        body: "Reword and rearrange the buttons members see in their channel.",
        to: "/interface-editor"
    },
    {
        icon: Radio,
        title: "Generators",
        body: "Create generators, set defaults, and tune each one of them.",
        to: "/generators"
    },
    {
        icon: BookOpen,
        title: "Feature guide",
        body: "What every button does, with the interface shown as members see it.",
        to: "https://voicechannels.online/features/dynamic-channel-v3",
        external: true
    },
    {
        icon: MessageSquare,
        title: "Support server",
        body: "Ask a question, report something, or suggest what to build next.",
        to: "https://discord.gg/dEwKeQefUU",
        external: true
    }
];

function ActionBody( { action }: { action: QuickAction } ) {
    const Icon = action.icon;

    return (
        <>
            <Icon className="w-5 h-5 text-accent-muted mb-3" />
            <h3 className="text-text-accent font-semibold mb-1">{ action.title }</h3>
            <p className="text-text-muted text-sm mb-0">{ action.body }</p>
        </>
    );
}

const CARD_CLASS_NAME = "bg-surface border border-border hover:border-border-accent rounded-lg p-4 "
    + "transition-colors block";

/**
 * Where a reader goes next, since a dashboard is a place people pass through rather than sit in.
 */
export function QuickActions() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            { QUICK_ACTIONS.map( ( action ) => action.external ? (
                <a
                    key={ action.title }
                    className={ CARD_CLASS_NAME }
                    href={ action.to }
                    target="_blank"
                    rel="noreferrer"
                >
                    <ActionBody action={ action } />
                </a>
            ) : (
                <Link key={ action.title } className={ CARD_CLASS_NAME } to={ action.to }>
                    <ActionBody action={ action } />
                </Link>
            ) ) }
        </div>
    );
}
