import {
    INDEX_PLACEHOLDER_PATTERN,
    VAR_DYNAMIC_CHANNEL_INDEX
} from "@vertix.gg/definitions/src/dynamic-channel-vars-definitions";

/**
 * Checks if a template string contains any index placeholder.
 * Supports: {index}, {{index}}, {auto-scale}, {autoscale}
 *
 * @param template - The template string to check
 * @returns true if the template contains an index placeholder
 */
export function varsHasIndexPlaceholder( template?: string | null ): boolean {
    if ( !template ) {
        return false;
    }

    return (
        template.includes( VAR_DYNAMIC_CHANNEL_INDEX ) ||
        template.includes( "{{index}}" ) ||
        template.includes( "{auto-scale}" ) ||
        template.includes( "{autoscale}" )
    );
}

/**
 * Replaces all index placeholders in a template with the given index value.
 * If no placeholder is found, appends the index with a dash separator.
 *
 * @param template - The template string containing placeholders
 * @param index - The index value to substitute
 * @returns The template with placeholders replaced by the index
 */
export function varsReplaceIndexPlaceholder( template: string, index: number ): string {
    const indexValue = String( index );

    if ( varsHasIndexPlaceholder( template ) ) {
        // Reset lastIndex since we're using a global regex
        INDEX_PLACEHOLDER_PATTERN.lastIndex = 0;
        return template.replace( INDEX_PLACEHOLDER_PATTERN, indexValue );
    }

    return `${ template }-${ indexValue }`;
}
