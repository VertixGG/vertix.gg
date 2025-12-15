import { uiExportLoader } from "@vertix.gg/api/src/bootstrap";

import type { ModulesResponse } from "@vertix.gg/api/src/server/types";

export async function getModulesData(): Promise<ModulesResponse> {
    const exportData = await uiExportLoader.loadExports();

    const modules = exportData.meta.moduleSummary.map( summary => {
        const parts = summary.module.split( "/" );
        const shortName = parts.length >= 2 ? parts[ parts.length - 2 ] : parts[ 0 ];

        return {
            name: summary.module,
            shortName,
            flows: summary.flows,
            components: summary.components
        };
    } );

    return { modules };
}
