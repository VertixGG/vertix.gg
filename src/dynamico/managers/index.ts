import CategoryManager from "@dynamico/managers/category";
import ChannelDataManager from "@dynamico/managers/channel-data";
import ChannelManager from "@dynamico/managers/channel";
import DMManager from "@dynamico/managers/dm-manager";
import DynamicoManager from "@dynamico/managers/dynamico";
import GuildDataManager from "@dynamico/managers/guild-data";
import GuildManager from "@dynamico/managers/guild";
import GUIManager from "@dynamico/managers/gui";
import MasterChannelManager from "@dynamico/managers/master-channel";
import PermissionsManager from "@dynamico/managers/permissions";

export const categoryManager = CategoryManager.getInstance();
export const channelDataManager = ChannelDataManager.getInstance();
export const channelManager = ChannelManager.getInstance();
export const dmManager = DMManager.getInstance();
export const dynamicoManager = DynamicoManager.getInstance();
export const guildDataManager = GuildDataManager.getInstance();
export const guildManager = GuildManager.getInstance();
export const guiManager = GUIManager.getInstance();
export const masterChannelManager = MasterChannelManager.getInstance();
export const permissionsManager = PermissionsManager.getInstance();

