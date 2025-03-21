import React, { useState } from "react";

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

interface FileSelectorProps {
    onFileSelected: ( filePath: string, content: string ) => void;
    className?: string;
}

// Mock file data structure - this would be replaced with your actual data source
interface FileItem {
    name: string;
    content: string;
    path: string;
}

export const FileSelector: React.FC<FileSelectorProps> = ( { onFileSelected, className } ) => {
    const [ selectedFile, setSelectedFile ] = useState<string | null>( null );
    const [ isLoading, setIsLoading ] = useState( false );
    const [ error, setError ] = useState<string | null>( null );
    const [ open, setOpen ] = useState( false );

    // Example mock data - replace with your actual file list
    const mockFiles: FileItem[] = [
        { name: "button.ui-module.ts", content: "// Button module content", path: "/ui/button.ui-module.ts" },
        { name: "input.ui-module.ts", content: "// Input module content", path: "/ui/input.ui-module.ts" },
        { name: "card.ui-module.ts", content: "// Card module content", path: "/ui/card.ui-module.ts" },
        { name: "dialog.ui-module.ts", content: "// Dialog module content", path: "/ui/dialog.ui-module.ts" },
        { name: "dropdown.ui-module.ts", content: "// Dropdown module content", path: "/ui/dropdown.ui-module.ts" },
        { name: "form.ui-module.ts", content: "// Form module content", path: "/ui/form.ui-module.ts" },
    ];

    const handleFileSelect = async( file: FileItem ) => {
        setSelectedFile( file.name );
        setOpen( false );
        setIsLoading( true );

        try {
            // In a real implementation, you might fetch the content here if not already available
            onFileSelected( file.path, file.content );
        } catch ( err ) {
            setError( "Error selecting file: " + ( err instanceof Error ? err.message : String( err ) ) );
        } finally {
            setIsLoading( false );
        }
    };

    return (
        <div className={cn( "space-y-4", className )}>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button disabled={isLoading} variant="default">
                        {isLoading ? "Loading..." : "Select UI Modules File"}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Select UI Module</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Choose a UI module file from the list below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="h-72 overflow-y-auto rounded-md border border-zinc-800 p-4 bg-zinc-900">
                            <ul className="space-y-2">
                                {mockFiles.map( ( file, index ) => (
                                    <li key={index}>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-left font-normal text-zinc-200 hover:bg-zinc-800 hover:text-white"
                                            onClick={() => handleFileSelect( file )}
                                        >
                                            {file.name}
                                        </Button>
                                    </li>
                                ) )}
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOpen( false )}
                            className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {selectedFile && (
                <div className="text-sm">
                    <span className="font-medium">Selected file:</span> {selectedFile}
                </div>
            )}

            {error && <div className="text-sm text-red-500">{error}</div>}
        </div>
    );
};
