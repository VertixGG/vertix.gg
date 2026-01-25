import type { WizardStep } from "@vertix.gg/discord-ui";

export const AUTO_SCALING_CONFIG = {
    categoryName: "༄ Auto Scaling Channels",
    masterChannelName: "⤢⤡ Join free channels",
    prefix: "### Room - {index} ###",
    maxMembers: 10,
    minAvailable: 1
} as const;

const user1 = { id: "1", username: "Alex", avatar: "https://cdn.discordapp.com/embed/avatars/0.png" };
const user2 = { id: "2", username: "Jordan", avatar: "https://cdn.discordapp.com/embed/avatars/1.png" };
const user3 = { id: "3", username: "Sam", avatar: "https://cdn.discordapp.com/embed/avatars/2.png" };

export const autoScalingWizardSteps: WizardStep[] = [
    {
        title: "Initial State",
        description: "Empty master channel (entry point) and one available room",
        titleClassName: "text-primary",
        channelDisplayProps: {
            masterChannel: { name: AUTO_SCALING_CONFIG.masterChannelName, active: false, userCount: 0 },
            scaledChannels: [
                { id: "1", name: "Room-1", active: false, userCount: 0, maxUsers: 2 }
            ],
            showMasterChannel: true
        }
    },
    {
        title: "Alex joins Master Channel",
        description: "Alex enters the master channel to find an available room",
        titleClassName: "text-info",
        channelDisplayProps: {
            masterChannel: { name: AUTO_SCALING_CONFIG.masterChannelName, active: true, userCount: 1 },
            scaledChannels: [
                { id: "1", name: "Room-1", active: false, userCount: 0, maxUsers: 2 }
            ],
            showMasterChannel: true
        }
    },
    {
        title: "Alex → moved to Room-1",
        description: "System routes Alex to Room-1, buffer Room-2 created (minAvailable=1)",
        titleClassName: "text-success",
        channelDisplayProps: {
            masterChannel: { name: AUTO_SCALING_CONFIG.masterChannelName, active: false, userCount: 0 },
            scaledChannels: [
                { id: "1", name: "Room-1", active: true, userCount: 1, maxUsers: 2, users: [ user1 ] },
                { id: "2", name: "Room-2", active: false, userCount: 0, maxUsers: 2 }
            ],
            showMasterChannel: true
        }
    },
    {
        title: "Jordan → moved to Room-1",
        description: "Jordan joins master and is routed to Room-1 with Alex (now full)",
        titleClassName: "text-success",
        channelDisplayProps: {
            masterChannel: { name: AUTO_SCALING_CONFIG.masterChannelName, active: false, userCount: 0 },
            scaledChannels: [
                { id: "1", name: "Room-1", active: true, userCount: 2, maxUsers: 2, users: [ user1, user2 ] },
                { id: "2", name: "Room-2", active: false, userCount: 0, maxUsers: 2 }
            ],
            showMasterChannel: true
        }
    },
    {
        title: "Sam → moved to Room-2",
        description: "Sam joins master and is routed to available Room-2",
        titleClassName: "text-success",
        channelDisplayProps: {
            masterChannel: { name: AUTO_SCALING_CONFIG.masterChannelName, active: false, userCount: 0 },
            scaledChannels: [
                { id: "1", name: "Room-1", active: true, userCount: 2, maxUsers: 2, users: [ user1, user2 ] },
                { id: "2", name: "Room-2", active: true, userCount: 1, maxUsers: 2, users: [ user3 ] },
                { id: "3", name: "Room-3", active: false, userCount: 0, maxUsers: 2 }
            ],
            showMasterChannel: true
        }
    },
    {
        title: "Alex & Jordan leave",
        description: "Users leave Room-1, it becomes empty",
        titleClassName: "text-danger",
        channelDisplayProps: {
            masterChannel: { name: AUTO_SCALING_CONFIG.masterChannelName, active: false, userCount: 0 },
            scaledChannels: [
                { id: "1", name: "Room-1", active: false, userCount: 0, maxUsers: 2 },
                { id: "2", name: "Room-2", active: true, userCount: 1, maxUsers: 2, users: [ user3 ] },
                { id: "3", name: "Room-3", active: false, userCount: 0, maxUsers: 2 }
            ],
            showMasterChannel: true
        }
    },
    {
        title: "Cleanup: excess rooms removed",
        description: "Room-1 & Room-3 removed, Room-2 reindexed to Room-1",
        titleClassName: "text-warning",
        channelDisplayProps: {
            masterChannel: { name: AUTO_SCALING_CONFIG.masterChannelName, active: false, userCount: 0 },
            scaledChannels: [
                { id: "1", name: "Room-1", active: true, userCount: 1, maxUsers: 2, users: [ user3 ] },
                { id: "2", name: "Room-2", active: false, userCount: 0, maxUsers: 2 }
            ],
            showMasterChannel: true
        }
    }
];

export const reindexWizardSteps: WizardStep[] = [
    {
        title: "Before Reindex",
        description: "After deletions, numbering becomes inconsistent (1, 3, 4)",
        titleClassName: "text-warning",
        channelDisplayProps: {
            masterChannel: { name: AUTO_SCALING_CONFIG.masterChannelName, active: false, userCount: 0 },
            scaledChannels: [
                { id: "1", name: "Room-1", active: true, userCount: 1, maxUsers: 2, users: [ user1 ] },
                { id: "3", name: "Room-3", active: true, userCount: 1, maxUsers: 2, users: [ user3 ] },
                { id: "4", name: "Room-4", active: false, userCount: 0, maxUsers: 2 }
            ],
            showMasterChannel: true
        }
    },
    {
        title: "After Reindex",
        description: "Channels renumbered to maintain sequence (1, 2, 3)",
        titleClassName: "text-success",
        channelDisplayProps: {
            masterChannel: { name: AUTO_SCALING_CONFIG.masterChannelName, active: false, userCount: 0 },
            scaledChannels: [
                { id: "1", name: "Room-1", active: true, userCount: 1, maxUsers: 2, users: [ user1 ] },
                { id: "2", name: "Room-2", active: true, userCount: 1, maxUsers: 2, users: [ user3 ] },
                { id: "3", name: "Room-3", active: false, userCount: 0, maxUsers: 2 }
            ],
            showMasterChannel: true
        }
    }
];
