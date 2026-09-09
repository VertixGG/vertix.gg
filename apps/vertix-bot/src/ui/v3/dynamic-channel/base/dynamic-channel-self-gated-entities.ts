const SELF_GATED_ENTITIES = new Set<string>();

/**
 * Function registerSelfGatedEntity() :: Declares that an entity checks for itself who may press it.
 *
 * Every adapter of a dynamic channel gates the whole panel at once - the presser must own the
 * channel they are standing in - because that is true of all but a couple of entities. Those
 * couple ask something else entirely, so they are named here and their handler takes on the
 * question instead. Held against the entity rather than against each adapter that draws it: the
 * exemption belongs to what is being pressed, and the same button appears on both the interface
 * inside a channel and the control panel beside its generator.
 *
 * Declared from the entity's own module, which the elements group loads at startup, so the set is
 * complete before any interaction can arrive.
 */
export function registerSelfGatedEntity( entityName: string ) {
    SELF_GATED_ENTITIES.add( entityName );
}

export function isSelfGatedEntity( entityName: string ) {
    return SELF_GATED_ENTITIES.has( entityName );
}
