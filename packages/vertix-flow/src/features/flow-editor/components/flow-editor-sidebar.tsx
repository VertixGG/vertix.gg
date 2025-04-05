import React from "react";

import { useFlowEditorContext } from "@vertix.gg/flow/src/features/flow-editor/context/flow-editor-context";
import { GuildSelector } from "@vertix.gg/flow/src/features/guild-selector/components/guild-selector";
import { LoadingIndicator } from "@vertix.gg/flow/src/features/flow-editor/components/ui/loading-indicator";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vertix.gg/flow/src/shared/components/tabs";
import { Badge } from "@vertix.gg/flow/src/shared/components/badge";
import { FlowList } from "@vertix.gg/flow/src/features/flow-list/components/flow-list";
import { ModuleSelector } from "@vertix.gg/flow/src/features/module-selector/components/module-selector";

export const FlowEditorSidebar: React.FC = () => {
    const {
        selectedGuildId,
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

            {!selectedGuildId ? (
                <React.Suspense fallback={
                    <div className="flex items-center justify-center h-full p-4">
                         <LoadingIndicator />
                         <p className="ml-2">Loading servers...</p>
                    </div>
                }>
                     <GuildSelector />
                </React.Suspense>
            ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col min-h-0">
                    <div className="p-4 border-b">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="modules">Modules</TabsTrigger>
                            <TabsTrigger value="flows">Flows</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="modules" className="flex-grow overflow-y-auto pt-1">
                        <ModuleSelector onSelectModule={handleModuleClick} />
                    </TabsContent>

                    <TabsContent value="flows" className="flex-grow overflow-y-auto p-4">
                        {modulePath ? (
                            <FlowList onSelectFlow={handleFlowClick} />
                        ) : (
                            <p className="text-sm text-center text-muted-foreground">Please select a module first</p>
                        )}
                    </TabsContent>
                </Tabs>
            )}

            <div className="p-2 border-t flex items-center justify-center gap-2 bg-muted/30 mt-auto">
                <Badge variant="outline" className="text-xs">
                    Zoom: {Math.round( zoomLevel * 100 )}%
                </Badge>
            </div>
        </>
    );
};
