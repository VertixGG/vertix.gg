import "@vertix.gg/discord-ui/src/styles/discord-command-suggestion.css";

export interface DiscordCommandSuggestionItem {
    command: string;
    description: string;
    botName?: string;
    botAvatar?: string;
}

export interface DiscordCommandSuggestionProps {
    searchTerm: string;
    items: ReadonlyArray<DiscordCommandSuggestionItem>;
}

export function DiscordCommandSuggestion( { searchTerm, items }: DiscordCommandSuggestionProps ) {
    return (
        <div className="discord-command-suggestion">
            <div className="discord-command-suggestion-header">
                COMMANDS MATCHING { searchTerm }
            </div>
            <div className="discord-command-suggestion-list">
                { items.map( ( item, index ) => (
                    <div key={ index } className="discord-command-suggestion-item">
                        <div className="discord-command-suggestion-icon">
                            { item.botAvatar ? (
                                <img src={ item.botAvatar } alt={ item.botName } />
                            ) : (
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                                </svg>
                            ) }
                        </div>
                        <div className="discord-command-suggestion-content">
                            <div className="discord-command-suggestion-name">{ item.command }</div>
                            <div className="discord-command-suggestion-description">{ item.description }</div>
                        </div>
                        { item.botName && (
                            <div className="discord-command-suggestion-bot">{ item.botName }</div>
                        ) }
                    </div>
                ) ) }
            </div>
        </div>
    );
}
