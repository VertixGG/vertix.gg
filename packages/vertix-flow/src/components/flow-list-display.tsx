import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@vertix.gg/flow/src/components/ui/table";
import { Badge } from "@vertix.gg/flow/src/components/ui/badge";

interface FlowItem {
    name: string;
    FlowClass?: any; // The actual flow class (now optional)
}

interface FlowListDisplayProps {
    moduleName: string;
    flows: FlowItem[];
    onFlowSelect?: ( flow: FlowItem ) => void;
}

export function FlowListDisplay( { moduleName, flows, onFlowSelect }: FlowListDisplayProps ) {
    if ( !flows || flows.length === 0 ) {
        return (
            <div className="text-sm text-muted-foreground p-4">
                No flows available in this module
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-sm">
                <span className="font-medium">Selected module:</span> {moduleName}
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Flow Name</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {flows.map( ( flow ) => (
                        <TableRow
                            key={flow.name}
                            className={onFlowSelect ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                            onClick={() => onFlowSelect?.( flow )}
                        >
                            <TableCell>
                                <Badge variant="secondary" className="font-medium">
                                    {flow.name}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ) )}
                </TableBody>
            </Table>
        </div>
    );
}
