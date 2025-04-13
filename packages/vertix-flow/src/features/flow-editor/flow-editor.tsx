import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams } from "react-router-dom";

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

/**
 * FlowEditor is the main component for the flow editor
 * It fetches params from the URL and initializes the provider
 */
export const FlowEditor: React.FC = () => {
    // Extract parameters from the URL
    // Make sure the route parameter names match what you define in your routing setup
    // We'll assume 'guildId', 'modulePath', 'flowName' for now
    const params = useParams(); // Let useParams infer types
    const guildIdParam = params.guildId; // Type will be string | undefined
    // Decode potentially encoded path/name parameters
    const modulePathParam = params.modulePath ? decodeURIComponent( params.modulePath ) : undefined;
    const flowNameParam = params.flowName ? decodeURIComponent( params.flowName ) : undefined;

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
        // Pass the extracted URL parameters to the provider
        <FlowEditorProvider
            guildIdParam={guildIdParam}
            modulePathParam={modulePathParam}
            flowNameParam={flowNameParam}
        >
            <FlowLayout>
                {/* Suspense wraps content that depends on potentially suspended data */}
                <Suspense fallback={
                    // Render a layout structure within the fallback
                    <>
                        <FlowLayoutContent key="loading-layout" onLayout={() => {}}> {/* Dummy key/handler */}
                            {/* Render sidebar panel structure */}
                            <FlowLayoutLeftSidebar defaultSize={ layoutSizes ? layoutSizes[ 0 ] : 20 } minSize={ 15 } maxSize={ 25 }>
                                {/* You could put a minimal sidebar placeholder here if desired */}
                                <div className="h-full w-full p-4 opacity-50 flex items-center justify-center text-sm">Loading Nav...</div>
                            </FlowLayoutLeftSidebar>
                            <ResizableHandle />
                            {/* Render main panel structure with loader inside */}
                            <FlowLayoutMainContent defaultSize={ layoutSizes ? layoutSizes[ 1 ] : 60 }>
                                <div className="h-full w-full flex items-center justify-center">
                                    <LoadingIndicator />
                                    <span className="ml-2">Loading Flow...</span>
                                </div>
                            </FlowLayoutMainContent>
                            <ResizableHandle />
                            {/* Render sidebar panel structure */}
                            <FlowLayoutRightSidebar defaultSize={ layoutSizes ? layoutSizes[ 2 ] : 20 } minSize={ 15 } maxSize={ 40 }>
                                {/* You could put a minimal details placeholder here if desired */}
                                <div className="h-full w-full p-4 opacity-50 flex items-center justify-center text-sm">Loading Details...</div>
                            </FlowLayoutRightSidebar>
                        </FlowLayoutContent>
                        {/* Render activity bar structure */}
                        <FlowLayoutActivityBar>
                            {/* You could put a minimal activity placeholder here if desired */}
                             <div className="h-full w-full p-2 opacity-50 flex items-center justify-center text-sm">Loading Activity...</div>
                        </FlowLayoutActivityBar>
                    </>
                }>
                    {/* Actual Content (Renders when data is ready) */}
                    <FlowLayoutContent key={layoutKey} onLayout={handleLayout}>
                        <FlowLayoutLeftSidebar defaultSize={ layoutSizes ? layoutSizes[ 0 ] : 20 } minSize={ 15 } maxSize={ 25 }>
                            <FlowEditorSidebar />
                        </FlowLayoutLeftSidebar>
                        <ResizableHandle/>
                        <FlowLayoutMainContent defaultSize={ layoutSizes ? layoutSizes[ 1 ] : 60 }>
                            <FlowEditorMain />
                        </FlowLayoutMainContent>
                        <ResizableHandle/>
                        <FlowLayoutRightSidebar defaultSize={ layoutSizes ? layoutSizes[ 2 ] : 20 } minSize={ 15 } maxSize={ 40 }>
                            <FlowEditorDetails />
                        </FlowLayoutRightSidebar>
                    </FlowLayoutContent>

                    <FlowLayoutActivityBar>
                        <FlowEditorActivity />
                    </FlowLayoutActivityBar>
                </Suspense>

            </FlowLayout>
        </FlowEditorProvider>
    );
};
