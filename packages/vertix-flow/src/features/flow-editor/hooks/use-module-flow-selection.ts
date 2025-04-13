import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import type { UIModuleFile, GuildResponseItem } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

interface UIModulesResource {
    read: () => { data?: { uiModules?: UIModuleFile[] } };
}

export interface UseModuleFlowSelectionProps {
    modulePathParam?: string;
    flowNameParam?: string;
    selectedGuild: GuildResponseItem | null;
    uiModulesResource: UIModulesResource;
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
    modulePathParam,
    flowNameParam,
    selectedGuild,
    uiModulesResource,
}: UseModuleFlowSelectionProps ): UseModuleFlowSelectionReturn => {
    const navigate = useNavigate();

    const [ modulePath, setModulePath ] = useState<string | null>( modulePathParam || null );
    const [ flowName, setFlowName ] = useState<string | null>( flowNameParam || null );
    const [ activeTab, setActiveTab ] = useState<string>( modulePathParam ? "flows" : "modules" );
    const [ zoomLevel, setZoomLevel ] = useState<number>( 0.15 );
    const [ moduleName, setModuleName ] = useState<string | null>( null );

    useEffect( () => {
        const newModulePath = modulePathParam || null;
        const newFlowName = flowNameParam || null;

        if ( newModulePath !== modulePath ) {
            setModulePath( newModulePath );
            setModuleName( null );
            if ( newModulePath && activeTab !== "flows" ) {
                setActiveTab( "flows" );
            } else if ( !newModulePath && activeTab !== "modules" ) {
                setActiveTab( "modules" );
            }
        }
        if ( newFlowName !== flowName ) {
            setFlowName( newFlowName );
        }

        if ( newModulePath && !moduleName ) {
            try {
                const modulesData = uiModulesResource.read();
                const modules = modulesData?.data?.uiModules || [];
                const currentModule = modules.find( m => m.path === newModulePath );
                if ( currentModule ) {
                    setModuleName( currentModule.shortName );
                }
            } catch ( error ) {
                console.error( "[useModuleFlowSelection] Error reading modules resource in effect:", error );
            }
        }
    }, [ modulePathParam, flowNameParam, modulePath, flowName, activeTab, moduleName, uiModulesResource ] );

    const handleModuleClick = useCallback( ( module: UIModuleFile ) => {
        setModulePath( module.path );
        setModuleName( module.shortName );
        setActiveTab( "flows" );
        if ( selectedGuild ) {
            const newPath = `/flow/${ selectedGuild.guildId }/${ encodeURIComponent( module.path ) }`;
            navigate( newPath );
        } else {
            console.warn( "[useModuleFlowSelection] Cannot navigate on module click: No guild selected." );
        }
    }, [ navigate, selectedGuild ] );

    const handleFlowClick = useCallback( ( newFlowName: string ) => {
        setFlowName( newFlowName );
        if ( selectedGuild && modulePath ) {
            const newPath = `/flow/${ selectedGuild.guildId }/${ encodeURIComponent( modulePath ) }/${ encodeURIComponent( newFlowName ) }`;
            navigate( newPath );
        } else {
            console.warn( "[useModuleFlowSelection] Cannot navigate on flow click: No guild or modulePath selected.", { guildId: selectedGuild?.guildId, modulePath } );
        }
    }, [ navigate, selectedGuild, modulePath ] );

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
