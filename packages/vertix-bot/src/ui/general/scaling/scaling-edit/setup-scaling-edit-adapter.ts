import { ChannelType, PermissionsBitField } from "discord.js";

import { MasterChannelScalingDataModel } from "@vertix.gg/base/src/models/master-channel/master-channel-scaling-data-model-v3";

import { EMasterChannelType } from "@vertix.gg/base/src/definitions/master-channel";

import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { AdminAdapterExuBase } from "@vertix.gg/bot/src/ui/general/admin/admin-adapter-exu-base";

import { SetupScalingEditComponent } from "@vertix.gg/bot/src/ui/general/scaling/scaling-edit/setup-scaling-edit-component";

import { SetupMasterEditSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-select-menu";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import type { BaseGuildTextChannel, CategoryChannel, VoiceChannel } from "discord.js";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

type Interactions =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultModalChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction;

export class SetupScalingEditAdapter extends AdminAdapterExuBase<BaseGuildTextChannel, Interactions> {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingEditAdapter";
    }

    public static getComponent() {
        return SetupScalingEditComponent;
    }

    protected static getExecutionSteps() {
        return {
            default: {},

            "VertixBot/UI-General/SetupScalingEdit": {
                elementsGroup: "VertixBot/UI-General/SetupScalingEditElementsGroup",
                embedsGroup: "VertixBot/UI-General/SetupScalingEditEmbedGroup"
            }
        };
    }

    protected static getExcludedElements() {
        return [ SetupMasterEditSelectMenu ];
    }

    public getPermissions() {
        return new PermissionsBitField( DEFAULT_SETUP_PERMISSIONS );
    }

    public getChannelTypes() {
        return [ ChannelType.GuildVoice, ChannelType.GuildText ];
    }

    protected async getStartArgs( _channel: BaseGuildTextChannel ) {
        return {};
    }

    protected async getReplyArgs( interaction: Interactions, argsFromManager?: UIArgs ) {
        const args: UIArgs = {};

        const masterChannelDB = argsFromManager?.masterChannelDB;
        if ( masterChannelDB ) {
            const scalingSettings = await MasterChannelScalingDataModel.$.getSettings( masterChannelDB.id );

            if ( scalingSettings ) {
                args.selectedCategoryId = scalingSettings.scalingChannelCategoryId;
                args.channelPrefix = scalingSettings.scalingChannelPrefix;
                args.maxMembersPerChannel = String( scalingSettings.scalingChannelMaxMembersPerChannel );

                if ( args.selectedCategoryId && ( interaction as any ).guild ) {
                    const category = ( interaction as any ).guild.channels.cache.get( args.selectedCategoryId );
                    if ( category ) {
                        args.selectedCategoryName = category.name;
                    }
                }
            }

            args.masterChannelDB = masterChannelDB;
            args.masterChannelIndex = argsFromManager?.masterChannelIndex;
        }

        return args;
    }

    protected onEntityMap() {
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/SetupMasterEditSelectMenu",
            this.onSetupMasterEditSelected
        );

        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/SetupScalingCategorySelectMenu",
            this.onCategorySelected
        );

        this.bindModal<UIDefaultModalChannelTextInteraction>(
            "VertixBot/UI-General/SetupScalingCategoryNameModal",
            this.onCategoryNameModalSubmitted
        );

        this.bindModalWithButton<UIDefaultModalChannelTextInteraction>(
            "VertixBot/UI-General/SetupScalingPrefixButton",
            "VertixBot/UI-General/SetupScalingPrefixModal",
            this.onPrefixModalSubmitted
        );

        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/SetupScalingMaxMembersSelect",
            this.onMaxMembersSelected
        );

        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/DoneButton",
            this.onDoneButtonClicked
        );
    }

    public async editReply( interaction: Interactions, sendArgs?: UIArgs ) {
        return this.editReplyWithStep( interaction, "VertixBot/UI-General/SetupScalingEdit", sendArgs );
    }

    protected async onBeforeBuild( args: UIArgs, _from: UIAdapterBuildSource, context: Interactions ): Promise<void> {
        if ( context && ( context as any ).guild ) {
            const categories = ( context as any ).guild.channels.cache
                .filter( ( c: any ) => c.type === ChannelType.GuildCategory )
                .map( ( c: any ) => ( { id: c.id, name: c.name } ) );
            args.guildCategories = categories;
        }
    }

    private async onSetupMasterEditSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const current = this.getArgsManager().getArgs( this, interaction ) || {};
        const master = current.masterChannelDB;
        if ( master ) {
            const s = await MasterChannelScalingDataModel.$.getSettings( master.id );
            if ( s ) {
                current.selectedCategoryId = s.scalingChannelCategoryId;
                current.channelPrefix = s.scalingChannelPrefix;
                current.maxMembersPerChannel = String( s.scalingChannelMaxMembersPerChannel );

                if ( current.selectedCategoryId && interaction.guild ) {
                    const cat = interaction.guild.channels.cache.get( current.selectedCategoryId );
                    if ( cat ) current.selectedCategoryName = cat.name;
                }
            }
        }

        this.getArgsManager().setArgs( this, interaction, current );
        await this.editReplyWithStep( interaction, "VertixBot/UI-General/SetupScalingEdit" );
    }

    private async onCategorySelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const selectedValue = interaction.values[ 0 ];
        if ( selectedValue === "create-new-category" ) {
            await this.showModal( "VertixBot/UI-General/SetupScalingCategoryNameModal", interaction );
            return;
        }

        const args = this.getArgsManager().getArgs( this, interaction ) || {};
        const category = interaction.guild.channels.cache.get( selectedValue );
        args.selectedCategoryId = selectedValue;
        args.selectedCategoryName = category?.name || "";
        this.getArgsManager().setArgs( this, interaction, args );
        await interaction.deferUpdate();
        await this.editReplyWithStep( interaction, "VertixBot/UI-General/SetupScalingEdit", args );
    }

    private async onCategoryNameModalSubmitted( interaction: UIDefaultModalChannelTextInteraction ) {
        const categoryNameInputId = this.customIdStrategy.generateId(
            "VertixBot/UI-General/SetupScalingEditAdapter:VertixBot/UI-General/SetupScalingCategoryNameInput"
        );
        const categoryName = interaction.fields.getTextInputValue( categoryNameInputId );
        try {
            const category = await interaction.guild.channels.create( { name: categoryName, type: ChannelType.GuildCategory } );
            const args = this.getArgsManager().getArgs( this, interaction ) || {};
            args.selectedCategoryId = category.id;
            args.selectedCategoryName = categoryName;
            this.getArgsManager().setArgs( this, interaction, args );
            await this.editReplyWithStep( interaction, "VertixBot/UI-General/SetupScalingEdit", args );
        } catch {
            await this.ephemeral( interaction, {} );
        }
    }

    private async onPrefixModalSubmitted( interaction: UIDefaultModalChannelTextInteraction ) {
        const prefixInputId = this.customIdStrategy.generateId(
            "VertixBot/UI-General/SetupScalingEditAdapter:VertixBot/UI-General/SetupScalingPrefixInput"
        );
        const channelPrefix = interaction.fields.getTextInputValue( prefixInputId );
        const args = this.getArgsManager().getArgs( this, interaction ) || {};
        args.channelPrefix = channelPrefix;
        this.getArgsManager().setArgs( this, interaction, args );
        await this.editReplyWithStep( interaction, "VertixBot/UI-General/SetupScalingEdit", args );
    }

    private async onMaxMembersSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const selectedValue = interaction.values[ 0 ];
        const args = this.getArgsManager().getArgs( this, interaction ) || {};
        args.maxMembersPerChannel = selectedValue;
        this.getArgsManager().setArgs( this, interaction, args );
        await interaction.deferUpdate();
        await this.editReplyWithStep( interaction, "VertixBot/UI-General/SetupScalingEdit", args );
    }

    private async onDoneButtonClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        if ( !interaction.deferred && !interaction.replied ) {
            try { await interaction.deferUpdate(); } catch {}
        }

        const args: UIArgs = this.getArgsManager().getArgs( this, interaction ) || {};
        const masterChannelDB = args.masterChannelDB;
        if ( masterChannelDB ) {
            const prev = await MasterChannelScalingDataModel.$.getSettings( masterChannelDB.id );

            const prevMax = prev?.scalingChannelMaxMembersPerChannel,
                prevCat = prev?.scalingChannelCategoryId,
                prevPrefix = prev?.scalingChannelPrefix,
                newMax = args.maxMembersPerChannel ? parseInt( String( args.maxMembersPerChannel ), 10 ) : undefined,
                newCat = args.selectedCategoryId,
                newPrefix = args.channelPrefix,
                isMaxChanged = typeof newMax === "number" && newMax > 0 && newMax !== prevMax,
                isCatChanged = !!newCat && newCat !== prevCat,
                isPrefixChanged = !!newPrefix && newPrefix !== prevPrefix;

            const scaled: VoiceChannel[] = [];
            if ( interaction.guild ) {
                for ( const c of interaction.guild.channels.cache.values() ) {
                    if ( c.type !== ChannelType.GuildVoice ) continue;
                    const db = await ChannelModel.$.getByChannelId( c.id );
                    if ( db && db.isScaling && db.ownerChannelId === masterChannelDB.id ) {
                        scaled.push( c as VoiceChannel );
                    }
                }
            }

            if ( isMaxChanged ) {
                for ( const ch of scaled ) {
                    try { await ch.setUserLimit( newMax as number ); } catch {}
                }
            }

            if ( isCatChanged && interaction.guild && newCat ) {
                const category = interaction.guild.channels.cache.get( newCat ) as CategoryChannel | undefined;
                if ( category ) {
                    for ( const ch of scaled ) {
                        try { await ch.setParent( category.id ); } catch {}
                    }

                    const masterVoice = interaction.guild.channels.cache.get( masterChannelDB.channelId ) as VoiceChannel | undefined;
                    if ( masterVoice ) {
                        try { await masterVoice.setParent( category.id ); } catch {}
                    }
                }
            }

            if ( isPrefixChanged ) {
                const ordered = [ ...scaled ].sort( ( a, b ) => a.createdTimestamp - b.createdTimestamp );
                let index = 1;
                for ( const ch of ordered ) {
                    const suffix = ch.name.split( "-" ).pop();
                    const num = suffix && /^\d+$/.test( suffix ) ? parseInt( suffix, 10 ) : index;
                    const name = `${ newPrefix }-${ num }`;
                    try { await ch.setName( name ); } catch {}
                    index++;
                }
            }

            await MasterChannelScalingDataModel.$.setSettings( masterChannelDB.id, {
                type: EMasterChannelType.AUTO_SCALING,
                scalingChannelMaxMembersPerChannel: newMax,
                scalingChannelCategoryId: newCat,
                scalingChannelPrefix: newPrefix
            }, true );
        }

        this.deleteArgs( interaction );
        this.uiService.get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction, {} );
    }
}

export default SetupScalingEditAdapter;

