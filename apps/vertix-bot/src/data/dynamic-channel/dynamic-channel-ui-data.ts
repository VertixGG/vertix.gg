import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";
import { UserMasterChannelDataModel } from "@vertix.gg/data/src/models/data/user-master-channel-data-model";
import { MasterChannelDataModelV3 } from "@vertix.gg/data/src/models/master-channel/master-channel-data-model-v3";

import { ConfigManager } from "@vertix.gg/data/src/managers/config-manager";
import { MasterChannelDataManager } from "@vertix.gg/data/src/managers/master-channel-data-manager";

import { VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIDataBase } from "@vertix.gg/gui/src/bases/ui-data-base";

import { ChannelType } from "discord.js";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/data/src/interfaces/master-channel-config";
import type { ChannelExtended } from "@vertix.gg/data/src/models/channel/channel-client-extend";

import type { VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

export interface DynamicChannelUIDataIdentifier {
    channel?: VoiceChannel | null;
    channelId?: string;
    channelName?: string;
    userLimit?: number;
    region?: string | null;
    state?: string;
    ownerId?: string;
    masterChannelId?: string;
    guildId?: string;
    masterChannelIndex?: number;
    /**
     * Roles of the channel owner, never of whoever triggered the render.
     *
     * The primary message is one message the whole channel reads, so the button set it carries
     * has to be decided by the owner. Filling this from an interaction would hand the decision
     * to whoever pressed a button last, and everyone else would see their set.
     */
    ownerRoleIds?: string[];
}

export interface DynamicChannelUIDataResult {
    channelName: string;
    userLimit: number;
    state: string;
    channelId: string;
    region: string | null;
    dynamicChannelButtonsTemplate: string[];
    /** Where that set is divided into rows; empty means rows of five. */
    dynamicChannelButtonsRowBreaks?: number[];
    title?: string;
    description?: string;
    masterChannelId?: string;
    masterChannelIndex?: number;
    dynamicChannelNameTemplate?: string;
    dynamicChannelLogsChannelId?: string | null;
    dynamicChannelMentionable?: boolean;
    dynamicChannelAutoSave?: boolean;
    dynamicChannelVerifiedRoles?: string[];
    dynamicChannelIncludeEveryoneRole?: boolean;
}

export class DynamicChannelUIData extends UIDataBase<DynamicChannelUIDataResult> {
    private readonly logger = new Logger( DynamicChannelUIData.getName() );

    public static getName(): string {
        return "VertixBot/Data/DynamicChannelUIData";
    }

    // Not used for this read-model component.
    public async create(): Promise<DynamicChannelUIDataResult> {
        throw new Error( "DynamicChannelUIData#create is not supported" );
    }

    public async update(): Promise<DynamicChannelUIDataResult> {
        throw new Error( "DynamicChannelUIData#update is not supported" );
    }

    public async delete(): Promise<boolean> {
        throw new Error( "DynamicChannelUIData#delete is not supported" );
    }

    public async read(
        identifier: DynamicChannelUIDataIdentifier
    ): Promise<DynamicChannelUIDataResult | null> {
        const { ownerId } = identifier;

        const channel = identifier.channel?.type === ChannelType.GuildVoice ? identifier.channel : null;
        const channelId = channel?.id || identifier.channelId;
        const guildId = identifier.guildId ?? ( channel ? channel.guild.id : undefined );
        const requestedMasterChannelId = identifier.masterChannelId ?? null;

        const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
        const state = channel
            ? await dynamicChannelService.getChannelPrivacyState( channel )
            : identifier.state ?? "public";

        const args: DynamicChannelUIDataResult = {
            channelName: channel?.name ?? identifier.channelName ?? "Dynamic Channel",
            userLimit: channel?.userLimit ?? identifier.userLimit ?? 0,
            state,
            channelId: channelId ?? "unknown",
            region: channel?.rtcRegion ?? identifier.region ?? null,
            dynamicChannelButtonsTemplate: []
        };

        let masterChannelDB: ChannelExtended | null = null;

        if ( requestedMasterChannelId ) {
            masterChannelDB = await ChannelModel.$.getByChannelId( requestedMasterChannelId );
        }

        if ( !masterChannelDB && channelId ) {
            masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channelId );
        }

        if ( masterChannelDB ) {
            const configV3 = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
                "Vertix/Config/MasterChannel",
                VERSION_UI_V3
            ).data;
            const masterChannelSettings = await MasterChannelDataModelV3.$.getSettings( masterChannelDB.id );
            const templateButtons = masterChannelSettings?.dynamicChannelButtonsTemplate;
            const templateButtonsByRole = masterChannelSettings?.dynamicChannelButtonsTemplateByRole ?? {};

            // The owner's roles arrive highest first and the first one carrying a set wins, so a
            // role set replaces the default instead of adding to it. Unioning them meant an
            // override could only ever grant buttons, and an owner holding two of them got the sum
            // of both, which is not a rule an admin can predict from their role list.
            //
            // An empty entry is a removed set, not a set of no buttons, so it falls through. The
            // guild id is skipped because discord.js seeds every member's role cache with
            // @everyone under it - a set stored there would match every owner alive and make the
            // default unreachable.
            const ownerRoleIds = identifier.ownerRoleIds ?? [];

            let roleButtons: string[] | undefined;

            for ( const roleId of ownerRoleIds ) {
                if ( roleId === guildId ) {
                    continue;
                }

                const override = templateButtonsByRole[ roleId ];

                if ( Array.isArray( override ) && override.length ) {
                    roleButtons = override;
                    break;
                }
            }

            const resolvedButtons = roleButtons
                ?? ( templateButtons?.length ? templateButtons : configV3.settings.dynamicChannelButtonsTemplate );

            // Left in the order it was saved in, which is the order the channel draws its buttons
            // and its legend in. `filter()` hands back a fresh array, so the one living inside the
            // cached settings row is not the one that travels on args.
            args.dynamicChannelButtonsTemplate = resolvedButtons.filter(
                ( id ) => undefined !== DynamicChannelPrimaryMessageElementsGroup.getById( id )
            );

            // The generator's own arrangement, which the component re-fits to whatever this
            // channel draws. One arrangement serves the role sets too - they are narrower than the
            // default set rather than arranged differently.
            args.dynamicChannelButtonsRowBreaks = masterChannelSettings?.dynamicChannelButtonsRowBreaks ?? [];

            args.masterChannelId = masterChannelDB.channelId;
            args.dynamicChannelNameTemplate = masterChannelSettings?.dynamicChannelNameTemplate
                ?? configV3.settings.dynamicChannelNameTemplate;
            args.dynamicChannelLogsChannelId = masterChannelSettings?.dynamicChannelLogsChannelId ?? null;
            args.dynamicChannelMentionable = masterChannelSettings?.dynamicChannelMentionable
                ?? configV3.settings.dynamicChannelMentionable;
            args.dynamicChannelAutoSave = masterChannelSettings?.dynamicChannelAutoSave
                ?? configV3.settings.dynamicChannelAutoSave;

            if ( guildId ) {
                const verifiedRoles = await MasterChannelDataManager.$.getChannelVerifiedRoles( masterChannelDB, guildId );
                args.dynamicChannelVerifiedRoles = verifiedRoles;
                args.dynamicChannelIncludeEveryoneRole = verifiedRoles.includes( guildId );
            }

            if ( !args.dynamicChannelVerifiedRoles ) {
                args.dynamicChannelVerifiedRoles = [];
            }
            if ( args.dynamicChannelIncludeEveryoneRole === undefined ) {
                args.dynamicChannelIncludeEveryoneRole = false;
            }

            if ( !args.masterChannelIndex && guildId ) {
                const masters = await ChannelModel.$.getMasters( guildId );
                const index = masters.findIndex( master => master.channelId === masterChannelDB!.channelId );
                if ( index >= 0 ) {
                    args.masterChannelIndex = index;
                }
            }

            if ( ownerId ) {
                const primaryMessage = await UserMasterChannelDataModel.$.getPrimaryMessage(
                    ownerId,
                    masterChannelDB.id
                );

                args.title = primaryMessage?.title || configV3.constants.dynamicChannelPrimaryMessageTitle;
                args.description = primaryMessage?.description || configV3.constants.dynamicChannelPrimaryMessageDescription;
            }
        } else {
            args.dynamicChannelButtonsTemplate = DynamicChannelPrimaryMessageElementsGroup.getAll().map( item => item.getId() );
        }

        return args;
    }
}
