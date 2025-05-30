# Auto-Scaling Voice Channels (Master Scaling Channel)

This document outlines the core concepts and functionality of the Auto-Scaling Voice Channels feature, managed through a "Master Scaling Channel."

## Core Concepts

1.  **Master Scaling Channel:**
    *   A dedicated, bot-created voice channel that acts as the control point and configuration anchor for auto-scaling within a specific guild category.
    *   It is **not** intended for users to join for regular voice chat. Its primary purpose is to host the configuration interface for administrators.
    *   Admins interact with this channel (or through the `/setup` command) to define scaling parameters for its parent category.

2.  **Managed Category:**
    *   The guild category where the Master Scaling Channel resides.
    *   The bot will automatically manage voice channels **within this category only**, based on the configuration set on the Master Scaling Channel.

3.  **Scaled Voice Channels:**
    *   Regular voice channels automatically created and (potentially) deleted by the bot within the managed category.
    *   These channels are intended for user voice chat.
    *   Their names will follow a defined pattern (e.g., `Prefix-1`, `Prefix-2`).

4.  **Configuration Parameters:**
    *   **Channel Prefix:** A name prefix used for all auto-created scaled voice channels (e.g., "Lobby", "Game Room", "Team Alpha").
    *   **Max Members per Channel:** The maximum number of users allowed in any single scaled voice channel before a new one is considered for creation.

## Functionality Overview

### 1. Setup

*   Administrators initiate the setup via the `/setup` command.
*   A new option, "Create Master Scaling Channel," guides the admin through a wizard:
    *   **Step 1: Select or Create Category:** The admin can choose an existing category to manage or opt to create a new category specifically for auto-scaling.
    *   **Step 2: Configure Scaling Settings:** The admin defines the `Channel Prefix` and `Max Members per Channel` for the voice channels that will be auto-created in the selected/newly-created category.
*   Upon completion, the bot creates the "Master Scaling Channel" within the designated category and stores the configuration.

### 2. Auto-Scaling Logic

*   The bot monitors voice state updates (users joining/leaving voice channels) within all managed categories.
*   **Channel Creation (Scale-Up):**
    *   The primary goal is to ensure there is always at least one available slot for users in the managed category (i.e., at least one scaled channel that is not full or, ideally, is empty).
    *   If all existing scaled voice channels in a managed category are occupied at their `Max Members` capacity, or if a configurable threshold of occupancy is met (e.g., all channels have at least one user and a new user needs a channel), the bot automatically creates a new scaled voice channel.
    *   The new channel will be named using the defined `Channel Prefix` and an incrementing number (e.g., `Prefix-1`, `Prefix-2`, ... `Prefix-N`).
*   **Channel Deletion (Scale-Down - Optional & Configurable):**
    *   To prevent clutter, the bot can be configured to remove excess empty scaled voice channels.
    *   For example, if there are multiple empty scaled channels, the bot might delete some, ensuring at least one (or a configurable number of) empty channel(s) remain available.
    *   The Master Scaling Channel itself is never deleted by this process.

### 3. Configuration Management

*   Administrators can modify the `Channel Prefix` and `Max Members per Channel` settings after initial setup by interacting with the Master Scaling Channel or through a dedicated settings interface.

## User Experience

*   **For Admins:** A clear setup process via the `/setup` command and easy-to-access configuration options for managing auto-scaled categories.
*   **For Users:** A seamless experience where voice channels are available as needed, without manual intervention to create or manage them. Users join the scaled voice channels like any other voice channel.

## Goal

The Auto-Scaling Voice Channels feature aims to provide a dynamic and resource-efficient way to manage voice channel availability in a guild, automatically adapting to user demand within designated categories.
