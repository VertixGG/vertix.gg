import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    description?: string;
}

export function StatCard( { title, value, icon: Icon, description }: StatCardProps ) {
    return (
        <div className="bg-surface border border-border rounded-lg p-4 hover:border-border-accent transition-colors">
            <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary text-sm">{ title }</span>
                <Icon className="w-5 h-5 text-accent-muted" />
            </div>
            <div className="text-2xl font-bold text-text-accent">{ value }</div>
            { description && (
                <div className="text-xs text-text-muted mt-1">{ description }</div>
            ) }
        </div>
    );
}
