import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { UIPortableBase } from "@vertix.gg/gui/src/bases/ui-portable-base";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { UIMarkdownsGroupBase } from "@vertix.gg/gui/src/bases/ui-markdowns-group-base";

import {
    UI_ELEMENTS_DEPTH
} from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import type { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";
import type { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import type { UIGroupBase } from "@vertix.gg/gui/src/bases/ui-group-base";

import type {
    UICreateComponentArgs,
    UIElementsConstructor,
    UIElementsTypes,
    UIEmbedTypes,
    UIEntityTypes,
    UIEntityTypesConstructor,
    UIGroupsType,
    UIMarkdownTypes,
    UIType
} from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIMarkdownBase } from "@vertix.gg/gui/src/bases/ui-markdown-base";

// TODO: Test
export abstract class UIComponentInfraBase extends UIPortableBase {
    private static groupTypesMap: {
        [ key in UIGroupsType ]: {
            getGroups: ( self: typeof UIComponentInfraBase ) => typeof UIGroupBase[],
            getInitialGroup: ( self: typeof UIComponentInfraBase ) => string | null,
            getItems: ( groups: typeof UIGroupBase[] ) => UIEntityTypesConstructor;
        }
    } = {
        element: {
            getGroups: ( self: typeof UIComponentInfraBase ) => self.getElementsGroups(),
            getInitialGroup: ( self: typeof UIComponentInfraBase ) => self.getDefaultElementsGroup(),
            getItems: ( elementsGroups: typeof UIElementsGroupBase[] ) =>
                elementsGroups.map( elementsGroup => elementsGroup.getItems() ) as UIElementsTypes
        },
        embed: {
            getGroups: ( self: typeof UIComponentInfraBase ) => self.getEmbedsGroups(),
            getInitialGroup: ( self: typeof UIComponentInfraBase ) => self.getDefaultEmbedsGroup(),
            getItems: ( embedsGroups: typeof UIEmbedsGroupBase[] ) =>
                embedsGroups.map( embedsGroup => embedsGroup.getItems() ).flat() as UIEmbedTypes
        },
        markdown: {
            getGroups: ( self: typeof UIComponentInfraBase ) => self.getMarkdownsGroups(),
            getInitialGroup: ( self: typeof UIComponentInfraBase ) => self.getDefaultMarkdownsGroup(),
            getItems: ( markdownsGroups: typeof UIMarkdownsGroupBase[] ) =>
                markdownsGroups.map( markdownsGroup => markdownsGroup.getItems() ).flat() as UIMarkdownTypes
        }
    };

    // TODO: Those are currentGroup...
    private currentElementsType: typeof UIElementsGroupBase;
    private currentEmbedsType: typeof UIEmbedsGroupBase;
    private currentModalsType: typeof UIModalBase[] | { new(): UIModalBase }[];

    // Custom types.
    private currentMarkdownsType: typeof UIMarkdownsGroupBase;

    public static getName() {
        return "VertixGUI/UIComponentBaseInfra";
    }

    public static getType(): UIType {
        return "component";
    }

    public static getElementsGroups(): typeof UIElementsGroupBase[] {
        return [];
    }

    public static getEmbedsGroups(): typeof UIEmbedsGroupBase[] {
        return [];
    }

    public static getMarkdownsGroups(): typeof UIMarkdownsGroupBase[] {
        return [];
    }

    /**
     *
     * @see {UIAdapterExecutionStepsBase}
     *
     * @note The `get-default-groups` methods working only in case the adapter is not execution steps type adapter,
     * Normal adapters are blindly returning the current component with its entities.
     *
     * In order it to work in case of execution steps type adapters, it has to send execution
     * without a step ( eg `this.ephemeral` vs `this.ephemeralWithStep` )  and the default( first in the list of steps )
     * step should be without groups.
     */
    public static getDefaultElementsGroup(): string | null {
        throw new ForceMethodImplementation( this, this.getDefaultElementsGroup.name );
    }

    public static getDefaultEmbedsGroup(): string | null {
        throw new ForceMethodImplementation( this, this.getDefaultEmbedsGroup.name );
    }

    public static getDefaultMarkdownsGroup(): string | null {
        throw new ForceMethodImplementation( this, this.getDefaultMarkdownsGroup.name );
    }

    protected static getElements(): UIElementsTypes | UIElementsConstructor {
        return [];
    }

    protected static getEmbeds(): UIEmbedTypes {
        return [];
    }

    protected static getModals(): typeof UIModalBase[] | { new(): UIModalBase }[] {
        return [];
    }

    protected static getMarkdowns(): UIMarkdownTypes {
        return [];
    }

    protected static getFlatElements( elements = this.getElements() ): typeof UIElementBase[] {
        return (
            ( this.getTypesInternal( "element", elements, true ) as UIElementsTypes ).flat( UI_ELEMENTS_DEPTH )
        );
    }

    protected static getFlatEmbeds(): typeof UIEmbedBase[] {
        return (
            this.getTypesInternal( "embed", this.getEmbeds(), true ) as typeof UIEmbedBase[]
        );
    }

    protected static getFlatMarkdowns(): typeof UIMarkdownBase[] {
        return (
            this.getTypesInternal( "markdown", this.getMarkdowns(), true ) as typeof UIMarkdownBase[]
        );
    }

    /**
     * Function getTypesInternal() :: Return the default types if they are defined, otherwise return the types from the groups.
     */
    protected static getTypesInternal( type: UIGroupsType, defaultEntitleTypes: UIEntityTypesConstructor, getAll?: boolean ) {
        if ( defaultEntitleTypes.length ) {
            return defaultEntitleTypes;
        }

        // If not default, then we need to get the entities from the groups.
        const groupType = this.groupTypesMap[ type ],
            groups = groupType.getGroups( this );

        if ( ! groups.length ) {
            return [];
        }

        if ( getAll ) {
            return groupType.getItems( groups ) as UIEntityTypes;
        }

        const group = this.getInitialGroup( type, groups );

        if ( ! group ) {
            return [];
        }

        return group.getItems() as UIEntityTypes;
    }

    protected static getInitialGroup( groupType: UIGroupsType, groups: typeof UIGroupBase[] ) {
        const initialGroup = this.groupTypesMap[ groupType ]
            .getInitialGroup( this );

        if ( ! initialGroup ) {
            return null;
        }

        for ( const group of groups ) {
            if ( group.getName() === initialGroup ) {
                return group;
            }
        }

        // TODO This should be validated in the start of the app.
        throw new Error( `Initial group: '${ initialGroup }' not found in: '${ groupType }' groups, did you forget to add 'Group' suffix?` );
    }

    public constructor( args?: UICreateComponentArgs ) {
        super();

        this.currentElementsType = args?.elementsGroupType || this.getDefaultElementsGroup();
        this.currentEmbedsType = args?.embedsGroupType || this.getDefaultEmbedsGroup();

        this.currentModalsType = ( this.constructor as typeof UIComponentInfraBase ).getModals();

        this.currentMarkdownsType = args?.markdownsGroupType || this.getDefaultMarkdownsGroup();
    }

    // TODO: Using toggle function with strings is not a good practice, because it's not type safe, it should be used only by internal methods.
    public switchElementsGroup( group: typeof UIElementsGroupBase | string ) {
        let elementsGroup!: typeof UIElementsGroupBase;

        const staticThis = ( this.constructor as typeof UIComponentInfraBase );

        if ( "string" === typeof group ) {
            // Find elements group by name
            const groups = staticThis.getElementsGroups() as typeof UIElementsGroupBase[] || [];

            for ( const current of groups ) {
                if ( current.getName() === group ) {
                    elementsGroup = current;
                    break;
                }
            }

            if ( ! elementsGroup ) {
                throw new Error( `Elements group: '${ group }' not found` );
            }
        }

        this.currentElementsType = elementsGroup || group;

        // TODO: Check if it's needed.
        staticThis.ensureEntities( staticThis.getFlatElements( this.currentElementsType.getItems() as UIElementsConstructor ) );
    }

    // TODO: Using toggle function with strings is not a good practice, because it's not type safe, it should be used only by internal methods.
    public switchEmbedsGroup( group: typeof UIEmbedsGroupBase | string ) {
        let embedsGroup!: typeof UIEmbedsGroupBase;

        const staticThis = ( this.constructor as typeof UIComponentInfraBase );

        if ( "string" === typeof group ) {
            // Find embeds group by name
            const groups = staticThis.getEmbedsGroups() as typeof UIEmbedsGroupBase[] || [];

            for ( const current of groups ) {
                if ( current.getName() === group ) {
                    embedsGroup = current;
                    break;
                }
            }

            if ( ! embedsGroup ) {
                throw new Error( `Embeds group: '${ group }' not found` );
            }
        }

        this.currentEmbedsType = embedsGroup || group;

        // TODO: Check if it's needed.
        staticThis.ensureEntities( this.currentEmbedsType.getItems() as typeof UIEmbedBase[] );
    }

    public switchMarkdownsGroup( group: typeof UIMarkdownsGroupBase | string ) {
        let markdownsGroup!: typeof UIMarkdownsGroupBase;

        const staticThis = ( this.constructor as typeof UIComponentInfraBase );

        if ( "string" === typeof group ) {
            // Find markdowns group by name
            const groups = staticThis.getMarkdownsGroups() as typeof UIMarkdownsGroupBase[] || [];

            for ( const current of groups ) {
                if ( current.getName() === group ) {
                    markdownsGroup = current;
                    break;
                }
            }

            if ( ! markdownsGroup ) {
                throw new Error( `Markdowns group: '${ group }' not found` );
            }
        }

        this.currentMarkdownsType = markdownsGroup || group;

        // TODO: Check if it's needed.
        staticThis.ensureEntities( this.currentMarkdownsType.getItems() as typeof UIMarkdownBase[] );
    }

    public clearElements() {
        this.currentElementsType = UIElementsGroupBase.createEmptyGroup( this.getName() );
    }

    public clearEmbeds() {
        this.currentEmbedsType = UIEmbedsGroupBase.createEmptyGroup( this.getName() );
    }

    public clearMarkdowns() {
        this.currentMarkdownsType = UIMarkdownsGroupBase.createEmptyGroup( this.getName() );
    }

    public getCurrentElements() {
        return Object.freeze( this.currentElementsType );
    }

    public getCurrentEmbeds() {
        return Object.freeze( this.currentEmbedsType );
    }

    public getCurrentModals() {
        return Object.freeze( this.currentModalsType );
    }

    public getCurrentMarkdowns() {
        return Object.freeze( this.currentMarkdownsType );
    }

    private getDefaultElementsGroup() {
        let result;

        const staticThis = ( this.constructor as typeof UIComponentInfraBase ),
            elementsGroups = staticThis.getElementsGroups();

        function createInternalElementsGroup( staticThis: typeof UIComponentInfraBase ) {
            return class extends UIElementsGroupBase {
                public static getName() {
                    return staticThis.getName() + "/ElementsGroup";
                }

                public static getItems() {
                    return staticThis.getTypesInternal( "element", staticThis.getElements() );
                }
            };
        }

        if ( elementsGroups.length ) {
            result = staticThis.getInitialGroup( "element", elementsGroups );
        } else {
            result = createInternalElementsGroup( staticThis );
        }

        if ( null === result ) {
            result = UIElementsGroupBase.createEmptyGroup( staticThis.getName() );
        }

        return result;
    }

    private getDefaultEmbedsGroup() {
        let result;

        const staticThis = ( this.constructor as typeof UIComponentInfraBase ),
            embedsGroups = staticThis.getEmbedsGroups();

        function createInternalEmbedsGroup( staticThis: typeof UIComponentInfraBase ) {
            return class extends UIEmbedsGroupBase {
                public static getName() {
                    return staticThis.getName() + "/EmbedsGroup";
                }

                public static getItems() {
                    return staticThis.getTypesInternal( "embed", staticThis.getEmbeds() );
                }
            };
        }

        if ( embedsGroups.length ) {
            result = staticThis.getInitialGroup( "embed", embedsGroups );
        } else {
            result = createInternalEmbedsGroup( staticThis );
        }

        if ( null === result ) {
            result = UIEmbedsGroupBase.createEmptyGroup( staticThis.getName() );
        }

        return result;
    }

    private getDefaultMarkdownsGroup() {
        let result;

        const staticThis = ( this.constructor as typeof UIComponentInfraBase ),
            markdownsGroups = staticThis.getMarkdownsGroups();

        function createInternalMarkdownsGroup( staticThis: typeof UIComponentInfraBase ) {
            return class extends UIMarkdownsGroupBase {
                public static getName() {
                    return staticThis.getName() + "/MarkdownsGroup";
                }

                public static getItems() {
                    return staticThis.getTypesInternal( "markdown", staticThis.getMarkdowns() );
                }
            };
        }

        if ( markdownsGroups.length ) {
            result = staticThis.getInitialGroup( "markdown", markdownsGroups );
        } else {
            result = createInternalMarkdownsGroup( staticThis );
        }

        if ( null === result ) {
            result = UIMarkdownsGroupBase.createEmptyGroup( staticThis.getName() );
        }

        return result;
    }
}
