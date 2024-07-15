import process from "process";

import { InitializeBase } from "@vertix.gg/base/src/bases/index";

import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import type { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import type {
    UIElementButtonLanguageContent,
    UIElementSelectMenuLanguageContent,
    UIElementTextInputLanguageContent,
    UIEmbedLanguageContent,
    UIMarkdownLanguageContent,
    UIModalLanguageContent
} from "@vertix.gg/gui/src/bases/ui-language-definitions";

import type { UILanguageManagerInterface } from "@vertix.gg/gui/src/interfaces/language-manager-interface";
import type { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import type { UIElementChannelSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-channel-select-menu";
import type { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";
import type { UIElementRoleSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-role-select-menu";
import type { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import type { UIElementUserSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-user-select-menu";
import type { UIMarkdownBase } from "@vertix.gg/gui/src/bases/ui-markdown-base";
import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

const ADAPTER_CLEANUP_TIMER_INTERVAL = Number( process.env.ADAPTER_CLEANUP_TIMER_INTERVAL ) ||
    300000; // 5 minutes.

export class UIService extends ServiceBase {
    private static cleanupTimerInterval: NodeJS.Timeout;

    private uiLanguageManager: UILanguageManagerInterface | null = null;

    public static getName() {
        return "VertixGUI/UIService";
    }

    protected static setupCleanupTimerInterval() {
        if ( ! UIService.cleanupTimerInterval ) {
            UIService.cleanupTimerInterval = setInterval( UIAdapterBase.cleanupTimer, ADAPTER_CLEANUP_TIMER_INTERVAL );
        }
    }

    public constructor() {
        super();

        ( this.constructor as typeof UIService ).setupCleanupTimerInterval();
    }

    public registerUILanguageManager( uiLanguageManager: UILanguageManagerInterface ) {
        if ( this.uiLanguageManager ) {
            throw new Error( "UI Language Manager is already registered" );
        }

        this.uiLanguageManager = uiLanguageManager;
    }

    public getUILanguageManager() {
        return this.uiLanguageManager || new class NullLanguageManager extends InitializeBase implements UILanguageManagerInterface {
            public constructor() {
                super();
            }

            public static getName() {
                return "VertixGUI/NullLanguageManager";
            }

            public getButtonTranslatedContent( button: UIElementButtonBase, _languageCode: string | undefined ): Promise<UIElementButtonLanguageContent> {
                return Promise.resolve( button.getTranslatableContent() );
            }

            public getEmbedTranslatedContent( embed: UIEmbedBase, _languageCode: string | undefined ): Promise<UIEmbedLanguageContent> {
                return Promise.resolve( embed.getTranslatableContent() );
            }

            public getMarkdownTranslatedContent( markdown: UIMarkdownBase, _languageCode: string | undefined ): Promise<UIMarkdownLanguageContent> {
                return Promise.resolve( markdown.getTranslatableContent() );
            }

            public getModalTranslatedContent( modal: UIModalBase, _languageCode: string | undefined ): Promise<UIModalLanguageContent> {
                return Promise.resolve( modal.getTranslatableContent() );
            }

            public getSelectMenuTranslatedContent( selectMenu: UIElementStringSelectMenu | UIElementUserSelectMenu | UIElementRoleSelectMenu | UIElementChannelSelectMenu, _languageCode: string | undefined ): Promise<UIElementSelectMenuLanguageContent> {
                return Promise.resolve( selectMenu.getTranslatableContent() );
            }

            public getTextInputTranslatedContent( textInput: UIElementInputBase, _languageCode: string | undefined ): Promise<UIElementTextInputLanguageContent> {
                return Promise.resolve( textInput.getTranslatableContent() );
            }

            public register(): Promise<void> {
                return Promise.resolve( undefined );
            }
        }();
    }
}

export default UIService;
