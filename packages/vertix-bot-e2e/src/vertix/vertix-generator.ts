import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

import type { DiscordApp } from "@vertix.gg/bot-e2e/src/discord/discord-app";
import type { GuildState } from "@vertix.gg/bot-e2e/src/discord/guild-state";
import type { VertixScreen } from "@vertix.gg/bot-e2e/src/vertix/vertix-screen";

export interface IGeneratorHandle {
    channelId: string;
    name: string;
}

export interface IScalingOptions {
    prefix: string;
    maxMembers: number;
}

/**
 * Making a generator, the way an admin makes one.
 *
 * Every test starts from a guild with none, so this is the first thing most of them do. It is the
 * wizard rather than a database insert on purpose: a generator the suite wrote itself would be a
 * generator no admin could have created, and half the behaviour under test is decided by what the
 * wizard stored.
 */
export class VertixGenerator {
    public constructor(
        private readonly app: DiscordApp,
        private readonly guild: GuildState,
        private readonly screen: VertixScreen
    ) {}

    public async createV3(): Promise<IGeneratorHandle> {
        const knownVoiceIds = await this.guild.voiceChannelIds();

        await this.runV3Wizard();

        return this.claimCreatedChannel( knownVoiceIds, true );
    }

    /**
     * The wizard, and nothing after it.
     *
     * `createV3()` waits for the generator's control panel before handing it over, which is what keeps
     * every other test clear of the window where a generator exists but its settings do not. A test
     * about that window has to be able to skip the wait.
     */
    public async runV3Wizard(): Promise<void> {
        const created = await this.app.commands.run( { group: "manage", name: "new-generator" } );

        await this.screen.expectTitle( created, BotCatalog.$.embedTitle( "VertixBot/UI-General/SetupMasterCreateEmbed" ) );

        const stepOne = await this.screen.choose(
            created,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/SetupMasterCreateSelectMenu" ),
            BotCatalog.$.selectOptionLabel( "VertixBot/UI-General/SetupMasterCreateSelectMenu", "v3" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/SetupNewStep1Embed" )
        );

        const stepTwo = await this.screen.advance(
            stepOne,
            BotCatalog.$.buttonLabel( "VertixBot/UI-General/WizardNextButton" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/SetupNewStep2Embed" )
        );

        // As v2 above: the shared generator carries every button, so the panel specs press them
        // rather than skipping the ones an ordinary generator is not created with.
        await this.app.messages.chooseEveryOption( this.app.messages.selectMenuAt( stepTwo, 0 ) );

        const stepThree = await this.screen.advance(
            stepTwo,
            BotCatalog.$.buttonLabel( "VertixBot/UI-General/WizardNextButton" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/SetupNewStep3Embed" )
        );

        await this.app.messages
            .labelledButton( stepThree, BotCatalog.$.buttonLabel( "VertixBot/UI-General/WizardFinishButton" ) )
            .click();
    }

    public async createV2(): Promise<IGeneratorHandle> {
        const knownVoiceIds = await this.guild.voiceChannelIds();

        const created = await this.app.commands.run( { group: "manage", name: "new-generator" } );

        const stepOne = await this.screen.choose(
            created,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/SetupMasterCreateSelectMenu" ),
            BotCatalog.$.selectOptionLabel( "VertixBot/UI-General/SetupMasterCreateSelectMenu", "v2" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-V2/SetupStep1Embed" )
        );

        const stepTwo = await this.screen.advance(
            stepOne,
            BotCatalog.$.buttonLabel( "VertixBot/UI-General/WizardNextButton" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-V2/SetupStep2Embed" )
        );

        // Every button this version has, not the default set. A button the generator does not carry
        // is one the panel specs can only skip, and `pressing X answers with something` is the whole
        // of what they do - so the generator the suite shares carries the lot.
        await this.app.messages.chooseEveryOption( this.app.messages.selectMenuAt( stepTwo, 0 ) );

        const stepThree = await this.screen.advance(
            stepTwo,
            BotCatalog.$.buttonLabel( "VertixBot/UI-General/WizardNextButton" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-V2/SetupStep3Embed" )
        );

        await this.app.messages
            .labelledButton( stepThree, BotCatalog.$.buttonLabel( "VertixBot/UI-General/WizardFinishButton" ) )
            .click();

        return this.claimCreatedChannel( knownVoiceIds, false );
    }

    public async createScaling( options: IScalingOptions ): Promise<IGeneratorHandle> {
        const knownVoiceIds = await this.guild.voiceChannelIds();

        const created = await this.app.commands.run( { group: "manage", name: "new-generator" } );

        await this.app.messages.chooseOption(
            created,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/SetupMasterCreateSelectMenu" ),
            BotCatalog.$.selectOptionLabel( "VertixBot/UI-General/SetupMasterCreateSelectMenu", "scaling" )
        );

        await this.app.modal.waitForTitle( BotCatalog.$.modalTitle( "VertixBot/UI-General/SetupScalingConfigModal" ) );

        await this.app.modal.fillField( 0, options.prefix );

        await this.app.modal.fillField( 1, String( options.maxMembers ) );

        await this.app.modal.submit();

        return this.claimCreatedChannel( knownVoiceIds, false );
    }

    /**
     * `awaitControlPanel` is a readiness wait, not a check of the panel itself.
     *
     * The bot writes the generator's settings before it creates the control panel, so the panel
     * appearing means a member joining will find the name template the join path needs. Without it the
     * suite joins in the milliseconds before that write and gets told its channel could not be created.
     * The generators that do not draw a panel - v2 and scaling - have nothing to wait on and say so.
     */
    private async claimCreatedChannel(
        knownVoiceIds: string[],
        awaitControlPanel: boolean
    ): Promise<IGeneratorHandle> {
        const channel = await this.guild.waitForNewVoiceChannel( knownVoiceIds );

        if ( awaitControlPanel ) {
            await this.guild.waitForControlChannel( channel.id );
        }

        return { channelId: channel.id, name: channel.name };
    }
}
