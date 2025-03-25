import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vertix.gg/flow/src/shared/components/tabs";
import { Card } from "@vertix.gg/flow/src/shared/components/card";
import { FlowList } from "@vertix.gg/flow/src/features/flow-list/components/flow-list";
import { ModuleSelector } from "@vertix.gg/flow/src/features/module-selector/components/module-selector";

import type { UIModuleFile } from "@vertix.gg/flow/src/shared/types/flow";

export interface FlowEditorSidebarProps {
    activeTab: string;
    setActiveTab: ( tab: string ) => void;
    modulePath: string | null;
    zoomLevel: number;
    handleModuleClick: ( module: UIModuleFile ) => void;
    handleFlowClick: ( flowName: string ) => void;
}

export const FlowEditorSidebar: React.FC<FlowEditorSidebarProps> = ( {
    activeTab,
    setActiveTab,
    modulePath,
    zoomLevel,
    handleModuleClick,
    handleFlowClick,
} ) => {
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

                <TabsContent value="modules" className="p-4 h-full overflow-y-auto">
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
                        <Card className="p-4">
                            <p>Please select a module first</p>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Zoom level indicator */}
            <div className="p-2 border-t text-center text-xs text-muted-foreground bg-muted/30">
                Zoom: {Math.round( zoomLevel * 100 )}%
            </div>
        </>
    );
};
