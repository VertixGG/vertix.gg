import { performance } from "node:perf_hooks";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { UILanguageManagerInterface } from "@vertix.gg/gui/src/interfaces/language-manager-interface";
import type { ICustomizationProvider } from "@vertix.gg/gui/src/customization/customization-provider";

/**
 * Stands in for one kind of I/O the GUI waits on - a language lookup, a customization lookup - and
 * answers three questions about it: how often it was asked, how many of those asks were waiting at
 * the same moment, and how long each one is made to take.
 *
 * The middle one is what the wall clock alone cannot say. A build that asks twelve times with at
 * most one ask in flight pays twelve round trips back to back; the same twelve asked together pay
 * one. `maxInFlight` tells the two apart without depending on how fast the machine running the test
 * is, which is what makes it safe to assert on.
 */
export class PerformanceProbe {
    public calls = 0;
    public maxInFlight = 0;

    private inFlight = 0;

    public constructor( public readonly name: string, public latencyMs = 0 ) {}

    public async around<T>( work: () => Promise<T> | T ): Promise<T> {
        this.calls++;
        this.inFlight++;
        this.maxInFlight = Math.max( this.maxInFlight, this.inFlight );

        try {
            if ( this.latencyMs > 0 ) {
                await new Promise( ( resolve ) => setTimeout( resolve, this.latencyMs ) );
            }

            return await work();
        } finally {
            this.inFlight--;
        }
    }

    public reset() {
        this.calls = 0;
        this.maxInFlight = 0;
        this.inFlight = 0;
    }
}

/**
 * The language manager the bot registers answers from memory, so on its own it is cheap - but it
 * is awaited once per entity, one entity after another, and whatever it costs is paid that many
 * times in a row. Answering with the entity's own content keeps the build honest without language
 * files.
 */
export function createProbedLanguageManager( probe: PerformanceProbe ): UILanguageManagerInterface {
    return {
        getButtonTranslatedContent: ( button ) => probe.around( () => button.getTranslatableContent() ),
        getSelectMenuTranslatedContent: ( menu ) => probe.around( () => menu.getTranslatableContent() ),
        getTextInputTranslatedContent: ( input ) => probe.around( () => input.getTranslatableContent() ),
        getEmbedTranslatedContent: ( embed ) => probe.around( () => embed.getTranslatableContent() ),
        getMarkdownTranslatedContent: ( markdown ) => probe.around( () => markdown.getTranslatableContent() ),
        getModalTranslatedContent: ( modal ) => probe.around( () => modal.getTranslatableContent() ),
        register: async() => {}
    };
}

/**
 * The bot's provider is `GuildCustomizationManager`, which reads the database on a cache miss. The
 * target is recorded as well as counted, because the number that matters is how many of the asks
 * were for the same thing - those are the ones a build could have asked once.
 */
export function createProbedCustomizationProvider( probe: PerformanceProbe ) {
    const targets: string[] = [];

    const provider: ICustomizationProvider = {
        getComponentCustomization: ( guildId, target ) => probe.around( () => {
            targets.push( JSON.stringify( { guildId, ...target } ) );

            return null;
        } ),
        getGuildCustomizations: () => probe.around( () => [] )
    };

    return {
        provider,
        targets,
        distinctTargets: () => new Set( targets ).size
    };
}

/**
 * Puts the probed language manager and customization provider behind the mocked `UIService`, which
 * is where every entity reaches for them. Call after `TestWithServiceLocatorMock.withUIServiceMock()`.
 */
export function installProbes( options: { languageLatencyMs?: number; customizationLatencyMs?: number } = {} ) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );

    const language = new PerformanceProbe( "language", options.languageLatencyMs ?? 0 ),
        customization = new PerformanceProbe( "customization", options.customizationLatencyMs ?? 0 ),
        customizationProvider = createProbedCustomizationProvider( customization );

    uiService.registerUILanguageManager( createProbedLanguageManager( language ) );
    uiService.registerCustomizationProvider( customizationProvider.provider );

    return {
        language,
        customization,
        customizationTargets: customizationProvider,
        reset() {
            language.reset();
            customization.reset();
            customizationProvider.targets.length = 0;
        }
    };
}

export interface PerformanceSample {
    iterations: number;
    totalMs: number;
    perOpMs: number;
}

/**
 * Runs `work` a few times unmeasured, so module loading and the JIT are not billed to it, then the
 * requested number of times back to back.
 */
export async function measure( work: () => Promise<unknown> | unknown, iterations: number, warmup = 5 ): Promise<PerformanceSample> {
    for ( let i = 0; i < warmup; i++ ) {
        await work();
    }

    const start = performance.now();

    for ( let i = 0; i < iterations; i++ ) {
        await work();
    }

    const totalMs = performance.now() - start;

    return { iterations, totalMs, perOpMs: totalMs / iterations };
}

/**
 * Collects rows across a spec and prints them once at the end, so a run leaves a readable table of
 * where the time went instead of numbers scattered through the output. Set `VERTIX_PERF_QUIET=1`
 * to keep it out of CI logs.
 */
export class PerformanceReport {
    private rows: Record<string, string | number>[] = [];

    public constructor( private readonly title: string ) {}

    public add( row: Record<string, string | number> ) {
        this.rows.push( row );
    }

    public print() {
        if ( process.env.VERTIX_PERF_QUIET || !this.rows.length ) {
            return;
        }

        console.log( `\n${ this.title }` );
        console.table( this.rows );
    }
}

export function round( value: number, digits = 3 ) {
    const factor = 10 ** digits;

    return Math.round( value * factor ) / factor;
}
