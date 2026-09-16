import fs from "node:fs";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";

import type {
    IBotCatalog,
    ICatalogCopy,
    ICatalogCommand,
    ICatalogEmbed,
    ICatalogPanelButton,
    ICatalogPanelButtonV2,
    ICatalogSelectMenu,
    TCommandTierName
} from "@vertix.gg/bot-e2e/src/catalog/bot-catalog-types";

/**
 * What the bot says it has, read from the bot rather than restated here.
 *
 * The commands come from `commands/definitions`, the panel's buttons from the button classes
 * themselves, and every string a member reads from `assets/languages/en.json` - which is the snapshot
 * that wins at runtime, so it is the only honest thing to assert against. A command added to the
 * definitions is covered by `tests/commands` without this package being touched; one removed makes
 * its test disappear rather than fail for a stale reason.
 */
export class BotCatalog {
    private static instance: BotCatalog | null = null;

    private readonly catalog: IBotCatalog;

    public static get $(): BotCatalog {
        if ( ! BotCatalog.instance ) {
            BotCatalog.instance = new BotCatalog();
        }

        return BotCatalog.instance;
    }

    private constructor() {
        const catalogPath = E2EConfig.$.catalogPath;

        if ( ! fs.existsSync( catalogPath ) ) {
            throw new Error(
                `Bot catalog missing at ${ catalogPath }.\n` +
                "It is written by the playwright global setup - run `bun run vertix:bot:e2e:catalog` to build it by hand."
            );
        }

        this.catalog = JSON.parse( fs.readFileSync( catalogPath, "utf8" ) );
    }

    public get commands(): ICatalogCommand[] {
        return this.catalog.commands;
    }

    public get panelButtons(): ICatalogPanelButton[] {
        return this.catalog.panelButtons;
    }

    public commandsOfGroup( group: string | null ): ICatalogCommand[] {
        return this.catalog.commands.filter( ( command ) => command.group === group );
    }

    public commandsOfTier( tier: TCommandTierName ): ICatalogCommand[] {
        return this.catalog.commands.filter( ( command ) => command.tier === tier );
    }

    public command( fullName: string ): ICatalogCommand {
        const found = this.catalog.commands.find( ( command ) => command.fullName === fullName );

        if ( ! found ) {
            throw new Error( `No command named ${ fullName } in the catalog.` );
        }

        return found;
    }

    public get copyNames(): ICatalogCopy {
        return this.catalog.copy;
    }

    public get panelButtonsV2(): ICatalogPanelButtonV2[] {
        return this.catalog.panelButtonsV2;
    }

    public panelButtonV2( entityName: string ): ICatalogPanelButtonV2 {
        const found = this.catalog.panelButtonsV2.find( ( button ) => button.name === entityName );

        if ( ! found ) {
            throw new Error( `No v2 panel button named ${ entityName } in the catalog.` );
        }

        return found;
    }

    /**
     * Every reading a v2 button can show - one label, or the several a run-time label resolves into.
     */
    public panelButtonV2Readings( entityName: string ): string[] {
        const button = this.panelButtonV2( entityName );

        return button.alternatives.length ? button.alternatives : [ button.label ];
    }

    public panelButton( entityName: string ): ICatalogPanelButton {
        const found = this.catalog.panelButtons.find( ( button ) => button.name === entityName );

        if ( ! found ) {
            throw new Error( `No panel button named ${ entityName } in the catalog.` );
        }

        return found;
    }

    public buttonLabel( entityName: string ): string {
        const label = this.catalog.copy.buttons[ entityName ];

        if ( undefined === label ) {
            throw new Error( `No translated label for button ${ entityName }.` );
        }

        return label;
    }

    public textInputLabel( entityName: string ): string {
        const input = this.catalog.copy.textInputs[ entityName ];

        if ( ! input ) {
            throw new Error( `No translated text input for ${ entityName }.` );
        }

        return input.label;
    }

    public textInputPlaceholder( entityName: string ): string {
        const input = this.catalog.copy.textInputs[ entityName ];

        if ( ! input?.placeholder ) {
            throw new Error( `Text input ${ entityName } has no placeholder.` );
        }

        return input.placeholder;
    }

    public embed( entityName: string ): ICatalogEmbed {
        const embed = this.catalog.copy.embeds[ entityName ];

        if ( ! embed ) {
            throw new Error( `No translated embed for ${ entityName }.` );
        }

        return embed;
    }

    public embedTitle( entityName: string ): string {
        const { title } = this.embed( entityName );

        if ( ! title ) {
            throw new Error( `Embed ${ entityName } has no title.` );
        }

        return title;
    }

    public modalTitle( entityName: string ): string {
        const title = this.catalog.copy.modals[ entityName ];

        if ( undefined === title ) {
            throw new Error( `No translated modal title for ${ entityName }.` );
        }

        return title;
    }

    public selectPlaceholder( entityName: string ): string {
        const { placeholder } = this.selectMenu( entityName );

        if ( ! placeholder ) {
            throw new Error( `Select menu ${ entityName } has no placeholder.` );
        }

        return placeholder;
    }

    /**
     * Options are matched on `value` rather than on position, because the language files fall back to
     * position and an option inserted mid-list silently takes the label of the one below it.
     */
    public selectOptionLabel( entityName: string, value: string ): string {
        const option = this.selectMenu( entityName ).options.find( ( candidate ) => candidate.value === value );

        if ( ! option ) {
            throw new Error( `Select menu ${ entityName } has no option with value "${ value }".` );
        }

        return option.label;
    }

    public selectMenu( entityName: string ): ICatalogSelectMenu {
        const menu = this.catalog.copy.selectMenus[ entityName ];

        if ( ! menu ) {
            throw new Error( `No translated select menu for ${ entityName }.` );
        }

        return menu;
    }
}
