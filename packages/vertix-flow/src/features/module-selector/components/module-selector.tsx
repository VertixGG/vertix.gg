import React, { useEffect } from "react";

import { useUIModules } from "@vertix.gg/flow/src/features/module-selector/hooks/use-ui-modules";
import { Badge } from "@vertix.gg/flow/src/shared/components/badge";
import useModuleSelectorStore from "@vertix.gg/flow/src/features/module-selector/store/module-selector-store";
import { ItemSelectorList } from "@vertix.gg/flow/src/shared/components/item-selector-list";
import { LoadingIndicator } from "@vertix.gg/flow/src/features/flow-editor/components/ui/loading-indicator";

import type { UIModuleFile } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

interface ModuleSelectorProps {
    onSelectModule?: ( module: UIModuleFile ) => void;
}

const ModuleSelectorInner: React.FC<ModuleSelectorProps> = ( { onSelectModule } ) => {
    const { selectedModule, setSelectedModule, modules, setModules } = useModuleSelectorStore();
    const uiModulesResource = useUIModules();

    const resource = uiModulesResource.read().data;

    useEffect( () => {
        if ( resource?.uiModules ) {
            setModules( resource.uiModules );
        }
    }, [ resource, setModules ] );

    const getItemId = ( module: UIModuleFile ): string => module.path;

    const renderItemContent = ( module: UIModuleFile ): React.ReactNode => (
        <div className="flex flex-col items-start gap-2 w-full">
            <div className="font-medium">{module.name}</div>
            <div className="text-xs text-muted-foreground">{module.path}</div>
            <div className="flex flex-wrap gap-1">
                {module.flows?.length > 0 && (
                    <Badge variant="secondary">{module.flows.length} UI flow(s)</Badge>
                )}
                {module.systemFlows?.length > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {module.systemFlows.length} System flow(s)
                    </Badge>
                )}
                {module.adapters.length > 0 && (
                    <Badge variant="outline">{module.adapters.length} adapter(s)</Badge>
                )}
            </div>
        </div>
    );

    const handleSelectItem = ( module: UIModuleFile ) => {
        setSelectedModule( module );
        if ( onSelectModule ) {
            onSelectModule( module );
        }
    };

    return (
        <ItemSelectorList<UIModuleFile>
            title="UI Modules"
            items={modules}
            selectedItemId={selectedModule?.path ?? null}
            getItemId={getItemId}
            renderItemContent={renderItemContent}
            onSelectItem={handleSelectItem}
            emptyStateMessage="No UI modules found"
            containerClassName="h-full"
            listClassName="p-2 pt-0"
        />
    );
};

export const ModuleSelector: React.FC<ModuleSelectorProps> = ( props ) => {
    return (
        <React.Suspense fallback={
            <div className="flex items-center justify-center h-full p-4">
                <LoadingIndicator />
                <p className="ml-2">Loading modules...</p>
            </div>
        }>
            <ModuleSelectorInner {...props} />
        </React.Suspense>
    );
};
