import React from "react";

import { useFlowEditorContext } from "@vertix.gg/flow/src/features/flow-editor/context/flow-editor-context";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vertix.gg/flow/src/shared/components/tabs";
import { Badge } from "@vertix.gg/flow/src/shared/components/badge";
import { FlowList } from "@vertix.gg/flow/src/features/flow-list/components/flow-list";
import { ModuleSelector } from "@vertix.gg/flow/src/features/module-selector/components/module-selector";

export const FlowEditorSidebar: React.FC = () => {
    const {
        activeTab,
        setActiveTab,
        modulePath,
        zoomLevel,
        handleModuleClick,
        handleFlowClick,
    } = useFlowEditorContext();

    return (
        <>
            <div className="p-4 border-b bg-primary/5">
                <h1 className="text-xl font-bold text-center text-primary">Vertix Flow Panel</h1>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow">
                <div className="p-4 border-b">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="modules">Modules</TabsTrigger>
                        <TabsTrigger value="flows">Flows</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="modules" className="pt-1 h-full overflow-y-auto">
                    <ModuleSelector
                        onSelectModule={handleModuleClick}
                    />
                </TabsContent>

                <TabsContent value="flows" className="p-4 h-full overflow-y-auto">
                    {modulePath ? (
                        <FlowList
                            onSelectFlow={handleFlowClick}
                        />
                    ) : (
                        <p className="text-sm text-center text-muted-foreground">Please select a module first</p>
                    )}
                </TabsContent>
            </Tabs>

            <div className="p-2 border-t flex items-center justify-center gap-2 bg-muted/30">
                <Badge variant="outline" className="text-xs">
                    Zoom: {Math.round( zoomLevel * 100 )}%
                </Badge>
            </div>
        </>
    );
};
