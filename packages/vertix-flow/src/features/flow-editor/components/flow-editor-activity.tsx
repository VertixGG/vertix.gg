import React from "react";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
    BreadcrumbPage
} from "@vertix.gg/flow/src/shared/components/breadcrumb";

import { Badge } from "@vertix.gg/flow/src/shared/components/badge";

export interface FlowEditorActivityProps {
    modulePath: string | null;
    flowName: string | null;
    moduleName: string | null;
    connectedFlowsCount: number;
}

export const FlowEditorActivity: React.FC<FlowEditorActivityProps> = ( {
    modulePath,
    flowName,
    moduleName,
    connectedFlowsCount,
} ) => {
    return (
        <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
                {modulePath && flowName ? (
                    <>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    {moduleName}
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {flowName}
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                    </>
                ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                        No flow selected
                    </Badge>
                )}
            </div>
            <div>
                <Badge
                    variant={connectedFlowsCount > 0 ? "default" : "outline"}
                    className="text-xs"
                >
                    {connectedFlowsCount > 0
                        ? `${ connectedFlowsCount } connected flow${ connectedFlowsCount > 1 ? "s" : "" }`
                        : "No connected flows"}
                </Badge>
            </div>
        </div>
    );
};
