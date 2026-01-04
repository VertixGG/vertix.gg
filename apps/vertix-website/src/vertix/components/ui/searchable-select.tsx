import * as React from "react";

import "./searchable-select.scss";

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
        <div className="position-relative" ref={ containerRef } style={ { width: "100%", maxWidth: "720px", margin: "0 auto 2rem auto" } }>
            <div
                className="form-control form-control-lg fs-4 py-3 rounded-4 d-flex align-items-center justify-content-between cursor-pointer bg-dark text-white border-secondary"
                onClick={ () => setIsOpen( !isOpen ) }
                style={ { cursor: "pointer" } }
            >
                <span className={ `${ showPlaceholder ? "text-secondary" : "text-white" } px-2` }>
                    { showPlaceholder ? placeholder : selectedOption?.label }
                </span>
                <div className="px-3">
                    <SearchIcon width={ 22 } height={ 22 } className="text-secondary" />
                </div>
            </div>

            { isOpen && (
                <div
                    className="position-absolute w-100 mt-1 bg-dark border border-secondary rounded-4 shadow-lg z-3"
                    style={ { zIndex: 1000, maxHeight: "300px", overflowY: "auto" } }
                >
                    <div className="p-2 border-bottom border-secondary">
                        <input
                            type="text"
                            className="form-control form-control-lg fs-4 searchable-select__search-input text-white border-secondary border-0 shadow-none w-100 bg-transparent"
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
                                    className="px-3 py-2 fs-5 cursor-pointer hover-bg-secondary text-white"
                                    style={ { cursor: "pointer" } }
                                    onClick={ () => {
                                        onSelect( option.value );
                                        setIsOpen( false );
                                        setSearchTerm( "" );
                                    } }
                                    onMouseEnter={ ( e ) => ( e.currentTarget.style.backgroundColor = "#3d4246" ) }
                                    onMouseLeave={ ( e ) => ( e.currentTarget.style.backgroundColor = "transparent" ) }
                                >
                                    { option.label }
                                </div>
                            ) )
                        ) : (
                            <div className="px-3 py-2 fs-5 text-secondary italic">No results found</div>
                        ) }
                    </div>
                </div>
            ) }
        </div>
    );
}

