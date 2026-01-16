import "@vertix.gg/discord-ui/src/styles/discord-select-menu-dropdown.css";

export interface DiscordSelectMenuOption {
    icon?: string;
    iconEmoji?: string;
    label: string;
    description?: string;
    selected?: boolean;
    highlighted?: boolean;
}

export interface DiscordSelectMenuDropdownProps {
    options: ReadonlyArray<DiscordSelectMenuOption>;
    absolute?: boolean;
}

export function DiscordSelectMenuDropdown( { options, absolute = false }: DiscordSelectMenuDropdownProps ) {
    const className = absolute
        ? "discord-select-menu-dropdown discord-select-menu-dropdown-absolute"
        : "discord-select-menu-dropdown";

    return (
        <div className={ className }>
            { options.map( ( option, index ) => (
                <div
                    key={ index }
                    className={ `discord-select-menu-dropdown-item ${ option.selected ? "selected" : "" } ${ option.highlighted ? "highlighted" : "" }` }
                >
                    <div className="discord-select-menu-dropdown-icon">
                        { option.iconEmoji ? (
                            <span className="discord-select-menu-dropdown-emoji">{ option.iconEmoji }</span>
                        ) : option.icon ? (
                            <img src={ option.icon } alt="" />
                        ) : null }
                    </div>
                    <div className="discord-select-menu-dropdown-content">
                        <div className="discord-select-menu-dropdown-label">{ option.label }</div>
                        { option.description && (
                            <div className="discord-select-menu-dropdown-description">{ option.description }</div>
                        ) }
                    </div>
                    <div className={ `discord-select-menu-dropdown-checkbox ${ option.selected ? "checked" : "" }` }>
                        { option.selected && (
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
