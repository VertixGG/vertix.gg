import React, { useEffect } from "react";

import { useUIModules } from "@vertix.gg/flow/src/features/module-selector/hooks/use-ui-modules";
import { ScrollArea } from "@vertix.gg/flow/src/shared/components/scroll-area";
import { Button } from "@vertix.gg/flow/src/shared/components/button";
import { Badge } from "@vertix.gg/flow/src/shared/components/badge";

import useModuleSelectorStore from "@vertix.gg/flow/src/features/module-selector/store/module-selector-store";

import type { UIModuleFile } from "@vertix.gg/flow/src/shared/types/flow";

interface ModuleSelectorProps {
    onSelectModule?: ( module: UIModuleFile ) => void;
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ( { onSelectModule } ) => {
    const { selectedModule, setSelectedModule, modules, setModules } = useModuleSelectorStore();
    const uiModulesResource = useUIModules();

    const resource = uiModulesResource.read?.().data;

    useEffect( () => {
        if ( resource ) {
            setModules( resource.uiModules );
        }
    }, [ resource, setModules ] );

    const handleModuleClick = ( module: UIModuleFile ) => {
        setSelectedModule( module );
        if ( onSelectModule ) {
            onSelectModule( module );
        }
    };

    return (
            <>
                <h2 className="p-2">UI Modules</h2>
                { modules.length > 0 ? (
                        <ScrollArea className="h-[90%]">
                            <div className="space-y-2">
                                { modules.map( ( module, index ) => (
                                        <React.Fragment key={ index }>
                                            <Button
                                                    variant="ghost"
                                                    className={ `w-full justify-start py-3 h-auto font-normal hover:bg-muted ${
                                                            selectedModule?.path === module.path
                                                                    ? "bg-primary/10 border-primary/30"
                                                                    : ""
                                                    }` }
                                                    onClick={ () => handleModuleClick( module ) }
                                            >
                                                <div className="flex flex-col items-start gap-2 w-full">
                                                    <div className="font-medium">{ module.name }</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        { module.path }
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        { module.flows?.length > 0 && (
                                                                <Badge variant="secondary">
                                                                    { module.flows.length } UI flow(s)
                                                                </Badge>
                                                        ) }
                                                        { module.systemFlows?.length > 0 && (
                                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                { module.systemFlows.length } System flow(s)
                                                            </Badge>
                                                        ) }
                                                        { module.adapters.length > 0 && (
                                                                <Badge variant="outline">
                                                                    { module.adapters.length } adapter(s)
                                                                </Badge>
                                                        ) }
                                                    </div>
                                                </div>
                                            </Button>

                                        </React.Fragment>
                                ) ) }
                            </div>
                        </ScrollArea>
                ) : (
                        <p className="text-sm text-muted-foreground">No UI modules found</p>
                ) }
            </>
    );
};
