import ObjectBase from "./object-base";

import Logger from "../modules/logger";

export abstract class InitializeBase extends ObjectBase {
    protected logger: Logger;

    protected constructor() {
        super();

        this.logger = new Logger( this );

        this.initialize && this.initialize();
    }

    protected initialize?(): void;

    // TODO: Find better place for this
    protected debounce( func: Function, delay: number ) {
        let timeoutId: NodeJS.Timeout;

        return ( ... args: any ) => {
            clearTimeout( timeoutId );

            timeoutId = setTimeout( () => {
                func.apply( this, args );
            }, delay );
        };
    }
}
