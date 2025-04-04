import React, { useState, useEffect, useCallback } from "react";

// Corrected relative import paths

// Assuming this is a shared component, keep workspace path? Or should it be relative?
// If it's truly shared across packages, keep '@vertix.gg/flow/...' otherwise make relative.
// For now, assuming it's shared and keeping workspace path.

// Corrected relative import paths for internal components
import { LoadingIndicator } from "@vertix.gg/flow/src/features/flow-editor/components/ui/loading-indicator";
import { FlowEditorSidebar } from "@vertix.gg/flow/src/features/flow-editor/components/flow-editor-sidebar";
import { FlowEditorMain } from "@vertix.gg/flow/src/features/flow-editor/components/flow-editor-main";
import { FlowEditorDetails } from "@vertix.gg/flow/src/features/flow-editor/components/flow-editor-details";
import { FlowEditorActivity } from "@vertix.gg/flow/src/features/flow-editor/components/flow-editor-activity";

import { FlowEditorProvider } from "@vertix.gg/flow/src/features/flow-editor/context/flow-editor-provider";
import {
    FlowLayout,
    FlowLayoutContent,
    FlowLayoutLeftSidebar,
    FlowLayoutRightSidebar,
    FlowLayoutMainContent,
    FlowLayoutActivityBar
} from "@vertix.gg/flow/src/features/flow-editor/flow-layout";
import { loadLayoutFromLocalStorage, saveLayoutToLocalStorage } from "@vertix.gg/flow/src/features/flow-editor/utils/layout-storage";
import { ResizableHandle } from "@vertix.gg/flow/src/shared/components/resizable";

// Removed dead code comments
// // Import the layout storage utility functions
// // --- Local Storage Helpers (Move to utils if preferred) ---
// // const FLOW_EDITOR_LAYOUT_KEY = "vertix.gg.flowEditorLayoutSizes";
// // const saveLayoutToLocalStorage = ( sizes: number[] ): void => { ... };
// // const loadLayoutFromLocalStorage = (): number[] | null => { ... };
// // --- End Local Storage Helpers ---
// // IMPORT Provider

export interface FlowEditorProps {
    initialModulePath?: string;
    initialFlowName?: string;
}

/**
 * FlowEditor is the main component for the flow editor
 * It handles module and flow selection, and displays the selected flow
 */
export const FlowEditor: React.FC<FlowEditorProps> = ( {
    initialModulePath,
    initialFlowName,
} ) => {
    // Removed dead code comments
    // // Remove the hook call entirely from this component
    // // Child components will use the hook, finding the Provider rendered below.
    // // useFlowEditorContext();

    // State to hold layout sizes
    const [ layoutSizes, setLayoutSizes ] = useState<number[] | null>( null );
    // State to manage the key for forcing re-mount
    const [ layoutKey, setLayoutKey ] = useState<string>( "initial" );
    // State to track if the loaded layout has been applied once
    const [ hasLoadedLayoutApplied, setHasLoadedLayoutApplied ] = useState( false );

    // Load layout on mount
    useEffect( () => {
        const loadedSizes = loadLayoutFromLocalStorage();
        if ( loadedSizes ) {
            setLayoutSizes( loadedSizes );
            setLayoutKey( "loaded" );
            setHasLoadedLayoutApplied( false );
            console.log( "[Layout] Loaded saved layout sizes:", loadedSizes );
        } else {
            console.log( "[Layout] No valid saved layout found, using defaults." );
            setLayoutKey( "loaded" );
            setHasLoadedLayoutApplied( false );
        }
    }, [] );

    // Callback for layout changes
    const handleLayout = useCallback( ( sizes: number[] ) => {
        console.log( "[Layout] handleLayout triggered with sizes:", sizes );
        if ( layoutKey === "loaded" ) {
            if ( !hasLoadedLayoutApplied ) {
                setHasLoadedLayoutApplied( true );
                console.log( "[Layout] Initial layout applied, skipping save.", sizes );
            } else {
                saveLayoutToLocalStorage( sizes );
                console.log( "[Layout] Saved sizes to local storage:", sizes );
            }
        } else {
            console.log( "[Layout] Skipping save, initial load not complete." );
        }
    }, [ layoutKey, hasLoadedLayoutApplied ] );

    return (
        <FlowEditorProvider
            initialModulePath={initialModulePath}
            initialFlowName={initialFlowName}
        >
            <FlowLayout>
                <LoadingIndicator/>

                <FlowLayoutContent key={layoutKey} onLayout={handleLayout}>
                    {/* Left Sidebar - Removed commented out props */ }
                    <FlowLayoutLeftSidebar defaultSize={ layoutSizes ? layoutSizes[ 0 ] : 20 } minSize={ 15 } maxSize={ 25 }>
                        <FlowEditorSidebar />
                    </FlowLayoutLeftSidebar>

                    <ResizableHandle/>

                    {/* Main content - Removed commented out props */ }
                    <FlowLayoutMainContent defaultSize={ layoutSizes ? layoutSizes[ 1 ] : 60 }>
                        <FlowEditorMain />
                    </FlowLayoutMainContent>

                    <ResizableHandle/>

                    {/* Right Sidebar - Removed commented out props */ }
                    <FlowLayoutRightSidebar defaultSize={ layoutSizes ? layoutSizes[ 2 ] : 20 } minSize={ 15 } maxSize={ 40 }>
                        <FlowEditorDetails />
                    </FlowLayoutRightSidebar>
                </FlowLayoutContent>

                {/* Activity Bar - Removed commented out props */ }
                <FlowLayoutActivityBar>
                    <FlowEditorActivity />
                </FlowLayoutActivityBar>
            </FlowLayout>
        </FlowEditorProvider>
    );
};
