import process from "process";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { UILanguageManager } from "@vertix.gg/bot/src/ui-v2/ui-language-manager";

import { UIAdapterBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-adapter-base";

import type { UIAdapterService } from "@vertix.gg/bot/src/ui-v2/ui-adapter-service";

const ADAPTER_CLEANUP_WORKER_INTERVAL = Number( process.env.ADAPTER_CLEANUP_WORKER_INTERVAL ) ||
    300000; // 5 minutes.

export class UIManager extends InitializeBase {
    private static instance: UIManager;

    private static cleanWorkerTimer: NodeJS.Timeout;

    public static getName() {
        return "VertixBot/UI-V2/UIManager";
    }

    public constructor(
        // TODO: Why repeating... why not? Debugger( UIManager.getName(), "", /* check env */ "env" );
        private uiDebugger = new Debugger( UIManager.getName(), "", isDebugEnabled( "UI", UIManager.getName() ) )
    ) {
        super();

    }

    public static getInstance() {
        if ( ! UIManager.instance ) {
            UIManager.instance = new UIManager();
        }

        return UIManager.instance;
    }

    public static get $() {
        return UIManager.getInstance();
    }

    public async register() {
        if ( ! UIManager.cleanWorkerTimer ) {
            UIManager.cleanWorkerTimer = setInterval( UIAdapterBase.cleanupWorker, ADAPTER_CLEANUP_WORKER_INTERVAL );
        }

        const uiAdapterService = ServiceLocator.$.get<UIAdapterService>( "VertixBot/UI-V2/UIAdapterService" );

        // In order `UILanguageManager` to work, it has to build the language definitions according to the adapters.
        await uiAdapterService.registerAdapters();

        await UILanguageManager.$.register();
    }
}
