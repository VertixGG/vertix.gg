import { useState } from "react";

import { useCommand } from "@zenflux/react-commander/hooks";

import { AlertTriangle, Gamepad2, Settings, Trash2 } from "lucide-react";

import { DiscordButton } from "@vertix.gg/discord-ui/src";

import { SettingRow, SettingsGroup } from "@vertix.gg/dashboard/src/features/generators/components/settings-list";

import type { GuildDiscordOptions, LobbyMasterChannelInfo } from "@vertix.gg/dashboard/src/features/generators/types";

export interface LobbyDetailsPanelProps {
    master: LobbyMasterChannelInfo;
    discordOptions: GuildDiscordOptions | null;
    isSaving: boolean;
}

/**
 * A team lobby, as the list knows it.
 *
 * Its hosts are named from `/setup` in Discord and its splits are run from the panel in its panel
 * channel, so this says how it stands and offers the one thing left to do from here - deleting it.
 */
export function LobbyDetailsPanel( { master, discordOptions, isSaving }: LobbyDetailsPanelProps ) {
    const [ showDeleteConfirm, setShowDeleteConfirm ] = useState( false );

    const deleteLobbySetup = useCommand( "Dashboard/Generators/DeleteLobbySetup" );

    // Named off the server's roles once they are loaded; a role nobody can name is shown by its id.
    const hosts = master.hostRoleIds.length
        ? master.hostRoleIds
            .map( ( roleId ) => discordOptions?.roles.find( ( role ) => role.id === roleId )?.name ?? roleId )
            .join( ", " )
        : "Anyone in the lobby";

    const split = master.lobbyRoomsCount
        ? `Split into ${ master.lobbyRoomsCount } ${ 1 === master.lobbyRoomsCount ? "room" : "rooms" }`
        : "Not split - everyone is in the lobby";

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-border">
                <div className="max-w-4xl w-full px-6 py-4 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-5 h-5 text-warning" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-text-primary truncate">Team Lobby</h2>
                        <p className="text-sm text-text-secondary mb-0 truncate">
                            <span title={ master.channelId }>{ master.channelId }</span>
                            { " · " }
                            { split }
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl w-full px-6 py-6 space-y-6">
                    <section className="bg-surface border border-border rounded-lg">
                        <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
                            <h3 className="text-sm font-medium text-text-primary flex items-center gap-2 mb-0">
                                <Settings className="w-4 h-4 text-accent-muted" />
                                Configuration
                            </h3>
                        </header>

                        <div className="p-4 space-y-4">
                            <SettingsGroup title="Lobby">
                                <SettingRow label="Channel ID" value={ master.channelId } mono />
                                <SettingRow label="Hosts" value={ hosts } />
                                <SettingRow label="Right now" value={ split } />
                                <SettingRow label="Created" value={ new Date( master.createdAt ).toLocaleDateString() } />
                            </SettingsGroup>

                            <p className="text-sm text-text-muted mb-0">
                                Name its hosts from
                                <code className="text-text-secondary"> /setup </code>
                                in Discord. Splitting and calling everyone back are done from the panel in its
                                read-only panel channel, beside the lobby.
                            </p>
                        </div>
                    </section>

                    <section className="border border-error/30 rounded-lg px-4 py-3">
                        { showDeleteConfirm ? (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-start gap-2 min-w-0">
                                    <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                                    <p className="text-sm text-text-secondary mb-0">
                                        This removes the lobby, its panel channel and any rooms it is split into
                                        from Discord.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <DiscordButton
                                        variant="danger"
                                        size="sm"
                                        onClick={ () => deleteLobbySetup.run( { masterChannelId: master.id } ) }
                                        disabled={ isSaving }
                                    >
                                        Delete everything
                                    </DiscordButton>
                                    <DiscordButton
                                        size="sm"
                                        onClick={ () => setShowDeleteConfirm( false ) }
                                        disabled={ isSaving }
                                    >
                                        Cancel
                                    </DiscordButton>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="text-sm text-text-muted">
                                    Deleting the setup removes the lobby, its panel channel and its rooms from Discord.
                                </span>
                                <DiscordButton
                                    variant="danger"
                                    size="sm"
                                    className="shrink-0"
                                    onClick={ () => setShowDeleteConfirm( true ) }
                                    icon={ <Trash2 className="w-4 h-4" /> }
                                >
                                    Delete setup
                                </DiscordButton>
                            </div>
                        ) }
                    </section>
                </div>
            </div>
        </div>
    );
}

export default LobbyDetailsPanel;
