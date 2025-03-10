import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { UIWizardAdapterBase } from "@vertix.gg/gui/src/bases/ui-wizard-adapter-base";

import { ChannelType, PermissionsBitField } from "discord.js";

import { dynamicChannelRequirements } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/_dynamic-channel-requirements";

import type { VoiceChannel } from "discord.js";

import type {
    UIAdapterReplyContext,
    UIDefaultButtonChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

export abstract class DynamicChannelAdapterWizardBase<
    TInteraction extends UIAdapterReplyContext = UIDefaultButtonChannelVoiceInteraction
> extends UIWizardAdapterBase<VoiceChannel, TInteraction> {
    protected dynamicChannelService: DynamicChannelService;

    public static getName () {
        return "Vertix/UI-V3/DynamicChannelAdapterWizardBase";
    }

    public constructor ( options: TAdapterRegisterOptions ) {
        super( options );

        this.dynamicChannelService = ServiceLocator.$.get( "VertixBot/Services/DynamicChannel" );
    }

    public getChannelTypes () {
        return [ ChannelType.GuildVoice ];
    }

    public getPermissions () {
        return new PermissionsBitField( 0n );
    }

    public async isPassingInteractionRequirementsInternal ( interaction: TInteraction ) {
        return await dynamicChannelRequirements( interaction );
    }

    protected readonly shouldDeletePreviousReply = () => {
        return true;
    };
}
