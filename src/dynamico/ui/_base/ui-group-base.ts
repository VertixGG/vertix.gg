import chalk from "chalk";

import {
    CommandInteraction,
    InteractionResponse,
    MessageComponentInteraction
} from "discord.js";

import UIBase from "@dynamico/ui/_base/ui-base";

import { guiManager } from "@dynamico/managers/gui";

import { UIContinuesInteractionTypes, IUIGroupAttitude } from "@dynamico/ui/_base/ui-interfaces";

export class UIGroupBase extends UIBase {
    private static specificFlowInteraction: Map<string, any> = new Map();

    public static groups(): string[] {
        return [];
    }

    public static belongsTo(): string[] {
        return [];
    }

    public static hasMany(): string[] {
        return [];
    }

    protected getExtendedAttitude( customId: string ): null | IUIGroupAttitude {
        return null;
    }

    /**
     * Function sendContinues() :: a method that sends a continues interaction message to the user.
     * It takes an interaction object and additional arguments as input and returns a promise.
     */
    public async sendContinues( interaction: UIContinuesInteractionTypes | CommandInteraction, args: any ): Promise<InteractionResponse | void> {
        if ( ! interaction.channel ) {
            return guiManager.sendContinuesMessage( interaction, this, args );
        }

        const msgInteraction = interaction as MessageComponentInteraction,
            staticThis = this.constructor as typeof UIGroupBase;

        staticThis.debugger.log( this.sendContinues,
            `Guild id: '${ interaction.guildId }' - Sending continues interaction message to user: '${ interaction.user.username }'`
        );

        let groups = staticThis.groups(),
            belongsTo = staticThis.belongsTo(),
            customId = msgInteraction?.customId || "",
            attitude = !! ( groups.length || belongsTo.length );

        // If the component has no groups or relationship and has a customId, try to find the element via customId.
        if ( ! attitude ) {
            const extendedAttitude = this.getExtendedAttitude( customId );

            if ( extendedAttitude ) {
                attitude = true;
                groups = extendedAttitude.groups;
                belongsTo = extendedAttitude.belongsTo;
            }
        }

        if ( ! attitude ) {
            staticThis.logger.debug( this.sendContinues,
                `No groups or relationship has been found for: '${ staticThis.getName() }'`
            );
            await guiManager.sendContinuesMessage( interaction, this, args );
            return;
        } else if ( groups.length && belongsTo.length ) {
            staticThis.logger.error( this.sendContinues,
                `Guild id: '${ interaction.guildId }' - Invalid behaviour both groups and relationship has been found for: '${ staticThis.getName() }'`
            );
            await guiManager.sendContinuesMessage( interaction, this, args );
            return;
        }

        if ( belongsTo.length ) {
            let isRelated = false;

            for ( const namespace of belongsTo ) {
                const owner = guiManager.get( namespace );

                if ( ! ( owner instanceof UIGroupBase ) ) {
                    continue;
                }

                const relatedGroups = owner.getHasMany();

                if ( relatedGroups.includes( this.getName() ) ) {
                    isRelated = true;

                    // # Critical.
                    groups = owner.getGroups();

                    // Log the connection.
                    staticThis.logger.debug( this.sendContinues,
                        `Found ${ chalk.bold( "hasMany" ) } relationship between '${ staticThis.getName() }' and '${ owner.getName() }'` );

                    break;
                }
            }

            if ( ! isRelated ) {
                staticThis.logger.error( this.sendContinues,
                    `Guild id: '${ msgInteraction.guildId }' - Invalid behaviour, '${ this.getName() }' customId: '${ msgInteraction.customId }' not belonging to any group.`
                );
                staticThis.logger.error( this.sendContinues, "belongsTo", belongsTo );

                return guiManager.sendContinuesMessage( interaction, this, args );
            }
        }

        const uniqueId = groups.join() + ":" + interaction.channel.id + ":" + interaction.user.id,
            specificFlowInteraction = staticThis.specificFlowInteraction.get( uniqueId ) as InteractionResponse;

        if ( interaction.isCommand() ) {
            await specificFlowInteraction?.delete().catch( ( e ) => {
                staticThis.logger.warn( this.sendContinues, "", e );
            } );

            staticThis.specificFlowInteraction.delete( uniqueId );
        }

        if ( ! specificFlowInteraction ) {
            const newDefer = await this.sendReply( msgInteraction, args );

            if ( newDefer ) {
                staticThis.specificFlowInteraction.set( uniqueId, newDefer );
            }

            return;
        }

        const message = await this.getMessage( interaction, args );

        await specificFlowInteraction.edit( message )
            .then( () => {
                msgInteraction.deferUpdate?.().catch( ( e ) => {
                    staticThis.logger.warn( this.sendContinues, "", e );
                } );
            } )
            .catch( ( e ) => {
                staticThis.logger.warn( this.sendContinues, "", e );

                staticThis.specificFlowInteraction.delete( uniqueId );

                return this.sendContinues( interaction, args );
            } );
    }

    public getGroups(): string[] {
        return ( this.constructor as typeof UIGroupBase ).groups();
    }

    public getBelongsTo(): string[] {
        return ( this.constructor as typeof UIGroupBase ).belongsTo();
    }

    public getHasMany(): string[] {
        return ( this.constructor as typeof UIGroupBase ).hasMany();
    }
}

export default UIGroupBase;
