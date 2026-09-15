import type { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

/**
 * Function instantiateEmbed() :: Builds one of the embeds `EmbedBuilder` produced.
 *
 * Two things stand between a spec and an instance, and neither is about the embed itself:
 * `EmbedBuilder.build()` is typed as handing back `typeof UIEmbedBase`, which is abstract - true of
 * the base, not of the concrete class it actually returns - and a component hands its embeds back
 * untyped, so reading one out of `getEmbeds()` gives `unknown`.
 *
 * Both are cast here, once, rather than in every spec that wants to build an embed and look at it.
 */
export function instantiateEmbed( Embed: unknown ): UIEmbedBase {
    return new ( Embed as new() => UIEmbedBase )();
}
