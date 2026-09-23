import pm2 from "pm2";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import type {
    IPm2EventPacket,
    IPm2ProcessDescription,
    IProcessSupervisor
} from "@vertix.gg/watchdog/src/watchdog-definitions";

const PROCESS_EVENT = "process:event";

/**
 * The only place that knows pm2 is a callback API and that its daemon has to be connected to.
 *
 * Kept apart from the watchdog itself so the logic above can be driven by a plain object in tests -
 * pm2's client opens a socket to the daemon on `connect()`, which a unit test has no business doing.
 */
export class Pm2Supervisor extends InitializeBase implements IProcessSupervisor {
    public constructor() {
        super();
    }

    public static getName(): string {
        return "VertixWatchdog/Pm2Supervisor";
    }

    public async connect(): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            pm2.connect( ( error ) => error ? reject( error ) : resolve() );
        } );
    }

    public disconnect(): void {
        pm2.disconnect();
    }

    public async onEvent( handler: ( packet: IPm2EventPacket ) => void ): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            pm2.launchBus( ( error, bus ) => {
                if ( error ) {
                    reject( error );

                    return;
                }

                bus.on( PROCESS_EVENT, handler );

                resolve();
            } );
        } );
    }

    public async list(): Promise<IPm2ProcessDescription[]> {
        return new Promise( ( resolve, reject ) => {
            pm2.list( ( error, descriptions ) => {
                if ( error ) {
                    reject( error );

                    return;
                }

                resolve( descriptions.map( ( description ) => ( {
                    name: description.name,
                    pm_id: description.pm_id,
                    status: description.pm2_env?.status,
                    restart_time: description.pm2_env?.restart_time,
                    unstable_restarts: description.pm2_env?.unstable_restarts,
                    pm_uptime: description.pm2_env?.pm_uptime
                } ) ) );
            } );
        } );
    }

    public async restart( name: string ): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            pm2.restart( name, ( error ) => error ? reject( error ) : resolve() );
        } );
    }
}

export default Pm2Supervisor;
