import React, { useEffect, useRef } from "react";

import "./shiny-stars.scss";

interface ShinyStarsProps {
    count?: number;
    minSize?: number;
    maxSize?: number;
    sensitivity?: number;
    className?: string;
}

interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    fadeSpeed: number;
    fadingIn: boolean;
}

export const ShinyStars: React.FC<ShinyStarsProps> = ( {
    count = 50,
    minSize = 2,
    maxSize = 4,
    sensitivity = 1, // now controls animation speed, default 1
    className = "",
} ) => {
    const canvasRef = useRef<HTMLCanvasElement>( null );
    const starsRef = useRef<Star[]>( [] );
    const requestRef = useRef<number>();

    useEffect( () => {
        const canvas = canvasRef.current;
        if ( ! canvas ) return;

        const ctx = canvas.getContext( "2d" );
        if ( ! ctx ) return;

        const initStars = () => {
            starsRef.current = [];
            for ( let i = 0; i < count; i++ ) {
                starsRef.current.push( createStar( canvas.width, canvas.height ) );
            }
        };

        const createStar = ( w: number, h: number ): Star => ( {
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * ( maxSize - minSize ) + minSize,
            opacity: Math.random(),
            fadeSpeed: ( Math.random() * 0.02 + 0.005 ) * sensitivity, // use sensitivity for speed
            fadingIn: Math.random() > 0.5,
        } );

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            initStars();
        };

        window.addEventListener( "resize", resize );
        resize();

        const animate = () => {
            ctx.clearRect( 0, 0, canvas.width, canvas.height );

            starsRef.current.forEach( ( star, i ) => {
                // Twinkle logic
                if ( star.fadingIn ) {
                    star.opacity += star.fadeSpeed;
                    if ( star.opacity >= 1 ) {
                        star.opacity = 1;
                        star.fadingIn = false;
                    }
                } else {
                    star.opacity -= star.fadeSpeed;
                    if ( star.opacity <= 0 ) {
                        // Respawn at new random location
                        starsRef.current[ i ] = createStar( canvas.width, canvas.height );
                        starsRef.current[ i ].opacity = 0;
                        starsRef.current[ i ].fadingIn = true;
                        return;
                    }
                }

                // Draw
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${ star.opacity })`;
                ctx.arc( star.x, star.y, star.size / 2, 0, Math.PI * 2 );
                ctx.fill();
            } );

            requestRef.current = requestAnimationFrame( animate );
        };

        requestRef.current = requestAnimationFrame( animate );

        return () => {
            window.removeEventListener( "resize", resize );
            if ( requestRef.current ) cancelAnimationFrame( requestRef.current );
        };
    }, [ count, minSize, maxSize, sensitivity ] );

    return (
        <div className={ `shiny-stars-container ${ className }` }>
            <canvas ref={ canvasRef } style={ { width: "100%", height: "100%" } } />
        </div>
    );
};

export default ShinyStars;
