import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType, PermissionFlagsBits, PermissionsBitField } from "discord.js";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { WelcomeComponent } from "@vertix.gg/bot/src/ui/general/welcome/welcome-component";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type { BaseMessageOptions, VoiceChannel } from "discord.js";

import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

export class WelcomeAdapter extends UIAdapterBase<VoiceChannel, UIDefaultButtonChannelVoiceInteraction> {
    public static getName() {
        return "VertixBot/UI-General/WelcomeAdapter";
    }

    public static getComponent() {
        return WelcomeComponent;
    }

    public getPermissions() {
        return new PermissionsBitField(PermissionFlagsBits.ViewChannel);
    }

    public getChannelTypes() {
        return [ChannelType.GuildVoice, ChannelType.GuildText];
    }

    protected getMessage(
        from: UIAdapterBuildSource,
        context: VoiceChannel | UIDefaultButtonChannelVoiceInteraction,
        argsFromManager?: UIArgs
    ): BaseMessageOptions {
        const result = super.getMessage();

        // Mention the owner of the channel - TODO Find cleaner way to do this.
        if (argsFromManager?.userId && "send" === from) {
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
        this.bindButton("VertixBot/UI-General/WelcomeSetupButton", async (interaction) => {
            const uiService = ServiceLocator.$.get<UIService>("VertixGUI/UIService"),
                uiAdapter = uiService.get("VertixBot/UI-General/SetupAdapter");

            await uiAdapter?.ephemeral(interaction);

            const argsId = this.getArgsManager().getArgsId(interaction);

            this.getArgsManager().deleteArgs(this, argsId);
        });
    }
}
