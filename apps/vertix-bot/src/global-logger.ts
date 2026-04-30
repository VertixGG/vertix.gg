import { ObjectBase } from "@vertix.gg/base/src/bases/object-base";
import { Logger } from "@vertix.gg/base/src/modules/logger";

export class GlobalLogger extends ObjectBase {
    private static instance: Logger;

    public static getName() {
        return "VertixBot/GlobalLogger";
    }

    public static getInstance() {
        if ( !GlobalLogger.instance ) {
            const self = new GlobalLogger();
            GlobalLogger.instance = new Logger( self );
        }

        return GlobalLogger.instance;
    }

    public static get $() {
        return GlobalLogger.getInstance();
    }
}

export default GlobalLogger;
