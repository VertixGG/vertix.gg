/**
 * What pm2 hands a bus subscriber, narrowed to the fields read here.
 *
 * `packet.process` is a clone of the app's `pm2_env` with `env` removed - pm2's `Utility.formatCLU`
 * builds it that way - so it carries far more than this. Stating only what is read keeps the
 * watchdog answerable for fields pm2 actually guarantees, rather than for a shape copied whole out
 * of one version's internals.
 */
export interface IPm2ProcessDescription {
    name?: string;
    pm_id?: number;
    status?: string;
    exit_code?: number;
    restart_time?: number;
    unstable_restarts?: number;
    pm_uptime?: number;
}

export interface IPm2EventPacket {
    event?: string;
    manually?: boolean;
    process?: IPm2ProcessDescription;
    at?: number;
}

/**
 * The pm2 surface the watchdog needs, named as an interface so the logic can be tested without a
 * daemon. The adapter over the real client is the only thing that knows pm2 is a callback API.
 */
export interface IProcessSupervisor {
    onEvent( handler: ( packet: IPm2EventPacket ) => void ): Promise<void>;

    list(): Promise<IPm2ProcessDescription[]>;

    restart( name: string ): Promise<void>;
}

export type TCrashAlertKind = "down" | "gave-up" | "revived" | "recovered";

export interface ICrashAlert {
    kind: TCrashAlertKind;
    app: string;
    detail: string;
    status?: string;
    exitCode?: number;
    restarts?: number;
    suppressedRepeats?: number;
}

export interface IAlertReporter {
    report( alert: ICrashAlert ): Promise<void>;

    flush(): Promise<void>;
}
