import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

import { Button } from "@vertix.gg/flow/src/shared/components/button";
import { cn } from "@vertix.gg/flow/src/lib/utils";

interface CopyButtonProps {
    value: string;
    ariaLabel?: string;
    className?: string;
    stopPropagation?: boolean;
    size?: "icon" | "sm" | "default" | "lg";
}

// Small reusable copy-to-clipboard button used across flow panel lists
export const CopyButton: React.FC<CopyButtonProps> = ( {
    value,
    ariaLabel = "Copy to clipboard",
    className,
    stopPropagation = true,
    size = "icon",
} ) => {
    const [ isCopied, setIsCopied ] = useState( false );

    const handleCopy = async ( event: React.MouseEvent<HTMLButtonElement> ) => {
        if ( stopPropagation ) {
            event.stopPropagation();
        }
        try {
            await navigator.clipboard.writeText( value );
            setIsCopied( true );
            setTimeout( () => setIsCopied( false ), 1200 );
        } catch ( error ) {
            console.error( "Failed to copy text:", error );
        }
    };

    return (
        <Button
            variant="ghost"
            size={ size }
            className={ cn( "ml-auto", className ) }
            onClick={ handleCopy }
            aria-label={ ariaLabel }
            title={ isCopied ? "Copied!" : ariaLabel }
        >
            { isCopied ? <Check className="text-primary" /> : <Copy /> }
        </Button>
    );
};

export default CopyButton;
