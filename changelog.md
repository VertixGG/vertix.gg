# Changelog
**Version: 0.0.8 2024~2025**
- New Features / Improvements:
    - Add display of region (e.g., `Europe`, `US East`) in the **Dynamic Channel** interface.
    - Revamped the `/setup` command for creating **Master Channels** into a multi-step wizard interface.
    - Improved the UI for editing existing **Master Channels** (via `/setup`), including clearer options for modifying channel names, buttons, and verified roles.
    - Added clearer feedback messages when users attempt **Dynamic Channel** actions they don't have permission for (e.g., not owner, bot missing permissions).
    - Added a more detailed view for **Claim Vote Results**, potentially linked externally.
    - Added choice when editing **Dynamic Channel Buttons** to apply changes immediately or only for newly created channels.
    - (Visual) Added emojis to some buttons in the **Dynamic Channel** interface.
    - Added ability to edit the title and description of the primary message in **Dynamic Channels**.
    - Added new emoji handling system through an EmojiManager.
    - Improved welcome messages for new server joins with customized adapter.
    - Enhanced privacy management with clear visual indicators for different states (public, private, hidden, shown).
    - Added new channel ownership transfer feature with confirmation workflow.
    - Added dedicated logs channel selection for server admins.
    - Added automatic user-limit interface with improved buttons and menu options.
    - Enhanced auto-save feature for dynamic channel configurations.
    - Improved channel setup wizard with better separation of options across multiple steps.
    - Added better error handling with specific adapters for invalid channel types and missing permissions.
    - Introduced UI versioning system to support multiple UI versions simultaneously.
    - Enhanced variable management in UI components for more dynamic content.
    - Updated visual assets and icons for a more polished user interface.
    - Restructured dynamic channel permission management for clearer access controls.
    - Refined user access controls with granular permission settings (add, edit, remove, kick).
    - Improved claim button functionality with better owner activity verification.
    - Enhanced feedback system with dedicated components for user suggestions and reports.
    - Redesigned user interface components with modular architecture for better maintainability.
    - Implemented comprehensive status tracking for user actions (success, error, already-granted, etc.).
    - Added detailed logging for all user interactions with dynamic channels for better troubleshooting.
    - Added links to additional documentation for specific features in UI components.

---

**Version: 0.0.7 ~ 19/07/2023**
- New Language:
  -  🇬🇷 Greek - Thanks to `@christos56` for his support/translation!

---

**Version: 0.0.6 ~ 11/07/2023**

- New Feature:
  - Enable autosave - Configuration per **Master Channel** - Automatically saves the state of dynamic channels. When a channel is re-created, it will have the same configuration as before its deletion.

---

**Version: 0.0.5 ~ 24/06/2023**

- New Feature:
  - Send logs to custom channel - Now you can set a custom channel for receiving logs via the `Edit Master Channel` option in the `/setup` command.

- Access Menus 👥:
  - Added 👢 Kick user menu.
  - Fixed an issue with the display of the **_Allowed Users_** showing the channel owner .

- BadWords 🙅:
  - Added support for limiting words per sentence.

- Claim 😈:
  - Fixed an issue where the wrong previous owner was displayed.

- Optimization & Performance 📊:
  - Implemented a limitation: If a user requests to create a channel more than **twice** within **40** seconds, they will be temporarily restricted for **40** seconds.

- Fixed issue with **Not your channel** embed:
  - The issue related to pointing to the wrong **"➕ New Channel"** has been resolved.

---

**Version: 0.0.4 ~ 20/06/2023**

- Normalized the 👥 Access menu:
  - Added 🫵  Block user access menu.
  - Added 🤙 Un-Block user access menu.

- Added a new button for the dynamic channel interface:
  - 🔀 Transfer ownership - This button allows you to transfer the channel ownership to another user.

---

**Version: 0.0.3 ~ 16/06/2023**

- New Interface for ⚙️ Configure:
    - (∙🟢 On/∙🔴 Off) **Toggle** - Enabling/Disabling owner mention when creating dynamic channel.

- New Interface for 🛡️ Verified roles:
    - (∙🟢 On/∙🔴 Off) **Toggle** - Applies to `@everyone` role.
    - Option to select or edit **multiple roles**.

   __Explanation__: Changing the state of dynamic channel will affect the verified roles.
   - 🌐 / 🚫 (`Public/Private`) - Toggle between the states.
        - 🌐 `Public` button - Set `Connect` permission to *`None`* for -> **🛡️ Verified Roles.**
        - 🚫 `Private` button - Set `Connect` permission to *`False`* for -> **🛡️ Verified Roles.**
    - 🐵 / 🙈 (`Shown/Hidden`) - Toggle between the visibility states.
        - 🐵 `Shown` button - Set `ViewChannel` permission to *`None`* for -> **🛡️ Verified Roles.**
        - 🙈 `Hidden` button - Set `ViewChannel` permission to *`False`* for -> **🛡️ Verified Roles.**
---

**Version: 0.0.2 ~ 12/06/2023**

- Fixed issue with disabling the 👥 (`Access`) Button:
  - 🙈 **Hidden** mode and 🚫 **Private** mode no longer allow granting privileges.

- Added `/help` command with the following options:
    - Report an issue.
    - Suggest an idea.
    - Invite the developer.
    - Community server link.

---

**Version: 0.0.1 ~ 09/06/2023**

- Various tweaks and fixes to enhance the overall user interface of the bot.
- Implemented language management infrastructure.
- Added support for Russian 🇷🇺 language.
- Introduced new user interface option for editing `dynamic channel buttons`, that providing two choices:
    - Apply changes immediately - Trigger the change for all active dynamic channels.
    - Save changes - Affect only newly created dynamic channels.

---

**Initial version ~ 03/06/2023**

- Added `/setup` command to create _master channel(s)_ aka (＋ **New Channel**) that includes:
    - Dynamic Channels name modification.
    - Dynamic Channels buttons interface modification.
    - Guild level - Badwords modification.

- Added creation of temporary voice channels by entering _master channel(s)_, the dynamic channels include __buttons interface__ that currently supports:
    - ✏️ `Rename` button -  Rename channel name.
    - ✋ `User Limit` button - Setting the limit of users.
    - 🧹 `Clear chat` button - Will clear the chat except embedded messages.
    - 🌐 / 🚫 (`Public/Private`) - Toggle between the states.
        - 🌐 `Public` button - Set `Connect` permission to *None* for `@everyone`.
        - 🚫 `Private` button - Set `Connect` permission to *False* for `@everyone`.
    - 👥 `Access` button - show drop list with add or remove users option.
    - 🐵 / 🙈 (`Shown/Hidden`) - Toggle between the visibility states.
        - 🐵 `Shown` button - Set `ViewChannel` permission to *None* for `@everyone`.
        - 🙈 `Hidden` button - Set `ViewChannel` permission to *False* for `@everyone`.
    - 🔃 `Reset Channel` - Return channel to default state.
    - 😈 `Claim Channel` - After 10 minutes of dynamic channel owner in-activity will the button will be available, the one who claims the channel will be the new owner.

And more...
