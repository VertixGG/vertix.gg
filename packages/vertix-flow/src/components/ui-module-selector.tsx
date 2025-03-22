import React, { Suspense, useState } from "react";

import { useUIModules } from "@vertix.gg/flow/src/hooks/use-ui-modules";

import { Button } from "@vertix.gg/flow/src/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@vertix.gg/flow/src/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@vertix.gg/flow/src/components/ui/table";
import { Badge } from "@vertix.gg/flow/src/components/ui/badge";
import { cn } from "@vertix.gg/flow/src/lib/utils";

import type { UIModuleFile } from "@vertix.gg/flow/src/hooks/use-ui-modules";

interface UIModuleSelectorProps {
    onModuleSelected: ( module: UIModuleFile ) => void;
    className?: string;
}

function ModuleList( { onSelect }: { onSelect: ( module: UIModuleFile ) => void } ) {
    const resource = useUIModules();
    const { files } = resource.read();

    if ( !files || files.length === 0 ) {
        return <div className="p-4 text-center">No UI modules found</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[200px]">Module Name</TableHead>
                    <TableHead className="w-full">Flows</TableHead>
                    <TableHead className="w-[200px]">Path</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {files.map( ( file ) => (
                    <TableRow
                        key={file.path}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onSelect( file )}
                    >
                        <TableCell className="font-medium truncate max-w-[200px]">
                            {file.moduleInfo?.name || file.name}
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto">
                                {file.moduleInfo?.flows?.map( ( flow, index ) => (
                                    <Badge key={index} variant="secondary" className="whitespace-nowrap text-xs">
                                        {flow.split( "/" ).pop()}
                                    </Badge>
                                ) )}
                            </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {file.path}
                        </TableCell>
                    </TableRow>
                ) )}
            </TableBody>
        </Table>
    );
}

export function UIModuleSelector( { onModuleSelected, className }: UIModuleSelectorProps ) {
    const [ open, setOpen ] = useState( false );

    const handleModuleSelect = ( module: UIModuleFile ) => {
        onModuleSelected( module );
        setOpen( false );
    };

    return (
        <div className={cn( "space-y-4", className )}>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="default">Select UI Module</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Select UI Module</DialogTitle>
                        <DialogDescription>Choose a UI module from the list below.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="max-h-[500px] overflow-y-auto">
                            <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
                                <ModuleList onSelect={handleModuleSelect} />
                            </Suspense>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setOpen( false )}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
