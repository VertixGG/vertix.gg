import { ObjectBase } from "@vertix.gg/base/src/bases/object-base";

import { Logger } from "@vertix.gg/base/src/modules/logger";

export abstract class ServiceBase extends ObjectBase {
    protected logger: Logger;

    private readonly initialization: {
        promise: Promise<void>,
        state: "pending" | "resolved" | "rejected",
        reason?: Error,
    };

    public static getName(): string {
        return "VertixBase/Modules/ServiceBase";
    }

    public constructor() {
        super();

        this.logger = new Logger( this );

        if ( this.initialize ) {
            this.initialization = {
                promise: this.initialize(),
                state: "pending",
            };

            this.initialization.promise
                .then( () => this.initialization.state = "resolved" )
                .catch( reason => {
                    this.initialization.state = "rejected";
                    this.initialization.reason = reason;
                } );

            return;
        }

        this.initialization = {
            promise: Promise.resolve(),
            state: "resolved",
        };
    }

    protected async initialize?(): Promise<void>;

    public isWithDependencies() {
        return false;
    }

    public getInitialization() {
        return this.initialization;
    }
}
