import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/shared/components/card";
import useModuleSelectorStore from "@vertix.gg/flow/src/features/module-selector/store/module-selector-store";

interface FlowListProps {
    onSelectFlow?: ( flowName: string ) => void;
}

export const FlowList: React.FC<FlowListProps> = ( { onSelectFlow } ) => {
    const { selectedModule, selectedFlow, setSelectedFlow } = useModuleSelectorStore();

    if ( !selectedModule || !selectedModule.moduleInfo ) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Available Flows</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-neutral-500">No module selected</p>
                </CardContent>
            </Card>
        );
    }

    const { flows } = selectedModule.moduleInfo;

    const handleFlowClick = ( flowName: string ) => {
        setSelectedFlow( flowName );
        if ( onSelectFlow ) {
            onSelectFlow( flowName );
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Available Flows</CardTitle>
            </CardHeader>
            <CardContent>
                {flows && flows.length > 0 ? (
                    <div className="space-y-2">
                        {flows.map( ( flowName, index ) => (
                            <div
                                key={index}
                                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                                    selectedFlow === flowName
                                        ? "bg-blue-100 border-blue-300"
                                        : "hover:bg-neutral-100"
                                }`}
                                onClick={() => handleFlowClick( flowName )}
                            >
                                <div className="font-medium">{flowName}</div>
                            </div>
                        ) )}
                    </div>
                ) : (
                    <p className="text-sm text-neutral-500">No flows available in this module</p>
                )}
            </CardContent>
        </Card>
    );
};
