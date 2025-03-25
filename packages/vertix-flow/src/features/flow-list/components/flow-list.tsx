import React from "react";

import { ScrollArea } from "@vertix.gg/flow/src/shared/components/scroll-area";
import { Button } from "@vertix.gg/flow/src/shared/components/button";
import { Separator } from "@vertix.gg/flow/src/shared/components/separator";

import useModuleSelectorStore from "@vertix.gg/flow/src/features/module-selector/store/module-selector-store";

interface FlowListProps {
    onSelectFlow?: ( flowName: string ) => void;
}

export const FlowList: React.FC<FlowListProps> = ( { onSelectFlow } ) => {
    const { selectedModule, selectedFlow, setSelectedFlow } = useModuleSelectorStore();

    if ( ! selectedModule ) {
        return null;
    }

    const { flows } = selectedModule;

    const handleFlowClick = ( flowName: string ) => {
        setSelectedFlow( flowName );
        if ( onSelectFlow ) {
            onSelectFlow( flowName );
        }
    };

    return (
            <>
                <h2>Available Flows</h2>
                { flows.length > 0 ? (
                        <ScrollArea className="h-[90%]">
                            <div className="space-y-2">
                                { flows.map( ( flowName, index ) => (
                                        <React.Fragment key={ index }>
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
                                            { index < flows.length - 1 && (
                                                    <Separator className="my-2"/>
                                            ) }
                                        </React.Fragment>
                                ) ) }
                            </div>
                        </ScrollArea>
                ) : (
                        <p className="text-sm text-muted-foreground">No flows available in this module</p>
                ) }
            </>
    );
};
