interface SectionTitleProps {
    title: string;
    hint?: string;
}

export function SectionTitle( { title, hint }: SectionTitleProps ) {
    return (
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold text-text-secondary mb-0">{ title }</h2>
            { hint && <span className="text-xs text-text-muted">{ hint }</span> }
        </div>
    );
}

export default SectionTitle;
