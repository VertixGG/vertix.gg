import { ChannelType, PermissionFlagsBits, PermissionsBitField } from "discord.js";

import { UIAdapterBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-adapter-base";

import { WelcomeComponent } from "@vertix.gg/bot/src/ui-v2/welcome/welcome-component";

import type { BaseMessageOptions, VoiceChannel } from "discord.js";

import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/bot/src/ui-v2/_base/ui-interaction-interfaces";

export class WelcomeAdapter extends UIAdapterBase<VoiceChannel, UIDefaultButtonChannelVoiceInteraction> {
    public static getName() {
        return "Vertix/UI-V2/WelcomeAdapter";
    }

    public static getComponent() {
        return WelcomeComponent;
    }

    public getPermissions() {
        return new PermissionsBitField( PermissionFlagsBits.ViewChannel );
    }

    public getChannelTypes() {
        return [
            ChannelType.GuildVoice,
            ChannelType.GuildText,
        ];
    }

    protected getMessage( from: UIAdapterBuildSource, context: VoiceChannel | UIDefaultButtonChannelVoiceInteraction, argsFromManager?: UIArgs ): BaseMessageOptions {
        const result = super.getMessage();

        // Mention the owner of the channel - TODO Find cleaner way to do this.
        if ( argsFromManager?.userId && "send" === from ) {
            result.content = "<@" + argsFromManager.userId + ">";
        }

        return result;
    }

    protected getStartArgs() {
        return {};
    }

    protected getReplyArgs() {
        return {};
    }

    protected onEntityMap() {
        this.bindButton( "Vertix/UI-V2/WelcomeSetupButton", async ( interaction ) => {
            await this.uiService.get( "Vertix/UI-V2/SetupAdapter" )?.ephemeral( interaction );

            const argsId = this.getArgsManager().getArgsId( interaction );

            this.getArgsManager().deleteArgs( this, argsId );
        } );
    }
}
