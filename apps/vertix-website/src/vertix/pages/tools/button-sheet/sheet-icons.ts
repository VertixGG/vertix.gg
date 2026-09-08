const BASE_NAME = /([^/]+)\.svg$/;

/**
 * The bot's own emoji artwork, keyed by the base name the bot registers it under - the same name
 * that comes back inside `<emoji name='...'>` in the UI export.
 *
 * Discovered rather than listed, so a button the bot gains only needs its svg dropped into
 * `assets/svg`. The api resolves the same files off disk by name; listing them here by hand would
 * have meant the page quietly lacking an icon the endpoint already had.
 */
const ICON_SOURCE: Readonly<Record<string, string>> = Object.fromEntries(
    Object.entries(
        import.meta.glob<string>( "@assets/svg/*.svg", { query: "?raw", import: "default", eager: true } )
    ).flatMap( ( [ path, source ] ) => {
        const name = BASE_NAME.exec( path )?.[ 1 ];

        return name ? [ [ name, source ] as [ string, string ] ] : [];
    } )
);

/**
 * Function iconSource() :: The artwork as raw svg markup.
 *
 * The sheet inlines each icon into one document rather than referencing it, so what is wanted here
 * is the markup itself. The files share element ids between them - a hundred of them across the
 * set - so the caller is responsible for namespacing before they meet, see `inlineIcon` in
 * `sheet-svg`.
 */
export function iconSource( baseName: string ): string | null {
    return ICON_SOURCE[ baseName ] ?? null;
}
