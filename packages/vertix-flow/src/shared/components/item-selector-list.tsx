import React from "react";

import { cn } from "@vertix.gg/flow/src/lib/utils";
import { Button } from "@vertix.gg/flow/src/shared/components/button";
import { ScrollArea } from "@vertix.gg/flow/src/shared/components/scroll-area";

interface ItemSelectorListProps<T> {
    title: string;
    items: T[];
    selectedItemId: string | null;
    getItemId: ( item: T ) => string;
    renderItemContent: ( item: T ) => React.ReactNode;
    onSelectItem: ( item: T ) => void; // Pass the whole item back for flexibility
    emptyStateMessage?: string;
    containerClassName?: string; // Optional class for the root container
    scrollAreaClassName?: string; // Optional class for ScrollArea
    listClassName?: string; // Optional class for the div containing buttons
}

export function ItemSelectorList<T>( {
    title,
    items,
    selectedItemId,
    getItemId,
    renderItemContent,
    onSelectItem,
    emptyStateMessage = "No items found.",
    containerClassName,
    scrollAreaClassName,
    listClassName,
}: ItemSelectorListProps<T> ) {

    return (
        // Using flex layout similar to previous examples
        <div className={cn( "flex flex-col h-full", containerClassName )}>
            {/* Header */}
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-foreground p-4">
                {title}
            </h2>

            {/* Content Area */}
            {items.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-muted-foreground p-4">
                    {emptyStateMessage}
                </div>
            ) : (
                 // Calculate scroll area height based on parent minus header (approximate)
                 // This might need adjustment or a different height strategy (e.g., flex-grow)
                <ScrollArea className={cn( "h-[calc(100%-theme(space.28))]", scrollAreaClassName )}>
                    <div className={cn( "space-y-1 p-4 pt-0", listClassName )}>
                        {items.map( ( item ) => {
                             const itemId = getItemId( item );
                             const isSelected = selectedItemId === itemId;
                             return (
                                 <Button
                                     key={itemId}
                                     variant="ghost"
                                     className={cn(
                                         "w-full justify-start py-3 h-auto font-normal hover:bg-muted text-left", // Ensure text aligns left
                                         isSelected
                                             ? "bg-primary/10 border border-primary/30"
                                             : ""
                                     )}
                                     onClick={() => onSelectItem( item )}
                                 >
                                     {/* Render custom item content */}
                                     {renderItemContent( item )}
                                 </Button>
                             );
                        } )}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}
