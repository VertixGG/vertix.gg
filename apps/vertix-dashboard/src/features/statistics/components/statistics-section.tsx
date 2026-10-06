import { SectionTitle } from "@vertix.gg/dashboard/src/components/section-title";

import type { ReactNode } from "react";

interface StatisticsSectionProps {
    title: string;
    hint?: string;
    children: ReactNode;
}

/**
 * One titled part of the statistics page. Drawn by each part itself rather than by the page, since one
 * read can fill several of them.
 */
export function StatisticsSection( { title, hint, children }: StatisticsSectionProps ) {
    return (
        <section className="mb-8">
            <SectionTitle title={ title } hint={ hint } />
            { children }
        </section>
    );
}

export function StatisticsFailure( { text }: { text: string } ) {
    return <div className="text-text-muted text-center py-8">{ text }</div>;
}

export function StatisticsSkeleton() {
    return <div className="bg-surface border border-border rounded-lg h-56 mb-8 animate-pulse" />;
}

export default StatisticsSection;
