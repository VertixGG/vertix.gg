import "@vertix.gg/discord-ui/src/styles/discord-role-select-dropdown.css";

export interface DiscordRoleItem {
    name: string;
    memberCount?: number;
    color?: string;
    selected?: boolean;
}

export interface DiscordRoleSelectDropdownProps {
    roles: ReadonlyArray<DiscordRoleItem>;
}

export function DiscordRoleSelectDropdown( { roles }: DiscordRoleSelectDropdownProps ) {
    return (
        <div className="discord-role-select-dropdown">
            { roles.map( ( role, index ) => (
                <div key={ index } className="discord-role-select-item">
                    <div
                        className="discord-role-select-indicator"
                        style={ { backgroundColor: role.color || "#99aab5" } }
                    />
                    <div className="discord-role-select-content">
                        <span className="discord-role-select-name">{ role.name }</span>
                        { role.memberCount !== undefined && (
                            <span className="discord-role-select-count">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                    <path d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.795 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598ZM2 19.006C2 15.473 5.29 13.006 10 13.006C14.711 13.006 18 15.473 18 19.006V20.006H2V19.006Z"/>
                                </svg>
                                { role.memberCount }
                            </span>
                        ) }
                    </div>
                    <div className={ `discord-role-select-checkbox ${ role.selected ? "selected" : "" }` }>
                        { role.selected && (
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
