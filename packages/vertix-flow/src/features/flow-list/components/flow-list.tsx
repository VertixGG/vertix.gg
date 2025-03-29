import React from "react";

import { ScrollArea } from "@vertix.gg/flow/src/shared/components/scroll-area";
import { Button } from "@vertix.gg/flow/src/shared/components/button";
import { Separator } from "@vertix.gg/flow/src/shared/components/separator";

import useModuleSelectorStore from "@vertix.gg/flow/src/features/module-selector/store/module-selector-store";

interface FlowListProps {
    onSelectFlow?: ( flowName: string ) => void;
}

// Helper function to render a list of flow buttons
const renderFlowButtons = (
    flows: string[],
    selectedFlow: string | null,
    handleFlowClick: ( flowName: string ) => void
) => {
    return flows.map( ( flowName ) => (
        <React.Fragment key={ flowName }> { /* Use flowName for key */ }
            <Button
                variant="ghost"
                className={ `w-full justify-start p-3 h-auto font-normal hover:bg-muted ${
                    selectedFlow === flowName
                        ? "bg-primary/10 border-primary/30"
                        : ""
                }` }
                onClick={ () => handleFlowClick( flowName ) }
            >
                <div className="font-medium">{ flowName }</div>
            </Button>
            { /* Separator logic can be adjusted if needed between sections */ }
            {/* {index < flows.length - 1 && ( <Separator className="my-1"/> )} */ }
        </React.Fragment>
    ) );
};

export const FlowList: React.FC<FlowListProps> = ( { onSelectFlow } ) => {
    const { selectedModule, selectedFlow, setSelectedFlow } = useModuleSelectorStore();

    if ( !selectedModule ) {
        return <p className="text-sm text-center text-muted-foreground p-4">Select a module to see its flows.</p>; // Provide feedback
    }

    // Extract both types of flows, provide empty arrays as default
    const { flows: uiFlows = [], systemFlows = [] } = selectedModule;

    const handleFlowClick = ( flowName: string ) => {
        setSelectedFlow( flowName );
        if ( onSelectFlow ) {
            onSelectFlow( flowName );
        }
    };

    const hasUIFlows = uiFlows.length > 0;
    const hasSystemFlows = systemFlows.length > 0;

    return (
        <div className="flex flex-col h-full">
            <h2 className="p-2 font-semibold text-center">Available Flows</h2>
            <ScrollArea className="flex-grow p-2">
                <div className="space-y-2">
                    { /* Render System Flows First */ }
                    { hasSystemFlows && (
                        <div className="mb-3">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-1">System Flows</h3>
                            { renderFlowButtons( systemFlows, selectedFlow, handleFlowClick ) }
                        </div>
                    ) }

                    { /* Separator if both types exist */ }
                    { hasSystemFlows && hasUIFlows && <Separator className="my-2"/> }

                    { /* Render UI Flows Second */ }
                    { hasUIFlows && (
                        <div className="mb-3">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-1">UI Flows</h3>
                            { renderFlowButtons( uiFlows, selectedFlow, handleFlowClick ) }
                        </div>
                    ) }

                    { /* Message if no flows found */ }
                    { !hasSystemFlows && !hasUIFlows && (
                        <p className="text-sm text-muted-foreground text-center p-4">No flows available in this module</p>
                    ) }
                </div>
            </ScrollArea>
        </div>
    );
};
