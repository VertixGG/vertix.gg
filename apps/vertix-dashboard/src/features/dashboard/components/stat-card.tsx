import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    description?: string;
}

export function StatCard( { title, value, icon: Icon, description }: StatCardProps ) {
    return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">{ title }</span>
                <Icon className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="text-2xl font-bold text-white">{ value }</div>
            { description && (
                <div className="text-xs text-zinc-500 mt-1">{ description }</div>
            ) }
        </div>
    );
}
