import React, { Suspense, useState, useMemo } from "react";

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
import { cn } from "@vertix.gg/flow/src/lib/utils";
import { useUIModules, useUIModuleContent, type UIModuleFile } from "../hooks/use-ui-modules";

interface UIModuleSelectorProps {
    onModuleSelected: (filePath: string, content: string) => void;
    className?: string;
}

function ModuleList({ onSelect }: { onSelect: (module: UIModuleFile) => void }) {
    const resource = useUIModules();
    const { files } = resource.read();

    if (!files || files.length === 0) {
        return <div className="p-4 text-center">No UI modules found</div>;
    }

    return (
        <ul className="divide-y">
            {files.map((file) => (
                <li key={file.path} className="p-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-left space-y-2"
                        onClick={() => onSelect(file)}
                    >
                        <div className="font-medium">{file.moduleInfo?.name || file.name}</div>
                        {file.moduleInfo?.adapters && file.moduleInfo.adapters.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Adapters:</span> {file.moduleInfo.adapters.join(", ")}
                            </div>
                        )}
                        <div className="text-xs text-muted-foreground">Path: {file.path}</div>
                    </Button>
                </li>
            ))}
        </ul>
    );
}

function ModuleContent({ module, onModuleLoaded }: { module: UIModuleFile; onModuleLoaded: (content: UIModuleFile) => void }) {
    const resource = useUIModuleContent(module.path);
    const content = resource.read();

    React.useEffect(() => {
        if (content) {
            onModuleLoaded(content);
        }
    }, [content, onModuleLoaded]);

    return null;
}

export function UIModuleSelector({ onModuleSelected, className }: UIModuleSelectorProps) {
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [currentModule, setCurrentModule] = useState<UIModuleFile | null>(null);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const handleModuleSelect = (module: UIModuleFile) => {
        setSelectedModule(module.name);
        setCurrentModule(module);
        setOpen(false);
        setError(null);
    };

    const handleModuleLoaded = (moduleData: UIModuleFile) => {
        onModuleSelected(moduleData.path, moduleData.content);
    };

    return (
        <div className={cn("space-y-4", className)}>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="default">Select UI Module</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select UI Module</DialogTitle>
                        <DialogDescription>Choose a UI module from the list below.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="h-72 overflow-y-auto border">
                            <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
                                <ModuleList onSelect={handleModuleSelect} />
                            </Suspense>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {currentModule && (
                <Suspense fallback={null}>
                    <ModuleContent module={currentModule} onModuleLoaded={handleModuleLoaded} />
                </Suspense>
            )}

            {selectedModule && (
                <div className="text-sm">
                    <span className="font-medium">Selected module:</span> {selectedModule}
                </div>
            )}

            {error && <div className="text-sm text-red-500">{error.message}</div>}
        </div>
    );
}
