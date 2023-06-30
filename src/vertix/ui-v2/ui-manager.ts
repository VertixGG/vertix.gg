import process from "process";

import { InitializeBase } from "@vertix-base/bases/initialize-base";

import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";
import { UILanguageManager } from "@vertix/ui-v2/ui-language-manager";

import { UIAdapterBase } from "@vertix/ui-v2/_base/ui-adapter-base";

const ADAPTER_CLEANUP_WORKER_INTERVAL = Number( process.env.ADAPTER_CLEANUP_WORKER_INTERNVAL ) ||
    300000; // 5 minutes.

export class UIManager extends InitializeBase {
    private static instance: UIManager;

    private static cleanWorkerTimer: NodeJS.Timeout;

    public static getName() {
        return "Vertix/UI-V2/UIManager";
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

        await UIAdapterManager.$.register();
        await UILanguageManager.$.register();
    }
}
