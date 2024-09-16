// import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";
//
// import { UIEmbedWithVarsExtend } from "@vertix.gg/gui/src/ui-embed/ui-embed-with-vars";
//
// import { DynamicChannelEmbedBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-embed-base";
//
// import type { UIArgs, UIBaseTemplateOptions } from "@vertix.gg/gui/src/bases/ui-definitions";
//
// const DynamicChannelEmbedBaseWithVars = UIEmbedWithVarsExtend(DynamicChannelEmbedBase, new UIEmbedVars(
//     "separator",
//     "value",
//     "allowedUsers",
//     "allowedUsersDisplay",
//     "allowedUsersDefault",
//     "blockedUsers",
//     "blockedUsersDisplay",
//     "blockedUsersDefault",
// ) );
//
// export abstract class DynamicChannelEmbedWithUsersPermissionsBase extends DynamicChannelEmbedBaseWithVars {
//     protected getInternalOptions(): UIBaseTemplateOptions {
//         const vars = this.vars.get();
//
//         return {
//             allowedUsersDisplay: {
//                 [ vars.allowedUsersDefault ]: "Currently there are no trusted users." + "\n",
//                 [ vars.allowedUsers ]: vars.allowedUsers + "\n"
//             },
//             blockedUsersDisplay: {
//                 [ vars.blockedUsersDefault ]: "Currently there are no blocked users." + "\n",
//                 [ vars.blockedUsers ]: vars.blockedUsers + "\n"
//             },
//             ... super.getInternalOptions()
//         };
//     }
//
//     protected getArrayOptions() {
//         const { separator, value } = this.vars.get();
//
//         return {
//             allowedUsers: {
//                 format: `- <@${ value }>${ separator }`,
//                 separator: "\n",
//             },
//             blockedUsers: {
//                 format: `- <@${ value }>${ separator }`,
//                 separator: "\n",
//             }
//         };
//     }
//
//     protected getInternalLogic( args?: UIArgs ) {
//         const result: UIArgs = {};
//
//         const vars = this.vars.get();
//
//         if ( args?.allowedUsers?.length ) {
//             result.allowedUsers = args.allowedUsers?.map( ( user: any ) => user.id );
//             result.allowedUsersDisplay = vars.allowedUsers;
//         } else {
//             result.allowedUsersDisplay = vars.allowedUsersDefault;
//         }
//
//         if ( args?.blockedUsers?.length ) {
//             result.blockedUsers = args.blockedUsers?.map( ( user: any ) => user.id );
//             result.blockedUsersDisplay = vars.blockedUsers;
//         } else {
//             result.blockedUsersDisplay = vars.blockedUsersDefault;
//         }
//
//         return {
//             ... result,
//             ... super.getInternalLogic( args ),
//         };
//     }
// }
