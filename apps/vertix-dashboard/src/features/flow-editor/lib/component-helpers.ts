import type {
    UIExportedComponent,
    UIExportElementDefinition,
    UIExportEmbedsGroup,
    UIExportEmbedDefinition
} from "@vertix.gg/definitions/src/ui-export-definitions";

export interface ElementData {
    name: string;
    definition?: UIExportElementDefinition;
}

export interface ComponentPreview {
    name: string;
    embed?: {
        title?: string;
        description?: string;
        color?: number;
        image?: { url: string };
        thumbnail?: { url: string };
        defaultVars?: Record<string, string>;
    };
    embedDefinition?: UIExportEmbedDefinition;
    allEmbedDefinitions?: Array<{ groupName: string; definition: UIExportEmbedDefinition }>;
    elementRows: ElementData[][];
    modals: string[];
    modalDefinitions: Array<{
        name: string;
        title?: string;
        inputs: Array<{
            name: string;
            label?: string;
            placeholder?: string;
            style?: "short" | "paragraph";
            required?: boolean;
            minLength?: number;
            maxLength?: number;
        }>;
    }>;
}

function normalizeElementsGroupName( name: string ): string {
    return name.replace( /\/ElementsGroup$/, "" );
}

function normalizeEmbedsGroupName( name: string ): string {
    return name.replace( /\/EmbedsGroup$/, "" ).replace( /\/EmbedGroup$/, "" );
}

function buildExecutionStepCandidates( executionStep: string ): string[] {
    const trimmed = executionStep.trim();
    const candidates = new Set<string>();

    const addCandidate = ( value: string ) => {
        if ( value ) {
            candidates.add( value );
        }
    };

    const addWithEmbedGroupVariants = ( value: string ) => {
        addCandidate( value );

        if ( !value.endsWith( "EmbedGroup" ) && !value.endsWith( "EmbedsGroup" ) ) {
            addCandidate( `${ value }EmbedGroup` );
            addCandidate( `${ value }EmbedsGroup` );
        }
    };

    addWithEmbedGroupVariants( trimmed );

    const parts = trimmed.split( "/" );
    const last = parts.pop() ?? "";

    if ( last.endsWith( "State" ) ) {
        addWithEmbedGroupVariants( [ ...parts, last.replace( /State$/, "" ) ].join( "/" ) );
    }

    const withoutStateSegment = last.replace( /State(?=[A-Z])/, "" );
    if ( withoutStateSegment !== last ) {
        addWithEmbedGroupVariants( [ ...parts, withoutStateSegment ].join( "/" ) );
    }

    return [ ...candidates ];
}

function findEmbedGroupByName(
    component: UIExportedComponent,
    groupName: string
): UIExportEmbedsGroup | undefined {
    const normalizedTarget = normalizeEmbedsGroupName( groupName );

    return component.embedsGroups.find( group => {
        const normalizedGroupName = normalizeEmbedsGroupName( group.name );

        if ( normalizedGroupName === normalizedTarget ) {
            return true;
        }

        const groupLastSegment = normalizedGroupName.split( "/" ).pop();
        const targetLastSegment = normalizedTarget.split( "/" ).pop();

        return Boolean( groupLastSegment && targetLastSegment && groupLastSegment === targetLastSegment );
    } );
}

function isDefaultElementsGroup( groupName: string, defaultName: string ): boolean {
    const normalizedGroupName = normalizeElementsGroupName( groupName );
    const normalizedDefaultName = normalizeElementsGroupName( defaultName );

    if ( normalizedGroupName === normalizedDefaultName ) {
        return true;
    }

    const groupLastSegment = normalizedGroupName.split( "/" ).pop();
    const defaultLastSegment = normalizedDefaultName.split( "/" ).pop();

    return Boolean( groupLastSegment && defaultLastSegment && groupLastSegment === defaultLastSegment );
}

function findEmbedGroupByExecutionStep( component: UIExportedComponent, executionStep: string | undefined ): UIExportEmbedsGroup | undefined {
    if ( !executionStep ) {
        return undefined;
    }

    const candidates = buildExecutionStepCandidates( executionStep );

    const matched = component.embedsGroups.find( group => candidates.some( candidate => {
        const groupNameWithoutSuffix = normalizeEmbedsGroupName( group.name );
        const stepNameWithoutSuffix = normalizeEmbedsGroupName( candidate );

        if ( groupNameWithoutSuffix === stepNameWithoutSuffix ) {
            return true;
        }

        const groupLastSegment = groupNameWithoutSuffix.split( "/" ).pop();
        const stepLastSegment = stepNameWithoutSuffix.split( "/" ).pop();

        return Boolean( groupLastSegment && stepLastSegment && groupLastSegment === stepLastSegment );
    } ) );

    if ( matched ) {
        return matched;
    }

    return undefined;
}

function buildElementsGroupCandidates( executionStep: string ): string[] {
    const trimmed = executionStep.trim();
    const candidates = new Set<string>();

    const addCandidate = ( value: string ) => {
        if ( value ) {
            candidates.add( value );
        }
    };

    const addWithElementsGroupVariants = ( value: string ) => {
        addCandidate( value );

        if ( !value.endsWith( "ElementsGroup" ) ) {
            addCandidate( `${ value }ElementsGroup` );
        }
    };

    addWithElementsGroupVariants( trimmed );

    // Handle short names like "manage-menu" -> "Manage", "ManageMenu"
    const parts = trimmed.split( "-" );
    if ( parts.length > 1 ) {
        const camelCase = parts.map( part => part.charAt( 0 ).toUpperCase() + part.slice( 1 ).toLowerCase() ).join( "" );
        addWithElementsGroupVariants( camelCase );
        // Also try just the first part
        addWithElementsGroupVariants( parts[ 0 ].charAt( 0 ).toUpperCase() + parts[ 0 ].slice( 1 ).toLowerCase() );
    }

    return [ ...candidates ];
}

function findElementsGroupByExecutionStep(
    component: UIExportedComponent,
    executionStep: string | undefined
): UIExportedComponent[ "elementsGroups" ][ number ] | undefined {
    if ( !executionStep || executionStep === "default" ) {
        return undefined;
    }

    const candidates = buildElementsGroupCandidates( executionStep );

    return component.elementsGroups.find( group => {
        const normalizedGroupName = normalizeElementsGroupName( group.name ).toLowerCase();
        const groupLastSegment = normalizedGroupName.split( "/" ).pop() ?? "";

        return candidates.some( candidate => {
            const normalizedCandidate = normalizeElementsGroupName( candidate ).toLowerCase();
            const candidateLastSegment = normalizedCandidate.split( "/" ).pop() ?? "";

            if ( normalizedGroupName === normalizedCandidate ) {
                return true;
            }

            if ( groupLastSegment === candidateLastSegment ) {
                return true;
            }

            if ( groupLastSegment.includes( candidateLastSegment ) ) {
                return true;
            }

            return false;
        } );
    } );
}

export function extractComponentPreview(
    component: UIExportedComponent,
    executionStep?: string,
    embedGroupName?: string
): ComponentPreview {
    const embedGroupOverride = embedGroupName ? findEmbedGroupByName( component, embedGroupName ) : undefined;
    const selectedEmbedsGroup = embedGroupOverride ??
        ( executionStep
            ? findEmbedGroupByExecutionStep( component, executionStep ) ??
              ( component.defaultEmbedsGroup
                  ? component.embedsGroups.find( group => isDefaultElementsGroup( group.name, component.defaultEmbedsGroup ?? "" ) )
                  : component.embedsGroups[ 0 ] )
            : component.defaultEmbedsGroup
                ? component.embedsGroups.find( group => isDefaultElementsGroup( group.name, component.defaultEmbedsGroup ?? "" ) )
                : component.embedsGroups[ 0 ] );

    const firstEmbed = selectedEmbedsGroup?.items[ 0 ];
    const definition = firstEmbed?.definition;

    const elementRows: ElementData[][] = [];

    // First try to find elements group by execution step, then fall back to default
    const elementsGroupByStep = findElementsGroupByExecutionStep( component, executionStep );
    const selectedElementsGroup = elementsGroupByStep
        ?? ( component.defaultElementsGroup
            ? component.elementsGroups.find( group => isDefaultElementsGroup( group.name, component.defaultElementsGroup ?? "" ) )
            : component.elementsGroups[ 0 ] );

    selectedElementsGroup?.items.forEach( row => {
        const rowElements = row.map( item => ( {
            name: item.element,
            definition: item.definition
        } ) );

        if ( rowElements.length > 0 ) {
            // Split rows with more than 5 elements into chunks of 5
            for ( let i = 0; i < rowElements.length; i += 5 ) {
                elementRows.push( rowElements.slice( i, i + 5 ) );
            }
        }
    } );

    if ( !selectedElementsGroup ) {
        component.elementsGroups.forEach( group => {
            group.items.forEach( row => {
                const rowElements = row.map( item => ( {
                    name: item.element,
                    definition: item.definition
                } ) );

                if ( rowElements.length > 0 ) {
                    // Split rows with more than 5 elements into chunks of 5
                    for ( let i = 0; i < rowElements.length; i += 5 ) {
                        elementRows.push( rowElements.slice( i, i + 5 ) );
                    }
                }
            } );
        } );
    }

    // Collect ALL embed definitions from all embed groups for the variables panel
    const allEmbedDefinitions: Array<{ groupName: string; definition: UIExportEmbedDefinition }> = [];
    component.embedsGroups.forEach( group => {
        group.items.forEach( item => {
            if ( item.definition ) {
                allEmbedDefinitions.push( {
                    groupName: group.name.split( "/" ).pop() ?? group.name,
                    definition: item.definition
                } );
            }
        } );
    } );

    return {
        name: component.name.split( "/" ).pop() ?? component.name,
        embed: definition ? {
            title: definition.title,
            description: definition.description,
            color: definition.color,
            image: definition.image ? { url: definition.image } : undefined,
            thumbnail: definition.thumbnail ? { url: definition.thumbnail } : undefined,
            defaultVars: definition.defaultVars
        } : undefined,
        embedDefinition: definition,
        allEmbedDefinitions,
        elementRows,
        modals: component.modals ?? [],
        modalDefinitions: component.modalDefinitions ?? []
    };
}

export function getButtonHandlePosition(
    buttonName: string,
    elementRows: ElementData[][],
    totalRows: number
): "left" | "right" | "bottom" | "top" {
    for ( let rowIndex = 0; rowIndex < elementRows.length; rowIndex++ ) {
        const row = elementRows[ rowIndex ];
        const buttonIndex = row.findIndex( el => el.name === buttonName );

        if ( buttonIndex === -1 ) {
            continue;
        }

        const rowLength = row.length;
        const isLastRow = rowIndex === totalRows - 1;
        const isOnlyButtonInRow = rowLength === 1;

        if ( isOnlyButtonInRow && isLastRow ) {
            return "bottom";
        }

        if ( buttonIndex === 0 ) {
            return "left";
        }

        if ( buttonIndex === rowLength - 1 ) {
            return "right";
        }

        return "bottom";
    }

    return "bottom";
}

export function getButtonOrder( buttonName: string, elementRows: ElementData[][] ): number {
    let order = 0;

    for ( const row of elementRows ) {
        for ( const el of row ) {
            if ( el.name === buttonName ) {
                return order;
            }
            order++;
        }
    }

    return 999;
}

export function sortModalsByButtonOrder(
    modals: string[],
    buttonModalConnections: Array<{ buttonName: string; modalName: string }>,
    elementRows: ElementData[][]
): string[] {
    return [ ...modals ].sort( ( a, b ) => {
        const connectionA = buttonModalConnections.find( c => c.modalName === a );
        const connectionB = buttonModalConnections.find( c => c.modalName === b );

        const orderA = connectionA ? getButtonOrder( connectionA.buttonName, elementRows ) : 999;
        const orderB = connectionB ? getButtonOrder( connectionB.buttonName, elementRows ) : 999;

        return orderA - orderB;
    } );
}
