import type { ChannelType, PermissionsBitField } from "discord.js";

import type {
    UIArgs,
    UIComponentTypeConstructor,
    UIExecutionSteps,
    UIInstancesTypes,
    UIEntityTypes
} from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import type { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";
import type { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import type { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

import type {
    StringHandler,
    NumberHandler,
    OptionsHandler,
    LogicHandler
} from "@vertix.gg/gui/src/builders/embed-builder";

export const BUILDER_METADATA_SYMBOL = Symbol( "VertixGUI/BuilderMetadata" );

export interface ComponentBuilderMetadata {
    name: string;
    instanceType: UIInstancesTypes | null;
    elementsGroups: ( typeof UIElementsGroupBase )[];
    embedsGroups: ( typeof UIEmbedsGroupBase )[];
    modals: ( typeof UIModalBase )[];
    elements: unknown;
    embeds: ( typeof UIEmbedBase )[];
    defaultElementsGroup: string | null;
    defaultEmbedsGroup: string | null;
    defaultMarkdownsGroup: string | null;
}

export interface AdapterBuilderMetadata {
    name: string;
    component?: UIComponentTypeConstructor;
    excludedElements?: UIEntityTypes;
    permissions?: PermissionsBitField;
    channelTypes?: ChannelType[];
    generateCustomIdForEntityHandler?: unknown;
    getCustomIdForEntityHandler?: unknown;
    shouldDeletePreviousReplyHandler?: unknown;
    startArgsHandler?: unknown;
    replyArgsHandler?: unknown;
    beforeBuildHandler?: unknown;
    beforeBuildRunHandler?: unknown;
    beforeFinishHandler?: unknown;
    onStepHandler?: unknown;
    entityMapHandler?: unknown;
    executionSteps?: UIExecutionSteps;
    initiatorElement?: typeof UIElementBase;
    contextFactory?: unknown;
    rawBuilder?: unknown;
    wizard?: WizardAdapterMetadata;
}

export interface EmbedBuilderMetadata<
    TArgs extends UIArgs = UIArgs,
    TVars extends Record<string, JsonValue> = Record<string, JsonValue>
> {
    name: string;
    instanceType: UIInstancesTypes | null;
    title?: StringHandler<TVars>;
    description?: StringHandler<TVars>;
    color?: NumberHandler<TVars>;
    image?: StringHandler<TVars>;
    footer?: StringHandler<TVars>;
    options?: OptionsHandler<TVars>;
    arrayOptions?: OptionsHandler<TVars>;
    logic?: LogicHandler<TArgs, TVars>;
    vars?: TVars;
}

export interface WizardAdapterMetadata {
    componentConfig?: {
        name: string;
        components: UIComponentTypeConstructor[];
        baseComponent?: unknown;
    };
    componentEmbedsGroups?: ( typeof UIEmbedsGroupBase )[];
}

export interface FlowBuilderMetadata {
    name: string;
}

export type BuilderMetadata =
    | ComponentBuilderMetadata
    | AdapterBuilderMetadata
    | EmbedBuilderMetadata
    | FlowBuilderMetadata;

export type BuilderMetadataCarrier = {
    [ BUILDER_METADATA_SYMBOL ]?: BuilderMetadata;
};

