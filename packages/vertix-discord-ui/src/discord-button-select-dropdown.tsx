import "@vertix.gg/discord-ui/src/styles/discord-button-select-dropdown.css";

export interface DiscordButtonSelectItem {
    label: string;
    emoji?: string;
    checked?: boolean;
    highlighted?: boolean;
}

export interface DiscordButtonSelectDropdownProps {
    items: ReadonlyArray<DiscordButtonSelectItem>;
}

export function DiscordButtonSelectDropdown( { items }: DiscordButtonSelectDropdownProps ) {
    return (
        <div className="discord-button-select-dropdown">
            { items.map( ( item, index ) => (
                <div
                    key={ index }
                    className={ `discord-button-select-item ${ item.highlighted ? "highlighted" : "" }` }
                >
                    <div className="discord-button-select-content">
                        { item.emoji && (
                            <span className="discord-button-select-emoji">{ item.emoji }</span>
                        ) }
                        <span className="discord-button-select-label">{ item.label }</span>
                    </div>
                    <div className={ `discord-button-select-checkbox ${ item.checked ? "checked" : "" }` }>
                        { item.checked && (
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.99991 16.17L4.82991 12L3.40991 13.41L8.99991 19L20.9999 7L19.5899 5.59L8.99991 16.17Z"/>
                            </svg>
                        ) }
                    </div>
                </div>
            ) ) }
        </div>
    );
}
