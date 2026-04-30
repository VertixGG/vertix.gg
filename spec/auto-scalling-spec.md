# Auto-Scaling System Specification

## Overview

The auto-scaling system is an automated voice channel management system that dynamically creates and manages multiple voice channels based on user demand. It automatically creates new channels when existing ones reach capacity, routes users to available channels, and cleans up empty channels to maintain optimal resource usage.

**Purpose**: Enable Discord communities to have unlimited voice channel capacity by automatically splitting users across multiple channels instead of being limited to a single channel size.

---

## Architecture

### Channel Type Hierarchy

The system uses two internal channel types defined in the Prisma schema:

| Type | Description |
|------|-------------|
| `MASTER_SCALING_CHANNEL` | Entry point channel that users join. Used for routing only - users never stay here. |
| `SCALING_CHANNEL` | Individual scaled voice channels where users actually communicate. Linked to a master channel via `ownerChannelId`. |

### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ScalingChannelService` | `apps/vertix-bot/src/services/scaling-channel-service.ts` | Core service managing all scaling operations |
| `ScalingChannelDataModel` | `packages/vertix-base/src/models/master-channel/scaling-channel-data-model.ts` | Database operations for scaling settings |
| `scaling-channel-config.ts` | `apps/vertix-bot/src/config/scaling-channel-config.ts` | Default configuration values |
| `ChannelModel` | `packages/vertix-base/src/models/channel/channel-model.ts` | Channel database operations with scaling helpers |
| `ChannelHandler` | `apps/vertix-bot/src/listeners/channel-handler.ts` | Event listener for voice state updates |

---

## Configuration

### Default Settings

```typescript
{
  prefix: "### Room - {index} ###",
  maxMembersPerChannel: 10,
  minAvailableChannels: 1,
  categoryName: "༄ Auto Scaling Channels",
  masterChannelName: "⤢⤡ Join free channels"
}
```

### Configuration Interface

```typescript
interface ScalingChannelSettingsInterface {
  scalingChannelPrefix: string;           // Template for channel names
  scalingChannelMaxMembersPerChannel: number;  // Max members per scaled channel
  scalingChannelMinAvailableChannels: number;  // Minimum empty channels to maintain
  scalingChannelCategoryId: string;       // Discord category ID for scaled channels
}
```

### Index Placeholder Support

The `scalingChannelPrefix` supports multiple placeholder formats:

| Placeholder | Example Output |
|-------------|----------------|
| `{index}` | `Room - 1`, `Room - 2` |
| `{{index}}` | `Room - 1`, `Room - 2` |
| `{auto-scale}` | `Room - 1`, `Room - 2` |
| `{autoscale}` | `Room - 1`, `Room - 2` |
| *(no placeholder)* | `Room-1`, `Room-2` (appended) |

---

## Data Flow

### Event Flow Diagram

```
Discord VoiceStateUpdate Event
    │
    ▼
ChannelHandler.VoiceStateUpdate()
    │
    ▼
ChannelService.onEnter() / onSwitch() / onLeave()
    │
    ▼
EventBus emits onJoin / onLeave
    │
    ▼
ScalingChannelService.onJoin() / onLeave()
    │
    ▼
┌─────────────────────────────────────────────┐
│ Check channel type:                         │
│ 1. isScalingMaster? → route to scaled      │
│ 2. isScaling? → evaluate if need to scale  │
└─────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│ If scaling needed:                          │
│ 1. Get master channel config                │
│ 2. Calculate available capacity             │
│ 3. Create new channel if trigger hit        │
└─────────────────────────────────────────────┘
    │
    ▼
Database update + Discord API calls
```

### Join Master Channel Flow

```
User joins master channel
    │
    ▼
Find or create available scaled channel
    │
    ▼
Automatically move user to scaled channel
    │
    ▼
User never stays in master channel (routing only)
```

### Join Scaled Channel Flow

```
User joins a scaled channel
    │
    ▼
Evaluate available space:
  - Count channels with available slots
  - Calculate total available slots
    │
    ▼
Check trigger condition:
  availableChannelsCount <= minAvailableChannels
  OR
  totalAvailableSlots <= 1
    │
    ▼
If triggered:
  Create new scaled channel with index = currentCount + 1
```

### Leave Scaled Channel Flow

```
User leaves scaled channel
    │
    ▼
Find all scaled channels for that master
    │
    ▼
Call cleanupExcessEmptyChannels()
    │
    ▼
If > 1 empty channels:
  Delete all but 1 empty channel
```

---

## Scaling Trigger Logic

### Trigger Conditions

New channels are created when **either** condition is met:

1. `availableChannelsCount <= minAvailableChannels`
2. `totalAvailableSlots <= 1`

### Configuration Modes

| Mode | Condition | Behavior |
|------|-----------|----------|
| **Limited** | `maxMembersPerChannel > 0` | Each channel limited to specified member count |
| **Unlimited** | `maxMembersPerChannel <= 0` | All channels accept unlimited members |

---

## Maintenance Operations

### Reindex Process

**Interval**: Every 5 minutes (300,000ms)

**Process**:
1. For each master channel with scaling enabled
2. Get all scaled channels from database
3. Sort by creation timestamp
4. Rename each channel using prefix template with new index

**Example**:
```
Before reindex (after channel #2 was deleted):
  - Room - 1
  - Room - 3
  - Room - 4

After reindex:
  - Room - 1
  - Room - 2
  - Room - 3
```

### Cleanup Process

**Trigger**: User leaves a scaled channel

**Process**:
1. Find all scaled channels for the master
2. Identify empty channels
3. If more than 1 empty channel exists, delete excess
4. Always keep at least 1 empty channel available

---

## Example Scenario

### Initial Setup

```
Master Channel: "⤢⤡ Join free channels" (entry point)
Configuration:
  - Prefix: "gaming-{index}"
  - Max Members: 15 per channel
  - Min Available: 1
```

### Scaling in Action

```
State 1 - Initial:
  ├─ Master Channel (entry point)
  └─ gaming-1 (0/15 members)

State 2 - Users join:
  ├─ Master Channel
  ├─ gaming-1 (15/15 members) ← FULL
  └─ gaming-2 (0/15 members)  ← auto-created

State 3 - More users:
  ├─ Master Channel
  ├─ gaming-1 (15/15 members)
  ├─ gaming-2 (8/15 members)
  └─ gaming-3 (0/15 members)  ← buffer channel

State 4 - Users leave gaming-1:
  ├─ Master Channel
  ├─ gaming-1 (0/15 members)
  ├─ gaming-2 (8/15 members)
  └─ gaming-3 deleted         ← cleanup (excess empty)
```

---

## Service Methods

### ScalingChannelService

| Method | Description |
|--------|-------------|
| `initialize()` | Load existing scaling configs on startup |
| `createScalingMasterChannel()` | Create a new master channel setup |
| `getOrCreateAvailableChannel()` | Find or create a scaled channel |
| `updateScalingSettings()` | Update scaling configuration |
| `reindexScalingChannels()` | Rename channels to maintain index consistency |
| `deleteScalingMasterChannelWithCleanup()` | Safely delete a master channel and all scaled channels |
| `cleanupExcessEmptyChannels()` | Remove excess empty channels |

### ScalingChannelDataModel

| Method | Description |
|--------|-------------|
| `getScalingSettings(ownerId)` | Fetch settings for a master channel |
| `getAllScalingSettings()` | Fetch all scaling configurations |
| `setCategoryId()` | Set the category where scaled channels are created |
| `setAllSettings()` | Update all scaling settings |

### ChannelModel

| Method | Description |
|--------|-------------|
| `isScaling()` | Check if a channel is a scaled channel |
| `isScalingMaster()` | Check if a channel is a master scaling channel |
| `getScalingChannelsByMasterId()` | Fetch all scaled channels for a master |

---

## UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `SetupScalingPrefixInput` | `ui/general/setup/elements/setup-scaling-config-modal.ts` | Modal input for channel name prefix |
| `SetupScalingMaxMembersInput` | `ui/general/setup/elements/setup-scaling-config-modal.ts` | Modal input for max members per channel |
| `SetupScalingConfigModal` | `ui/general/setup/elements/setup-scaling-config-modal.ts` | Container modal for scaling configuration |
| `ScalingSetupEditAdapter` | `ui/v3/scaling-setup/scaling-setup-edit-adapter.ts` | V3 UI adapter for editing scaling configuration |

---

## Versioning

| Constant | Value | Description |
|----------|-------|-------------|
| `VERSION_SCALING_CHANNEL_UI_V1` | `"0.0.0.1"` | Current UI version for scaling channels |
| `VERSION_WITH_SCALING_CHANNEL_IMPROVEMENTS` | `"0.0.11+"` | Minimum version with scaling improvements |

---

## Database Schema

### Channel Model Extensions

```typescript
// Computed fields added to Channel model
{
  isScaling: boolean;       // internalType === SCALING_CHANNEL
  isScalingMaster: boolean; // internalType === MASTER_SCALING_CHANNEL
  ownerChannelId: string;   // Reference to parent master channel (for scaled channels)
}
```

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Primary Service Size | 897 lines |
| Event System | EventBus-based with onJoin/onLeave handlers |
| Reindex Interval | 5 minutes (300,000ms) |
| Default Max Members | 10 per channel |
| Default Min Available | 1 empty channel |
