import React, { useState, useEffect, useCallback } from "react";

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
        } else {
            setLayoutKey( "loaded" );
            setHasLoadedLayoutApplied( false );
        }
    }, [] );

    // Callback for layout changes
    const handleLayout = useCallback( ( sizes: number[] ) => {
        if ( layoutKey === "loaded" ) {
            if ( !hasLoadedLayoutApplied ) {
                setHasLoadedLayoutApplied( true );
            } else {
                saveLayoutToLocalStorage( sizes );
            }
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
