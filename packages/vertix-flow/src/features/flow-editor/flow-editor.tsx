import React from "react";

import { ResizableHandle } from "@vertix.gg/flow/src/shared/components/resizable";
import {
    FlowLayout,
    FlowLayoutContent,
    FlowLayoutLeftSidebar,
    FlowLayoutRightSidebar,
    FlowLayoutMainContent,
    FlowLayoutActivityBar
} from "@vertix.gg/flow/src/shared/components/flow-layout";

import { LoadingIndicator } from "@vertix.gg/flow/src/features/flow-editor/components/ui/loading-indicator";
import { FlowEditorSidebar } from "@vertix.gg/flow/src/features/flow-editor/components/flow-editor-sidebar";
import { FlowEditorMain } from "@vertix.gg/flow/src/features/flow-editor/components/flow-editor-main";
import { FlowEditorDetails } from "@vertix.gg/flow/src/features/flow-editor/components/flow-editor-details";
import { FlowEditorActivity } from "@vertix.gg/flow/src/features/flow-editor/components/flow-editor-activity";

import { useModuleFlowSelection } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-module-flow-selection";
import { useConnectedFlows } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-connected-flows";
import { useFlowDiagram } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-flow-diagram";

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
    // Module and flow selection state
    const {
        modulePath,
        flowName,
        moduleName,
        activeTab,
        zoomLevel,
        handleModuleClick,
        handleFlowClick,
        handleZoomChange,
        setActiveTab,
    } = useModuleFlowSelection( {
        initialModulePath,
        initialFlowName,
    } );

    // Connected flows state and handlers
    const {
        connectedFlowsData,
        combinedNodes,
        combinedEdges,
        isLoadingConnectedFlows,
        handleMainFlowDataLoaded,
        setCombinedNodes,
    } = useConnectedFlows();

    // Flow diagram handlers
    const {
        onNodesChange,
    } = useFlowDiagram( { setCombinedNodes } );

    return (
            <FlowLayout>
                <LoadingIndicator/>

                <FlowLayoutContent>
                    {/* Left Sidebar */ }
                    <FlowLayoutLeftSidebar defaultSize={ 20 } minSize={ 15 } maxSize={ 25 }>
                        <FlowEditorSidebar
                                activeTab={ activeTab }
                                setActiveTab={ setActiveTab }
                                modulePath={ modulePath }
                                zoomLevel={ zoomLevel }
                                handleModuleClick={ handleModuleClick }
                                handleFlowClick={ handleFlowClick }
                        />
                    </FlowLayoutLeftSidebar>

                    <ResizableHandle/>

                    {/* Main content */ }
                    <FlowLayoutMainContent>
                        <FlowEditorMain
                                modulePath={ modulePath }
                                flowName={ flowName }
                                moduleName={ moduleName }
                                connectedFlowsData={ connectedFlowsData }
                                isLoadingConnectedFlows={ isLoadingConnectedFlows }
                                combinedNodes={ combinedNodes }
                                combinedEdges={ combinedEdges }
                                setCombinedNodes={ setCombinedNodes }
                                onNodesChange={ onNodesChange }
                                onZoomChange={ handleZoomChange }
                        />
                    </FlowLayoutMainContent>

                    <ResizableHandle/>

                    {/* Right Sidebar */ }
                    <FlowLayoutRightSidebar defaultSize={ 25 } minSize={ 15 } maxSize={ 40 }>
                        <FlowEditorDetails
                                modulePath={ modulePath }
                                flowName={ flowName }
                                moduleName={ moduleName }
                                onFlowDataLoaded={ handleMainFlowDataLoaded }
                        />
                    </FlowLayoutRightSidebar>
                </FlowLayoutContent>

                {/* Activity Bar */ }
                <FlowLayoutActivityBar>
                    <FlowEditorActivity
                            modulePath={ modulePath }
                            flowName={ flowName }
                            moduleName={ moduleName }
                            connectedFlowsCount={ connectedFlowsData.length }
                    />
                </FlowLayoutActivityBar>
            </FlowLayout>
    );
};
