import GUIManager from "@dynamico/managers/gui";
import ChannelManager from "@dynamico/managers/channel";
import PermissionsManager from "@dynamico/managers/permissions";
import CategoryManager from "@dynamico/managers/category";
import ChannelDataManager from "@dynamico/managers/channel-data";
import DynamicoManager from "@dynamico/managers/dynamico";
import GuildManager from "@dynamico/managers/guild";
import MasterChannelManager from "@dynamico/managers/master-channel";

export const categoryManager = CategoryManager.getInstance();
export const channelManager = ChannelManager.getInstance();
export const channelDataManager = ChannelDataManager.getInstance();
export const dynamicoManager = DynamicoManager.getInstance();
export const guiManager = GUIManager.getInstance();
export const guildManager = GuildManager.getInstance();
export const masterChannelManager = MasterChannelManager.getInstance();
export const permissionsManager = PermissionsManager.getInstance();
