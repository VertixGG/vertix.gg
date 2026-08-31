import * as React from "react";

function SearchIcon( props: React.ComponentProps<"svg"> ) {
    return (
        <svg
            { ...props }
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={ 2 }
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}

export interface SearchableSelectOption {
    label: string;
    value: string;
}

export interface SearchableSelectProps {
    options: SearchableSelectOption[];
    onSelect: ( value: string ) => void;
    placeholder?: string;
    value?: string;
    defaultValue?: string;
}

export default function SearchableSelect( {
    options,
    onSelect,
    placeholder = "Search...",
    value,
    defaultValue,
}: SearchableSelectProps ) {
    const [ searchTerm, setSearchTerm ] = React.useState( "" );
    const [ isOpen, setIsOpen ] = React.useState( false );
    const containerRef = React.useRef<HTMLDivElement>( null );

    const filteredOptions = options.filter( ( option ) =>
        option.label.toLowerCase().includes( searchTerm.toLowerCase() )
    );

    const selectedOption = options.find( ( o ) => o.value === value );
    const showPlaceholder = !selectedOption || selectedOption.value === defaultValue;

    React.useEffect( () => {
        const handleClickOutside = ( event: MouseEvent ) => {
            if ( containerRef.current && !containerRef.current.contains( event.target as Node ) ) {
                setIsOpen( false );
            }
        };

        document.addEventListener( "mousedown", handleClickOutside );
        return () => document.removeEventListener( "mousedown", handleClickOutside );
    }, [] );

    return (
        <div className="relative mx-auto mb-8 w-full max-w-[720px]" ref={ containerRef }>
            <div
                className="flex cursor-pointer items-center justify-between rounded-2xl border
                    border-vc-hairline-bright bg-vc-space/80 py-4 text-h4 backdrop-blur-sm
                    transition-colors hover:border-vc-cyan/50"
                onClick={ () => setIsOpen( !isOpen ) }
            >
                <span className={ `px-4 ${ showPlaceholder ? "text-vc-ice-dim" : "text-vc-starlight" }` }>
                    { showPlaceholder ? placeholder : selectedOption?.label }
                </span>
                <div className="px-4">
                    <SearchIcon width={ 22 } height={ 22 } className="text-vc-ice-dim" />
                </div>
            </div>

            { isOpen && (
                <div
                    className="absolute z-[1000] mt-1 max-h-[300px] w-full overflow-y-auto
                        rounded-2xl border border-vc-hairline-bright bg-vc-surface/95 shadow-lg
                        backdrop-blur-lg"
                >
                    <div className="border-b border-vc-hairline-bright p-2">
                        <input
                            type="text"
                            className="w-full border-0 bg-transparent px-2 py-1 text-h4
                                text-vc-starlight shadow-none outline-none
                                placeholder:text-vc-ice-dim focus:outline-none"
                            placeholder="Type to search..."
                            autoFocus
                            value={ searchTerm }
                            onChange={ ( e ) => setSearchTerm( e.target.value ) }
                            onClick={ ( e ) => e.stopPropagation() }
                        />
                    </div>
                    <div className="py-1">
                        { filteredOptions.length > 0 ? (
                            filteredOptions.map( ( option ) => (
                                <div
                                    key={ option.value }
                                    className="cursor-pointer px-4 py-2 text-h5 text-vc-ice
                                        transition-colors hover:bg-vc-cyan/10 hover:text-vc-cyan"
                                    onClick={ () => {
                                        onSelect( option.value );
                                        setIsOpen( false );
                                        setSearchTerm( "" );
                                    } }
                                >
                                    { option.label }
                                </div>
                            ) )
                        ) : (
                            <div className="px-4 py-2 text-h5 text-vc-ice-dim italic">No results found</div>
                        ) }
                    </div>
                </div>
            ) }
        </div>
    );
}

