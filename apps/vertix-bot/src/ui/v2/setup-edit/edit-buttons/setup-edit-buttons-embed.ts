import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-button-base";

const vars = {
    index: uiUtilsWrapAsTemplate( "index" ),
    masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),
    roleId: uiUtilsWrapAsTemplate( "roleId" ),

    scopeDisplay: uiUtilsWrapAsTemplate( "scopeDisplay" ),
    scopeDefault: uiUtilsWrapAsTemplate( "scopeDefault" ),
    scopeDefaultVerified: uiUtilsWrapAsTemplate( "scopeDefaultVerified" ),
    verifiedRolesList: uiUtilsWrapAsTemplate( "verifiedRolesList" ),
    scopeRoleOwn: uiUtilsWrapAsTemplate( "scopeRoleOwn" ),
    scopeRoleNew: uiUtilsWrapAsTemplate( "scopeRoleNew" ),
    scopeRoleMissing: uiUtilsWrapAsTemplate( "scopeRoleMissing" ),
    panelNote: uiUtilsWrapAsTemplate( "panelNote" ),

    listHeadingDisplay: uiUtilsWrapAsTemplate( "listHeadingDisplay" ),
    listDefault: uiUtilsWrapAsTemplate( "listDefault" ),
    listRoleOwn: uiUtilsWrapAsTemplate( "listRoleOwn" ),
    listRoleNew: uiUtilsWrapAsTemplate( "listRoleNew" ),

    buttonsList: uiUtilsWrapAsTemplate( "buttonsList" ),
    buttonsNone: uiUtilsWrapAsTemplate( "buttonsNone" ),

    rosterHeading: uiUtilsWrapAsTemplate( "rosterHeading" ),
    rosterButtonsWord: uiUtilsWrapAsTemplate( "rosterButtonsWord" ),
    rosterDisplay: uiUtilsWrapAsTemplate( "rosterDisplay" ),
    rosterNone: uiUtilsWrapAsTemplate( "rosterNone" ),
    rosterOne: uiUtilsWrapAsTemplate( "rosterOne" ),
    rosterMany: uiUtilsWrapAsTemplate( "rosterMany" ),
    rosterList: uiUtilsWrapAsTemplate( "rosterList" ),
    rosterMore: uiUtilsWrapAsTemplate( "rosterMore" ),
    rosterMoreCount: uiUtilsWrapAsTemplate( "rosterMoreCount" ),

    hintDisplay: uiUtilsWrapAsTemplate( "hintDisplay" ),
    hintDefault: uiUtilsWrapAsTemplate( "hintDefault" ),
    hintRoleOwn: uiUtilsWrapAsTemplate( "hintRoleOwn" ),
    hintRoleNew: uiUtilsWrapAsTemplate( "hintRoleNew" ),
    hintEveryone: uiUtilsWrapAsTemplate( "hintEveryone" ),
    hintPushed: uiUtilsWrapAsTemplate( "hintPushed" )
};

const ROSTER_LIMIT = 15;

const SetupEditButtonsEmbed = new EmbedBuilder<UIArgs, typeof vars>( "VertixBot/UI-V2/SetupEditButtonsEmbed", vars )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( v ) => `🎚  Buttons Of Master Channel #${ v.index }` )
    .setDescription( ( v ) =>
        `${ v.scopeDisplay }\n\n` +
        `${ v.listHeadingDisplay }\n${ v.buttonsList }\n\n` +
        `${ v.rosterHeading }\n${ v.rosterDisplay }\n\n` +
        v.hintDisplay
    )
    .setFooterText( () =>
        "Every pick is saved straight away. Channels that are already open keep their buttons " +
        "until you press Update Existing Channels."
    )
    .setOptions( ( v ) => ( {
        buttonsNone: "> - *None. Owners would see a panel with no buttons on it.*",

        rosterHeading: "**Roles with buttons of their own**",

        rosterButtonsWord: "Buttons",

        panelNote: "Role sets reach only the panel inside the voice channel. A **control-panel** channel always shows the default set.",

        rosterMore: `> - *… and ${ v.rosterMoreCount } more. Every one of them is in the top menu.*`,

        scopeDisplay: {
            [ v.scopeDefault ]:
                `**You are editing the default buttons of <#${ v.masterChannelId }>.**\n` +
                "Whoever owns a channel created here sees these buttons — unless they have one of " +
                "the roles listed further down, which replaces this set for them.",
            [ v.scopeDefaultVerified ]:
                `**You are editing the default buttons of <#${ v.masterChannelId }>.**\n` +
                `Only ${ v.verifiedRolesList } can open a channel here, so these are the buttons ` +
                "their owners see — unless they also have one of the roles listed further down, " +
                "which replaces this set for them.",
            [ v.scopeRoleOwn ]:
                `**You are editing the buttons for <@&${ v.roleId }>.**\n` +
                "An owner who has this role sees these buttons **instead of** the default set. " +
                "Every other owner keeps the default set, and it is not changed.\n" +
                v.panelNote,
            [ v.scopeRoleNew ]:
                `**<@&${ v.roleId }> has no buttons of its own yet.**\n` +
                "Its owners follow the default set, which is what is ticked in the button menu " +
                "right now. Tick or untick anything and this role gets a set of its own from that " +
                "moment on — the default set stays exactly as it is.\n" +
                v.panelNote,
            [ v.scopeRoleMissing ]:
                "**This role no longer exists on this server.**\n" +
                "Nobody can have it, so its saved buttons never reach anyone. Press " +
                "**Use The Default For This Role** to clear it away."
        },

        listHeadingDisplay: {
            [ v.listDefault ]: "**On every panel**",
            [ v.listRoleOwn ]: "**On the panel of an owner who has this role**",
            [ v.listRoleNew ]: "**The default set — change it here to turn it into this role's own set**"
        },

        rosterDisplay: {
            [ v.rosterNone ]:
                "> - *None yet. Every owner gets the default set.*\n" +
                "> - *For example: let one role claim and reset channels while everyone else can only rename.*",
            [ v.rosterOne ]: v.rosterList,
            [ v.rosterMany ]:
                `${ v.rosterList }\nAn owner who has two of these roles gets the set of whichever ` +
                "role sits higher in **Server Settings → Roles**."
        },

        hintDisplay: {
            [ v.hintDefault ]:
                "To give one role a different set, pick it in **➕ Give a role its own buttons**.",
            [ v.hintRoleOwn ]:
                "**Use The Default For This Role** deletes this set and puts its owners back on the default one.",
            [ v.hintRoleNew ]:
                "Nothing is saved for this role until you change a button.",
            [ v.hintEveryone ]:
                "⚠️ **@everyone** cannot have a set of its own — every member has that role, so its " +
                "set would replace the default one for every single owner. Edit the default set " +
                "instead, or pick a narrower role.",
            [ v.hintPushed ]:
                "✅ Sent to every channel this master channel has open. Each one now shows the set " +
                "its own owner should get."
        }
    } ) )
    .setArrayOptions( () => {
        // Built from the group rather than written out, because a V2 button is identified by a
        // number and a list keyed by hand drifts the moment the set changes.
        const options: Record<string, string> = {};

        DynamicChannelElementsGroup.getAll().forEach( ( item: DynamicChannelButtonBase ) => {
            options[ item.getId() ] = item.getLabelForEmbed();
        } );

        return {
            buttonsList: {
                format: "> - {value}{separator}",
                separator: "\n",
                options
            }
        };
    } )
    .setLogic( ( args, v ) => {
        const roleId = ( args.dynamicChannelButtonsRoleId as string | null | undefined ) ?? null,
            notice = ( args.dynamicChannelButtonsNotice as string | null | undefined ) ?? null,
            selected = ( args.dynamicChannelButtonsTemplate as string[] | undefined ) ?? [],
            byRole = ( args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> | undefined ) ?? {},
            meta = ( args.dynamicChannelButtonsRoleMeta as { id: string; name: string; position: number }[] | undefined ) ?? [];

        const known = new Set( meta.map( ( role ) => role.id ) ),
            hasOwnSet = Boolean( roleId ) && Boolean( byRole[ roleId as string ]?.length ),
            isMissingRole = Boolean( roleId ) && ! known.has( roleId as string );

        // A count rather than the buttons themselves: an emoji token is around thirty six
        // characters, so a roster of them reaches several kilobytes and discord rejects the whole
        // message rather than trimming it.
        const total = DynamicChannelElementsGroup.getAll().length,
            rosterIds = Object.keys( byRole ).filter( ( id ) => byRole[ id ]?.length );

        rosterIds.sort( ( a, b ) => {
            const roleA = meta.find( ( role ) => role.id === a ),
                roleB = meta.find( ( role ) => role.id === b );

            if ( ! roleA !== ! roleB ) {
                return roleA ? 1 : -1;
            }

            return ( roleB?.position ?? 0 ) - ( roleA?.position ?? 0 );
        } );

        const shown = rosterIds.slice( 0, ROSTER_LIMIT ),
            remaining = rosterIds.length - shown.length;

        const rosterLines = shown.map(
            ( id ) => `> - <@&${ id }> — ${ v.rosterButtonsWord }: ${ byRole[ id ].length } / ${ total }`
        );

        if ( remaining > 0 ) {
            rosterLines.push( v.rosterMore );
        }

        // Only the verified roles can open a channel here, so "everyone" would be a lie whenever
        // the audience is narrower than the server.
        const verifiedRoles = ( args.dynamicChannelVerifiedRoles as string[] | undefined ) ?? [],
            isEveryoneAudience = Boolean( args.dynamicChannelIncludeEveryoneRole ) || ! verifiedRoles.length;

        let scopeDisplay: string = isEveryoneAudience ? v.scopeDefault : v.scopeDefaultVerified,
            listHeadingDisplay: string = v.listDefault,
            hintDisplay: string = v.hintDefault;

        if ( roleId ) {
            scopeDisplay = isMissingRole ? v.scopeRoleMissing : ( hasOwnSet ? v.scopeRoleOwn : v.scopeRoleNew );
            listHeadingDisplay = hasOwnSet || isMissingRole ? v.listRoleOwn : v.listRoleNew;
            hintDisplay = hasOwnSet || isMissingRole ? v.hintRoleOwn : v.hintRoleNew;
        }

        // The notice replaces the closing line for one render. It has to be set on every handler,
        // because args merge per key and a value left behind would pin the notice to the screen.
        if ( "everyone" === notice ) {
            hintDisplay = v.hintEveryone;
        } else if ( "pushed" === notice ) {
            hintDisplay = v.hintPushed;
        }

        let rosterDisplay: string = v.rosterNone;

        if ( rosterIds.length > 1 ) {
            rosterDisplay = v.rosterMany;
        } else if ( rosterIds.length ) {
            rosterDisplay = v.rosterOne;
        }

        return {
            index: ( args.index as number || 0 ) + 1,
            masterChannelId: ( args.masterChannelId as string | undefined ) ?? "",
            roleId: roleId ?? "",
            scopeDisplay,
            verifiedRolesList: verifiedRoles.map( ( id ) => `<@&${ id }>` ).join( ", " ),
            listHeadingDisplay,
            // The array form lets the translated button names apply. An empty one would render as
            // a blank line, so the guard sentence is passed as a plain string instead.
            buttonsList: selected.length ? selected : v.buttonsNone,
            rosterHeading: v.rosterHeading,
            rosterDisplay,
            rosterList: rosterLines.join( "\n" ),
            rosterMoreCount: remaining,
            hintDisplay
        };
    } )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

export { SetupEditButtonsEmbed };
