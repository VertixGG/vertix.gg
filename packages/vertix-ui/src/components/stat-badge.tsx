type Props = {
    label: string;
    value: string;
    accent?: string;
};

export default function StatBadge( { label, value, accent }: Props ) {
    return (
        <div className="rounded-md border border-[hsl(var(--border))]/45 bg-muted/30 p-4 flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]">
                { label }
            </span>
            <span className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                { value }
                { accent && <span className="text-[hsl(var(--accent))] ml-1">{ accent }</span> }
            </span>
        </div>
    );
}
