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
    fullName: string;
    embedName?: string;
    embed?: {
        title?: string;
        description?: string;
        color?: number;
        image?: { url: string };
        thumbnail?: { url: string };
        defaultVars?: Record<string, string>;
    };
    previewVars?: Record<string, string>;
    embedDefinition?: UIExportEmbedDefinition;
    allEmbedDefinitions?: Array<{ groupName: string; definition: UIExportEmbedDefinition }>;
    elementRows: ElementData[][];
    /**
     * Whether only the member who acted can see this screen.
     *
     * The state says so itself - `navigationType: "ephemeral"` on 123 of the 258 states that draw
     * one. `editReply` is not counted: it edits whatever reply came before, so whether that one is
     * private is the earlier state's answer and not this one's, and reading it as private here
     * would be guessing on 44 more.
     */
    ephemeral?: boolean;
    /** Drawn as one container, the way the bot draws this component. */
    renderAsContainer?: boolean;
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
    return name.replace( /ElementsGroup$/, "" );
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
        const groupNameWithoutSuffix = normalizeEmbedsGroupName( group.name ).toLowerCase();
        const stepNameWithoutSuffix = normalizeEmbedsGroupName( candidate ).toLowerCase();

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

    // Find the best matching group (longest prefix match)
    let bestMatch: UIExportedComponent[ "elementsGroups" ][ number ] | undefined;
    let bestMatchLength = 0;

    for ( const group of component.elementsGroups ) {
        const normalizedGroupName = normalizeElementsGroupName( group.name ).toLowerCase();
        const groupLastSegment = normalizedGroupName.split( "/" ).pop() ?? "";

        for ( const candidate of candidates ) {
            const normalizedCandidate = normalizeElementsGroupName( candidate ).toLowerCase();
            const candidateLastSegment = normalizedCandidate.split( "/" ).pop() ?? "";

            // Exact match is always best
            if ( normalizedGroupName === normalizedCandidate || groupLastSegment === candidateLastSegment ) {
                return group;
            }

            // Check if candidate starts with the group name (prefix match)
            // e.g., "setupeditmaster" starts with "setupedit"
            // Prefer longer prefix matches
            if ( candidateLastSegment.startsWith( groupLastSegment ) && groupLastSegment.length > bestMatchLength ) {
                bestMatch = group;
                bestMatchLength = groupLastSegment.length;
            }
        }
    }

    return bestMatch;
}

/**
 * Function buildElementLabelIndex() :: What each control says on it, by the control's name.
 *
 * An arrow on the canvas is read by somebody looking at the screens either side of it, and those
 * screens are drawn in the member's words - a button that says "Rename". Naming the arrow
 * `DynamicChannelRenameButton` makes the reader translate, and nothing else on the canvas asks them
 * to. The wording is already in the same payload the screens are drawn from.
 *
 * A select menu has no label, so its placeholder stands in - that is the line a member reads on it.
 */
export function buildElementLabelIndex( components: ReadonlyArray<UIExportedComponent> ): Map<string, string> {
    const index = new Map<string, string>();

    components.forEach( ( component ) => {
        component.elementsGroups.forEach( ( group ) => {
            group.items.forEach( ( row ) => {
                row.forEach( ( item ) => {
                    if ( index.has( item.element ) ) {
                        return;
                    }

                    const definition = item.definition;

                    const said = definition && "label" in definition && definition.label
                        ? definition.label
                        : definition && "placeholder" in definition ? definition.placeholder : undefined;

                    if ( said && said.trim().length ) {
                        index.set( item.element, said.trim() );
                    }
                } );
            } );
        } );
    } );

    return index;
}

export function extractComponentPreview(
    component: UIExportedComponent,
    executionStep?: string,
    embedGroupName?: string,
    elementsGroupName?: string,
    /**
     * Whether a screen naming no group of its own still draws the component's usual controls.
     *
     * True only of the screen a flow opens on. `send()` puts that one up without walking a step, so
     * whatever the component came with is what a member sees. Every screen after it is reached by
     * `setStepInternal()`, which calls `clearElements()` when the step names no group - so a state
     * that names none has no controls at all, and drawing the component's default there shows a row
     * the bot has just taken away.
     */
    drawsComponentDefaults = true
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

    /*
     * The controls this screen puts up, which are not always the component's usual ones.
     *
     * A state can name the group it draws, the same way it names its embeds, and setup does it
     * constantly: one component draws the opening screen, the server options screen, and a screen
     * for each role setting, each with its own row of controls. Only the name says which.
     *
     * Read first, before the guess from the execution step and before the component's default. Not
     * read at all, every screen of that flow drew the opening screen's controls - a server roles
     * screen offering to create a master channel - and no line leaving by a control that screen
     * genuinely has could find the control to leave from.
     */
    const elementsGroupByName = elementsGroupName
        ? component.elementsGroups.find( group => isDefaultElementsGroup( group.name, elementsGroupName ) )
        : undefined;

    // Then by execution step, then the component's default
    const elementsGroupByStep = findElementsGroupByExecutionStep( component, executionStep );

    /*
     * A screen that names no group and is not the one the flow opens on draws no controls.
     *
     * The step it is reached by cleared them. Falling through to the execution step or the
     * component's default here is what had the rename, limit, status, clear-chat, invite, knock,
     * reset and transfer outcomes - and every permissions result - drawn with a row of buttons the
     * member is not offered. The website's own simulator reads the same field the same way.
     */
    const selectedElementsGroup = elementsGroupByName
        ?? ( drawsComponentDefaults
            ? ( elementsGroupByStep
                ?? ( component.defaultElementsGroup
                    ? component.elementsGroups.find( group => isDefaultElementsGroup( group.name, component.defaultElementsGroup ?? "" ) )
                    : component.elementsGroups[ 0 ] ) )
            : undefined );

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

    /*
     * Nothing named a group and the screen is allowed its component's usual controls, so every
     * group it has is drawn - which is a guess, and a loud one: a component with a group per screen
     * puts all of them up at once. Kept only where a fallback is wanted at all. A screen reached by
     * a step that cleared its controls asks for none, and none is what it gets.
     */
    if ( ! selectedElementsGroup && drawsComponentDefaults ) {
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
        // Shortened for the label only; `fullName` is what an override is stored against, since
        // `UI-V2/DynamicChannel` and `UI-V3/DynamicChannel` share a last segment.
        name: component.name.split( "/" ).pop() ?? component.name,
        fullName: component.name,
        renderAsContainer: true === component.renderAsContainer,
        embedName: firstEmbed?.embed,
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
