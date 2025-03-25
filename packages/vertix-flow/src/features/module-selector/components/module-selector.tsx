import React, { useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/shared/components/card";
import { useUIModules } from "@vertix.gg/flow/src/features/module-selector/hooks/use-ui-modules";

import useModuleSelectorStore from "@vertix.gg/flow/src/features/module-selector/store/module-selector-store";

import type { UIModuleFile } from "@vertix.gg/flow/src/shared/types/flow";

interface ModuleSelectorProps {
    onSelectModule?: ( module: UIModuleFile ) => void;
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ( { onSelectModule } ) => {
    const { selectedModule, setSelectedModule, modules,setModules } = useModuleSelectorStore();
    const uiModulesResource = useUIModules();

    const resource = uiModulesResource.read?.().data;

    useEffect( () => {
        if ( resource ) {
            setModules( resource.uiModules );
        }
    }, [ resource, setModules ] );

    if ( !modules ) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>UI Modules</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-neutral-500">Loading modules...</p>
                </CardContent>
            </Card>
        );
    }

    const handleModuleClick = ( module: UIModuleFile ) => {
        setSelectedModule( module );
        if ( onSelectModule ) {
            onSelectModule( module );
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>UI Modules</CardTitle>
            </CardHeader>
            <CardContent>
                {modules.length > 0 ? (
                    <div className="space-y-2">
                        {modules.map( ( module, index ) => (
                            <div
                                key={index}
                                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                                    selectedModule?.path === module.path
                                        ? "bg-blue-100 border-blue-300"
                                        : "hover:bg-neutral-100"
                                }`}
                                onClick={() => handleModuleClick( module )}
                            >
                                <div className="font-medium">{module.name}</div>
                                <div className="text-xs text-neutral-500 mt-1">
                                    {module.path}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {module.flows.length > 0 && (
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                            {module.flows.length} flow(s)
                                        </span>
                                    )}
                                    {module.adapters.length > 0 && (
                                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                            {module.adapters.length} adapter(s)
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) )}
                    </div>
                ) : (
                    <p className="text-sm text-neutral-500">No UI modules found</p>
                )}
            </CardContent>
        </Card>
    );
};
