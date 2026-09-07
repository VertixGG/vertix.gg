import React from "react";

interface StarLayer {
    /** Modifier suffix on `.vc-starfield__layer--`. */
    name: string;
    count: number;
    size: number;
    color: string;
    minAlpha: number;
}

const FIELD_WIDTH = 2560,
    FIELD_HEIGHT = 1600;

/* Roughly half the old star count at a third of the old alpha. The backdrop
 * behind them is no longer near-black, so the field that used to read as depth
 * reads as speckle unless it stays well under the content. */
const LAYERS: StarLayer[] = [
    { name: "far", count: 260, size: 1, color: "255, 255, 255", minAlpha: 0.08 },
    { name: "mid", count: 80, size: 2, color: "155, 238, 253", minAlpha: 0.1 },
    { name: "near", count: 18, size: 3, color: "255, 255, 255", minAlpha: 0.18 },
];

/**
 * Deterministic PRNG, so the field is identical between renders (and between
 * server and client, should this ever be pre-rendered) instead of reshuffling
 * on every mount.
 */
function createRandom( seed: number ) {
    let state = seed;

    return () => {
        state = ( state * 1664525 + 1013904223 ) % 4294967296;
        return state / 4294967296;
    };
}

/**
 * Scatters `count` dots over the field as a single box-shadow list, so a whole
 * layer of stars costs one composited element. Each star gets its own alpha so
 * the field reads as depth rather than as a grid.
 */
function buildLayerShadow( layer: StarLayer, seed: number ): string {
    const random = createRandom( seed ),
        shadows: string[] = [];

    for ( let i = 0; i < layer.count; i++ ) {
        const x = Math.round( random() * FIELD_WIDTH ),
            y = Math.round( random() * FIELD_HEIGHT ),
            alpha = ( layer.minAlpha + random() * ( 1 - layer.minAlpha ) ).toFixed( 2 );

        shadows.push( `${ x }px ${ y }px rgba(${ layer.color }, ${ alpha })` );
    }

    return shadows.join( "," );
}

export const ShinyStars: React.FC = () => {
    const layers = React.useMemo(
        () => LAYERS.map( ( layer, index ) => ( {
            ...layer,
            shadow: buildLayerShadow( layer, 0x5eed + index * 7919 ),
        } ) ),
        []
    );

    return (
        <div className="vc-starfield" aria-hidden="true">
            { layers.map( ( layer ) => (
                <div
                    key={ layer.name }
                    className={ `vc-starfield__layer vc-starfield__layer--${ layer.name }` }
                    style={ {
                        width: `${ layer.size }px`,
                        height: `${ layer.size }px`,
                        boxShadow: layer.shadow,
                    } }
                />
            ) ) }
        </div>
    );
};

export default ShinyStars;
