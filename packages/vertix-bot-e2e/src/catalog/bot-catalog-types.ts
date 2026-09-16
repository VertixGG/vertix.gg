export type TCommandTierName = "owner" | "any" | "in-channel" | "admin";

export interface ICatalogCommand {
    name: string;
    group: string | null;
    fullName: string;
    description: string;
    tier: TCommandTierName;
    adapterName: string;
    adapterNameV2: string | null;
    modalName: string | null;
    modalNameV2: string | null;
    executionStep: string | null;
}

export interface ICatalogPanelButton {
    name: string;
    emojiName: string;
    sortId: number;
}

/**
 * A button on the older interface's control panel.
 *
 * Shaped differently from its v3 counterpart because the interface is: v2 draws a label beside a
 * unicode emoji, where v3 draws a custom emoji and no text at all. So a v2 button is found by what it
 * says, and a v3 one by the name of the emoji it wears - and `alternatives` carries the readings of a
 * label the bot fills in at run time, like the privacy button that reads Public or Private.
 */
export interface ICatalogPanelButtonV2 {
    name: string;
    label: string;
    alternatives: string[];
}

export interface ICatalogSelectOption {
    label: string;
    value: string | null;
}

export interface ICatalogSelectMenu {
    placeholder: string | null;
    options: ICatalogSelectOption[];
}

export interface ICatalogEmbed {
    title: string | null;
    description: string | null;
}

export interface ICatalogTextInput {
    label: string;
    placeholder: string | null;
}

export interface ICatalogCopy {
    buttons: Record<string, string>;
    textInputs: Record<string, ICatalogTextInput>;
    embeds: Record<string, ICatalogEmbed>;
    modals: Record<string, string>;
    selectMenus: Record<string, ICatalogSelectMenu>;
}

export interface IBotCatalog {
    generatedAt: string;
    commands: ICatalogCommand[];
    panelButtons: ICatalogPanelButton[];
    panelButtonsV2: ICatalogPanelButtonV2[];
    copy: ICatalogCopy;
}
