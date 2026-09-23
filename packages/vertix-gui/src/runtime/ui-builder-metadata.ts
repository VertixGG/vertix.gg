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
import type { TransactionBuilder } from "@vertix.gg/gui/src/builders/transaction-builder";

import type {
    StringHandler,
    NumberHandler,
    OptionsHandler,
    LogicHandler
} from "@vertix.gg/gui/src/builders/embed-builder";

export const BUILDER_METADATA_SYMBOL = Symbol.for( "VertixGUI/BuilderMetadata" );

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

/**
 * What a member was doing when a screen was put in front of them, declared by the screen itself.
 *
 * A notice - "that channel is not yours", "run this in a server" - is sent by a gate calling the
 * adapter directly, and nothing in that call reaches the export: no binding, no transition, no
 * flow. The screens ship, they carry real embeds, and everything reading the export sees them as
 * belonging to nothing, which is why a third of the components are drawn unattached.
 *
 * The gate is the wrong place to say this, because there is one gate for many commands and it
 * would have to be said once per command. The screen is the thing that knows why it exists.
 */
export interface UINoticeSource {
    /** The flow whose use can end here, spelled in full. */
    source: string;
    /** What went wrong, in one sentence a member would recognise. */
    description: string;
}

export interface AdapterBuilderMetadata {
    name: string;
    component?: UIComponentTypeConstructor;
    excludedElements?: UIEntityTypes;
    permissions?: PermissionsBitField;
    channelTypes?: ChannelType[];
    shouldDisableMiddleware?: boolean;
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
    shownWhen?: UINoticeSource[];
    transactions?: TransactionBuilder;
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
    thumbnail?: StringHandler<TVars>;
    footer?: StringHandler<TVars>;
    options?: OptionsHandler<TVars>;
    arrayOptions?: OptionsHandler<TVars>;
    logic?: LogicHandler<TArgs, TVars>;
    vars?: TVars;
    defaultVars?: ( vars: TVars ) => Partial<Record<keyof TVars, JsonValue>>;
}

export type EndTimeHandler<TArgs extends UIArgs> = ( args: TArgs ) => Date;

export interface ElapsedEmbedBuilderMetadata<
    TArgs extends UIArgs = UIArgs,
    TVars extends Record<string, JsonValue> = Record<string, JsonValue>
> extends EmbedBuilderMetadata<TArgs, TVars> {
    endTime: EndTimeHandler<TArgs>;
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
    | ElapsedEmbedBuilderMetadata
    | FlowBuilderMetadata;

export type BuilderMetadataCarrier = {
    [ BUILDER_METADATA_SYMBOL ]?: BuilderMetadata;
};
