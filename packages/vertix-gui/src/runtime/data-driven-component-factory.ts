import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { uiClassRegistry } from "@vertix.gg/gui/src/runtime/ui-class-registry";

import type {
    HydratedComponent,
    RuntimeClassRef,
    RuntimeElementsGroup,
    RuntimeElement,
    RuntimeEmbedsGroup,
    RuntimeEmbed
} from "@vertix.gg/gui/src/runtime/ui-definition-runtime";
import type { RegisterableClass } from "@vertix.gg/gui/src/runtime/ui-class-registry";
import type { UIComponentTypeConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";

type ElementConstructor = RegisterableClass<object> & typeof UIElementBase;
type EmbedConstructor = RegisterableClass<object> & typeof UIEmbedBase;
type ModalConstructor = RegisterableClass<object> & typeof UIModalBase;
type ElementsGroupConstructor = RegisterableClass<object> & typeof UIElementsGroupBase;
type EmbedsGroupConstructor = RegisterableClass<object> & typeof UIEmbedsGroupBase;

function assertElementConstructor( candidate: RegisterableClass<object>, description: string ): asserts candidate is ElementConstructor {
    if ( !( candidate.prototype instanceof UIElementBase ) ) {
        const candidateName = typeof candidate.getName === "function" ? candidate.getName() : "unknown";
        throw new Error(
            `DataDrivenComponentFactory: ${ description } does not extend '${ UIElementBase.getName() }' (received '${ candidateName }')`
        );
    }
}

function assertEmbedConstructor( candidate: RegisterableClass<object>, description: string ): asserts candidate is EmbedConstructor {
    if ( !( candidate.prototype instanceof UIEmbedBase ) ) {
        const candidateName = typeof candidate.getName === "function" ? candidate.getName() : "unknown";
        throw new Error(
            `DataDrivenComponentFactory: ${ description } does not extend '${ UIEmbedBase.getName() }' (received '${ candidateName }')`
        );
    }
}

function assertModalConstructor( candidate: RegisterableClass<object>, description: string ): asserts candidate is ModalConstructor {
    if ( !( candidate.prototype instanceof UIModalBase ) ) {
        const candidateName = typeof candidate.getName === "function" ? candidate.getName() : "unknown";
        throw new Error(
            `DataDrivenComponentFactory: ${ description } does not extend '${ UIModalBase.getName() }' (received '${ candidateName }')`
        );
    }
}

function assertElementsGroupConstructor(
    candidate: RegisterableClass<object>,
    description: string
): asserts candidate is ElementsGroupConstructor {
    if ( !( candidate.prototype instanceof UIElementsGroupBase ) ) {
        const candidateName = typeof candidate.getName === "function" ? candidate.getName() : "unknown";
        throw new Error(
            `DataDrivenComponentFactory: ${ description } does not extend '${ UIElementsGroupBase.getName() }' (received '${ candidateName }')`
        );
    }
}

function assertEmbedsGroupConstructor(
    candidate: RegisterableClass<object>,
    description: string
): asserts candidate is EmbedsGroupConstructor {
    if ( !( candidate.prototype instanceof UIEmbedsGroupBase ) ) {
        const candidateName = typeof candidate.getName === "function" ? candidate.getName() : "unknown";
        throw new Error(
            `DataDrivenComponentFactory: ${ description } does not extend '${ UIEmbedsGroupBase.getName() }' (received '${ candidateName }')`
        );
    }
}

function ensureElementConstructor(
    element: RuntimeElement,
    groupName: string,
    rowIndex: number,
    columnIndex: number
): ElementConstructor {
    const candidate = element.classRef.Class;

    assertElementConstructor(
        candidate,
        `element '${ element.definition.element }' in group '${ groupName }' at position [${ rowIndex }][${ columnIndex }]`
    );

    return candidate;
}

function ensureEmbedConstructor( embed: RuntimeEmbed, groupName: string, index: number ): EmbedConstructor {
    const candidate = embed.classRef.Class;

    assertEmbedConstructor(
        candidate,
        `embed '${ embed.definition.embed }' in group '${ groupName }' at index ${ index }`
    );

    return candidate;
}

function ensureModalConstructor( modal: RuntimeClassRef ): ModalConstructor {
    const candidate = modal.Class;

    assertModalConstructor(
        candidate,
        `modal '${ modal.name }'`
    );

    return candidate;
}

function resolveElementsGroupClass(
    componentName: string,
    index: number,
    group: RuntimeElementsGroup
): ElementsGroupConstructor {
    if ( group.definition.resolver ) {
        return resolveRegisteredElementsGroup(
            group.definition.resolver,
            componentName
        );
    }

    const groupName = group.definition.name || `${ componentName }/ElementsGroup/${ index }`;
    const rows = group.rows.map<ElementConstructor[]>( ( row, rowIndex ) =>
        row.map( ( element, columnIndex ) => ensureElementConstructor( element, groupName, rowIndex, columnIndex ) )
    );

    class DynamicElementsGroup extends UIElementsGroupBase {
        public static getName() {
            return groupName;
        }

        public static getItems() {
            return rows;
        }
    }

    return DynamicElementsGroup;
}

function resolveEmbedsGroupClass(
    componentName: string,
    index: number,
    group: RuntimeEmbedsGroup
): EmbedsGroupConstructor {
    if ( group.definition.resolver ) {
        return resolveRegisteredEmbedsGroup(
            group.definition.resolver,
            componentName
        );
    }

    const groupName = group.definition.name || `${ componentName }/EmbedsGroup/${ index }`;
    const embeds = group.items.map<EmbedConstructor>( ( embed, embedIndex ) =>
        ensureEmbedConstructor( embed, groupName, embedIndex )
    );

    class DynamicEmbedsGroup extends UIEmbedsGroupBase {
        public static getName() {
            return groupName;
        }

        public static getItems() {
            return embeds;
        }
    }

    return DynamicEmbedsGroup;
}

function resolveModalConstructors( modals: RuntimeClassRef[] ): ModalConstructor[] {
    return modals.map( ensureModalConstructor );
}

function normalizeInstanceType( value: string ): UIInstancesTypes {
    if ( value === UIInstancesTypes.Dynamic ) {
        return UIInstancesTypes.Dynamic;
    }

    if ( value === UIInstancesTypes.Static ) {
        return UIInstancesTypes.Static;
    }

    throw new Error( `DataDrivenComponentFactory: unsupported instance type '${ value }'` );
}

function resolveRegisteredElementsGroup( resolverName: string, componentName: string ): ElementsGroupConstructor {
    const description = `elements group resolver '${ resolverName }' for component '${ componentName }'`;
    const candidate = uiClassRegistry.getClass( resolverName );

    assertElementsGroupConstructor( candidate, description );

    return candidate;
}

function resolveRegisteredEmbedsGroup( resolverName: string, componentName: string ): EmbedsGroupConstructor {
    const description = `embeds group resolver '${ resolverName }' for component '${ componentName }'`;
    const candidate = uiClassRegistry.getClass( resolverName );

    assertEmbedsGroupConstructor( candidate, description );

    return candidate;
}

export function createComponentClass( hydrated: HydratedComponent ): UIComponentTypeConstructor {
    const elementsGroups = hydrated.elementsGroups.map( ( group, index ) =>
        resolveElementsGroupClass( hydrated.definition.name, index, group )
    );
    const embedsGroups = hydrated.embedsGroups.map( ( group, index ) =>
        resolveEmbedsGroupClass( hydrated.definition.name, index, group )
    );
    const modalClasses = resolveModalConstructors( hydrated.modals );

    class DataDrivenComponent extends UIComponentBase {
        public static getName() {
            return hydrated.definition.name;
        }

        public static getInstanceType() {
            return normalizeInstanceType( hydrated.definition.instanceType );
        }

        public static getElementsGroups() {
            return elementsGroups;
        }

        public static getEmbedsGroups() {
            return embedsGroups;
        }

        public static getModals() {
            return modalClasses;
        }

        public static getDefaultElementsGroup() {
            return hydrated.definition.defaultElementsGroup ?? null;
        }

        public static getDefaultEmbedsGroup() {
            return hydrated.definition.defaultEmbedsGroup ?? null;
        }

        public static getDefaultMarkdownsGroup() {
            return hydrated.definition.defaultMarkdownsGroup ?? null;
        }
    }

    uiClassRegistry.register( DataDrivenComponent as RegisterableClass<object> );

    return DataDrivenComponent;
}

