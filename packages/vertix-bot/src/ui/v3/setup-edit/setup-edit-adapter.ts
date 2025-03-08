import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { AdminAdapterExuBase } from "@vertix.gg/bot/src/ui/general/admin/admin-adapter-exu-base";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import { SetupEditComponent } from "@vertix.gg/bot/src/ui/v3/setup-edit/setup-edit-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { SetupMasterEditSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-select-menu";

import type { MessageComponentInteraction, VoiceChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultChannelSelectMenuChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultStringSelectRolesChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

type Interactions =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultChannelSelectMenuChannelTextInteraction
    | UIDefaultModalChannelTextInteraction;

// noinspection DuplicatedCode

export class SetupEditAdapter extends AdminAdapterExuBase<VoiceChannel, Interactions> {
    private appService: AppService;

    public static getName() {
        return "Vertix/UI-V3/SetupEditAdapter";
    }

    public static getComponent() {
        return SetupEditComponent;
    }

    protected static getExcludedElements() {
        return [SetupMasterEditSelectMenu];
    }

    protected static getExecutionSteps() {
        return {
            default: {},

            "Vertix/UI-V3/SetupEditMaster": {
                elementsGroup: "Vertix/UI-V3/SetupEditElementsGroup",
                embedsGroup: "Vertix/UI-V3/SetupEditEmbedGroup"
            },

            "Vertix/UI-V3/SetupEditButtons": {
                elementsGroup: "Vertix/UI-V3/SetupEditButtonsElementsGroup",
                embedsGroup: "Vertix/UI-V3/SetupEditButtonsEmbedGroup"
            },
            "Vertix/UI-V3/SetupEditButtonsEffect": {
                elementsGroup: "Vertix/UI-V3/SetupEditButtonsEffectElementsGroup",
                embedsGroup: "Vertix/UI-V3/SetupEditButtonsEffectEmbedGroup"
            },

            "Vertix/UI-V3/SetupEditVerifiedRoles": {
                elementsGroup: "Vertix/UI-V3/SetupEditVerifiedRolesElementsGroup",
                embedsGroup: "Vertix/UI-V3/SetupEditVerifiedRolesEmbedGroup"
            }
        };
    }

    public constructor(options: TAdapterRegisterOptions) {
        super(options);

        this.appService = ServiceLocator.$.get("VertixBot/Services/App");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async getStartArgs(channel: VoiceChannel) {
        return {};
    }

    protected getCustomIdForEntity(hash: string): string {
        if (hash === "VertixBot/UI-General/SetupAdapter:VertixBot/UI-General/SetupMasterEditSelectMenu") {
            return hash;
        }
        return super.getCustomIdForEntity(hash);
    }

    protected async getReplyArgs(interaction: Interactions, argsFromManager?: UIArgs) {
        let args: UIArgs = {};

        if (argsFromManager?.dynamicChannelButtonsTemplate) {
            args.dynamicChannelButtonsTemplate = DynamicChannelPrimaryMessageElementsGroup.sortIds(
                argsFromManager.dynamicChannelButtonsTemplate
            );
        }

        const availableArgs = this.getArgsManager().getArgs(this, interaction),
            masterChannelDB = argsFromManager?.masterChannelDB || availableArgs?.masterChannelDB;

        if (masterChannelDB) {
            // TODO: Does it even work?
            args.index = masterChannelDB.masterChannelIndex;
            args.ChannelDBId = masterChannelDB.id;
            args.masterChannelId = masterChannelDB.channelId;

            const masterChannelKeys = MasterChannelDataManager.$.getKeys();

            const masterChannelSettings = await MasterChannelDataManager.$.getAllSettings(masterChannelDB);

            const selectedKeys = [
                masterChannelKeys.dynamicChannelNameTemplate,
                masterChannelKeys.dynamicChannelButtonsTemplate,
                masterChannelKeys.dynamicChannelMentionable,
                masterChannelKeys.dynamicChannelVerifiedRoles
            ];

            selectedKeys.forEach((key) => {
                args[key] = masterChannelSettings[key];
            });
        } else {
            args.masterChannels = await ChannelModel.$.getMasters(interaction.guild?.id || "", "settings");
        }

        return args;
    }

    protected onEntityMap() {
        // Comes from 'setup' adapter, selects the master channel to edit
        this.bindButton<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/SetupMasterEditSelectMenu",
            this.onSetupMasterEditSelected
        );

        // Select edit option.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V3/SetupEditSelectEditOptionMenu",
            this.onSelectEditOptionSelected
        );

        // Channel name template.
        this.bindModal<UIDefaultModalChannelTextInteraction>(
            "VertixBot/UI-General/ChannelNameTemplateModal",
            this.onTemplateEditModalSubmitted
        );

        // Buttons template.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V3/ChannelButtonsTemplateSelectMenu",
            this.onButtonsSelected
        );

        // Effect buttons.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V3/SetupEditButtonsEffectImmediatelyButton",
            this.onButtonsEffectImmediatelyButtonsClicked
        );

        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V3/SetupEditButtonsEffectNewlyButton",
            this.onButtonsEffectNewlyButtonClicked
        );

        // Configuration toggle.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/ConfigExtrasSelectMenu",
            this.onConfigExtrasSelected
        );

        // Log channel.
        this.bindSelectMenu<UIDefaultChannelSelectMenuChannelTextInteraction>(
            "Vertix/UI-V3/LogChannelSelectMenu",
            this.onLogChannelSelected
        );

        // Verified roles buttons menu.
        this.bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
            "VertixBot/UI-General/VerifiedRolesMenu",
            this.onVerifiedRolesSelected
        );

        // Verified roles everyone.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/VerifiedRolesEveryoneSelectMenu",
            this.onVerifiedRolesEveryoneSelected
        );

        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/DoneButton",
            this.onDoneButtonClicked
        );

        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/WizardBackButton",
            this.onBackButtonClicked
        );

        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/WizardFinishButton",
            this.onFinishButtonClicked
        );
    }

    protected shouldRequireArgs() {
        return true;
    }

    protected async regenerate(interaction: MessageComponentInteraction<"cached">): Promise<void> {
        this.uiService.get("VertixBot/UI-General/SetupAdapter")?.editReply(interaction);
    }

    private async onSetupMasterEditSelected(interaction: UIDefaultStringSelectMenuChannelTextInteraction) {
        const args = this.getArgsManager().getArgs(this, interaction);

        args.index = args.masterChannelIndex;
        args.ChannelDBId = args.masterChannelDB.id;
        args.masterChannelId = args.masterChannelDB.channelId;

        const masterChannelKeys = MasterChannelDataManager.$.getKeys();
        const masterChannelSettings = await MasterChannelDataManager.$.getAllSettings(args.masterChannelDB, {
            [masterChannelKeys.dynamicChannelLogsChannelId]: [interaction.guild.roles.everyone.id]
        });

        Object.entries(masterChannelSettings).forEach(([key, value]) => {
            args[key] = value;
        });

        if (args[masterChannelKeys.dynamicChannelVerifiedRoles].includes(interaction.guild.roles.everyone.id)) {
            args.dynamicChannelIncludeEveryoneRole = true;
        }

        // For verified roles.
        args._wizardIsFinishButtonAvailable = true;

        this.getArgsManager().setArgs(this, interaction, args);

        await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditMaster");
    }

    private async onSelectEditOptionSelected(interaction: UIDefaultStringSelectMenuChannelTextInteraction) {
        switch (interaction.values[0]) {
            // TODO: Use constants.

            default: // Being called after the modal is canceled and the same option requested again.
            case "edit-dynamic-channel-name":
                await this.showModal("VertixBot/UI-General/ChannelNameTemplateModal", interaction);
                break;

            case "edit-dynamic-channel-buttons":
                await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditButtons");
                break;

            case "edit-dynamic-channel-verified-roles":
                await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditVerifiedRoles");
                break;
        }
    }

    private async onTemplateEditModalSubmitted(interaction: UIDefaultModalChannelTextInteraction) {
        const channelNameInputId = this.customIdStrategy.generateId(
            "Vertix/UI-V3/SetupEditAdapter:VertixBot/UI-General/ChannelNameTemplateInput"
        );

        const value = interaction.fields.getTextInputValue(channelNameInputId),
            args = this.getArgsManager().getArgs(this, interaction);

        const { settings } = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
            "Vertix/Config/MasterChannel",
            VERSION_UI_V3
        ).data;

        this.getArgsManager().setArgs(this, interaction, {
            dynamicChannelNameTemplate: value || settings.dynamicChannelNameTemplate
        });

        // TODO: Find better way to handle this
        const masterChannelDB: any = {
            id: args.ChannelDBId,
            version: VERSION_UI_V3
        };

        await MasterChannelDataManager.$.setChannelNameTemplate(masterChannelDB, value);

        await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditMaster");
    }

    private async onButtonsSelected(interaction: UIDefaultStringSelectMenuChannelTextInteraction) {
        this.getArgsManager().setArgs(this, interaction, {
            dynamicChannelButtonsTemplate: DynamicChannelPrimaryMessageElementsGroup.sortIds(interaction.values)
        });

        await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditButtonsEffect");
    }

    private async onButtonsEffectImmediatelyButtonsClicked(
        interaction: UIDefaultStringSelectMenuChannelTextInteraction
    ) {
        const args = this.getArgsManager().getArgs(this, interaction),
            buttons = DynamicChannelPrimaryMessageElementsGroup.sortIds(args.dynamicChannelButtonsTemplate);

        // TODO: Find better way to handle this
        const masterChannelDB: any = {
            id: args.ChannelDBId,
            version: VERSION_UI_V3
        };
        await MasterChannelDataManager.$.setChannelButtonsTemplate(masterChannelDB, buttons);

        const claimChannelButtonId = DynamicChannelPrimaryMessageElementsGroup.getByName(
            "Vertix/UI-V3/DynamicChannelClaimChannelButton"
        )?.getId();

        if (claimChannelButtonId && buttons.includes(claimChannelButtonId)) {
            // Get all channels that are using this “master” channel.
            setTimeout(async () => {
                const channels = await ChannelModel.$.getDynamicsByMasterId(interaction.guildId, args.masterChannelId);

                for (const channelDB of channels) {
                    const channel = this.appService.getClient().channels.cache.get(channelDB.channelId) as VoiceChannel;

                    if (!channel) {
                        console.warn(`Channel ${channelDB.channelId} not found.`);
                    }

                    this.dynamicChannelService.editPrimaryMessageDebounce(channel);
                }

                DynamicChannelClaimManager.get("Vertix/UI-V3/DynamicChannelClaimManager")
                    .handleAbandonedChannels(this.appService.getClient(), [], channels)
                    .catch((e) => {
                        throw e;
                    });
            });
        }

        await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditMaster");
    }

    private async onButtonsEffectNewlyButtonClicked(interaction: UIDefaultStringSelectMenuChannelTextInteraction) {
        const args = this.getArgsManager().getArgs(this, interaction),
            buttons = DynamicChannelPrimaryMessageElementsGroup.sortIds(args.dynamicChannelButtonsTemplate);

        // TODO: Find better way to handle this
        const masterChannelDB: any = {
            id: args.ChannelDBId,
            version: VERSION_UI_V3
        };
        await MasterChannelDataManager.$.setChannelButtonsTemplate(masterChannelDB, buttons);

        await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditMaster");
    }

    private async onDoneButtonClicked(interaction: UIDefaultButtonChannelTextInteraction) {
        switch (this.getCurrentExecutionStep(interaction)?.name) {
            case "Vertix/UI-V3/SetupEditButtons":
                await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditMaster");
                break;

            case "Vertix/UI-V3/SetupEditMaster":
                this.deleteArgs(interaction);

                this.uiService.get("VertixBot/UI-General/SetupAdapter")?.editReply(interaction);
                break;
        }

        this.deleteArgs(interaction);
    }

    private async onConfigExtrasSelected(interaction: UIDefaultStringSelectMenuChannelTextInteraction) {
        const args: UIArgs = this.getArgsManager().getArgs(this, interaction),
            values = interaction.values;

        // TODO: Find better way to handle this
        const masterChannelDB: any = {
            id: args.ChannelDBId,
            version: VERSION_UI_V3
        };

        for (const value of values) {
            const parted = value.split(UI_CUSTOM_ID_SEPARATOR);

            switch (parted[0]) {
                case "dynamicChannelMentionable":
                    args.dynamicChannelMentionable = !!parseInt(parted[1]);

                    await MasterChannelDataManager.$.setChannelMentionable(
                        masterChannelDB,
                        args.dynamicChannelMentionable
                    );
                    break;

                case "dynamicChannelAutoSave":
                    args.dynamicChannelAutoSave = !!parseInt(parted[1]);

                    await MasterChannelDataManager.$.setChannelAutoSave(masterChannelDB, args.dynamicChannelAutoSave);
                    break;

                case "dynamicChannelLogsChannel":
                    args.dynamicChannelLogsChannelId = null;

                    await MasterChannelDataManager.$.setChannelLogsChannel(
                        masterChannelDB,
                        args.dynamicChannelLogsChannelId
                    );
                    break;
            }
        }

        this.getArgsManager().setArgs(this, interaction, args);

        await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditMaster");
    }

    private async onLogChannelSelected(interaction: UIDefaultChannelSelectMenuChannelTextInteraction) {
        const channelId = interaction.values.at(0) || null,
            args: UIArgs = this.getArgsManager().getArgs(this, interaction);

        args.dynamicChannelLogsChannelId = channelId;

        // TODO: Find better way to handle this
        const masterChannelDB: any = {
            id: args.ChannelDBId,
            version: VERSION_UI_V3
        };

        await MasterChannelDataManager.$.setChannelLogsChannel(masterChannelDB, channelId);

        this.getArgsManager().setArgs(this, interaction, args);

        await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditMaster");
    }

    private async onVerifiedRolesSelected(interaction: UIDefaultStringSelectRolesChannelTextInteraction) {
        const args: UIArgs = this.getArgsManager().getArgs(this, interaction),
            roles = interaction.values;

        if (args.dynamicChannelIncludeEveryoneRole) {
            roles.push(interaction.guildId);
        }

        this.getArgsManager().setArgs(this, interaction, {
            dynamicChannelVerifiedRoles: roles.sort(),
            _wizardIsFinishButtonDisabled: !roles.length
        });

        await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditVerifiedRoles");
    }

    private async onVerifiedRolesEveryoneSelected(interaction: UIDefaultStringSelectMenuChannelTextInteraction) {
        const args: UIArgs = this.getArgsManager().getArgs(this, interaction),
            values = interaction.values;

        values.forEach((value) => {
            const parted = value.split(UI_CUSTOM_ID_SEPARATOR);

            switch (parted[0]) {
                case "dynamicChannelIncludeEveryoneRole":
                    const state = !!parseInt(parted[1]),
                        isEveryoneExist = args.dynamicChannelVerifiedRoles.includes(interaction.guildId);

                    args.dynamicChannelIncludeEveryoneRole = state;

                    if (state && !isEveryoneExist) {
                        args.dynamicChannelVerifiedRoles.push(interaction.guildId);
                    } else if (!state && isEveryoneExist) {
                        args.dynamicChannelVerifiedRoles.splice(
                            args.dynamicChannelVerifiedRoles.indexOf(interaction.guildId),
                            1
                        );
                    }

                    args.dynamicChannelVerifiedRoles = args.dynamicChannelVerifiedRoles.sort();

                    break;
            }
        });

        args._wizardIsFinishButtonDisabled = !args.dynamicChannelVerifiedRoles?.length;

        this.getArgsManager().setArgs(this, interaction, args);

        await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditVerifiedRoles");
    }

    private async onBackButtonClicked(interaction: UIDefaultButtonChannelTextInteraction) {
        const args = this.getArgsManager().getArgs(this, interaction);

        const keys = MasterChannelDataManager.$.getKeys();

        // TODO: Find better way to handle this
        const masterChannelDB: any = {
            id: args.ChannelDBId,
            version: VERSION_UI_V3
        };

        const verifiedRoles = await MasterChannelDataManager.$.getChannelVerifiedRoles(
            masterChannelDB,
            interaction.guild.id
        );

        if (verifiedRoles.length && verifiedRoles.includes(interaction.guild.roles.everyone.id)) {
            args.dynamicChannelIncludeEveryoneRole = true;
        }

        args[keys.dynamicChannelVerifiedRoles] = verifiedRoles;

        this.getArgsManager().setArgs(this, interaction, args);

        await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditMaster");
    }

    private async onFinishButtonClicked(interaction: UIDefaultButtonChannelTextInteraction) {
        const args: UIArgs = this.getArgsManager().getArgs(this, interaction);

        // TODO: Find better way to handle this.
        const masterChannelDB: any = {
            id: args.ChannelDBId,
            version: VERSION_UI_V3
        };

        await MasterChannelDataManager.$.setChannelVerifiedRoles(
            masterChannelDB,
            interaction.guildId,
            args.dynamicChannelVerifiedRoles
        );

        await this.editReplyWithStep(interaction, "Vertix/UI-V3/SetupEditMaster");
    }
}
