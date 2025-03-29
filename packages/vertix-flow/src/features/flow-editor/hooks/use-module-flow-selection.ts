import { useState, useCallback } from "react";

import type { UIModuleFile } from "src/features/flow-editor/types/flow";

export interface UseModuleFlowSelectionProps {
    initialModulePath?: string;
    initialFlowName?: string;
}

export interface UseModuleFlowSelectionReturn {
    modulePath: string | null;
    flowName: string | null;
    moduleName: string | null;
    activeTab: string;
    zoomLevel: number;
    handleModuleClick: ( module: UIModuleFile ) => void;
    handleFlowClick: ( newFlowName: string ) => void;
    handleZoomChange: ( zoom: number ) => void;
    setActiveTab: ( tab: string ) => void;
}

export const useModuleFlowSelection = ( {
    initialModulePath,
    initialFlowName,
}: UseModuleFlowSelectionProps ): UseModuleFlowSelectionReturn => {
    const [ modulePath, setModulePath ] = useState<string | null>( initialModulePath || null );
    const [ flowName, setFlowName ] = useState<string | null>( initialFlowName || null );
    const [ activeTab, setActiveTab ] = useState<string>( "modules" );
    const [ zoomLevel, setZoomLevel ] = useState<number>( 0.15 );
    const [ moduleName, setModuleName ] = useState<string | null>( null );

    const handleModuleClick = useCallback( ( module: UIModuleFile ) => {
        setModulePath( module.path );
        setModuleName( module.shortName );
        setActiveTab( "flows" );
    }, [] );

    const handleFlowClick = useCallback( ( newFlowName: string ) => {
        setFlowName( newFlowName );
    }, [] );

    const handleZoomChange = useCallback( ( zoom: number ) => {
        setZoomLevel( Number( zoom.toFixed( 2 ) ) );
    }, [] );

    return {
        modulePath,
        flowName,
        moduleName,
        activeTab,
        zoomLevel,
        handleModuleClick,
        handleFlowClick,
        handleZoomChange,
        setActiveTab,
    };
};
