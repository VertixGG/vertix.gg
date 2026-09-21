# Changelog

**Version: 0.0.20 ~ 21/09/2026**
- New Features:
    - **Bitrate**: Set how much of everyone's connection your channel asks for, from the same screen that already sets its region - a second menu under the one that was there, on both interfaces. The steps run from 8 kbps up to 384, and a server is offered only the ones its boost tier allows, read fresh every time the screen is drawn - so a server that boosts today sees the wider list today rather than after we deploy something. `Generator default` hands the choice back to whatever the generator itself is on, which is also where every new channel starts. On a generator that remembers your settings the next channel you open comes back on the bitrate you left, and `Reset` puts it back to the generator's along with everything else.
    - **Region On The Older Interface**: The older interface never had a region screen. `/voice region` answered that the feature was not in it, and a channel's region could be read on its own message and changed by nobody. It has that screen now - region and bitrate together - and a **Region** button on the panel, after Transfer, to open it. A server that never arranged its buttons is given it without doing anything; one that did keeps the set it chose, and adds it from the buttons screen when it wants it.
- Improvements:
    - **Both Panels Say What A Channel Sounds Like**: The control panel lists the bitrate under the region, written in the kilobits Discord's own interface uses rather than the raw number its API takes. Both interfaces, seven languages.
- On The Site:
    - The region pages carry the bitrate menu and let you work both of them, and the older interface has a page of its own for the screen it just gained. The comparison against the other three catches up on the one row where all of them beat us.

---

**Version: 0.0.19 ~ 15/09/2026**
- New Features:
    - **Commands For Everything**: Every button on a channel's panel is now a slash command as well. `/voice rename`, `limit`, `privacy`, `status`, `access`, `invite`, `knock`, `claim`, `transfer`, `region`, `templates`, `message`, `reset`, `clear-chat` and `panel` open the same screens the buttons do, so a member can reach them without the panel in front of them. The admin screens gather under `/manage` - setup, new-generator, edit, roles, server-options, badwords and language. Where an older generator has no such screen, the command says so instead of opening the wrong one.
    - **LFM - Looking For Members**: An owner presses LFM, writes a line about who they are after, and the bot posts it in a channel you pick. The post says who is hosting, what they are playing and how many are in, keeps the count up to date, and comes down on its own when the room fills, empties or the post expires - so nobody is left clearing out stale calls in general chat. Four timings sit on each generator: how often one of its rooms may advertise, how long before a pinged role may be pinged again, how long a post stands, and how often the count is redrawn. It arrives switched off on new generators, because a post needs somewhere to go first.
    - **Channel Status**: Set the status Discord shows on a voice channel, or let the bot compose one from what the room is playing. A status can carry `{user}`, `{game}` and `{state}`, and they are filled in again every time the channel changes rather than frozen at the moment somebody typed them. The bad word list now covers the line the bot composes for itself, not only what an owner typed.
    - **Claim Timings Per Server**: How long an owner may be away before their channel can be claimed, and how long the vote runs, are your server's settings now rather than ours - `/setup` -> `Server Options` -> `Edit Claim`, or the same four fields on the dashboard. Leave one empty and it follows the bot's own default.
    - **Buttons From The Dashboard**: Which buttons a generator carries, what order they sit in and where the rows break are all set in the interface editor, and a role can be given a set of its own there too. A change redraws the control panel and every channel already open, so nobody has to reopen theirs.
    - **Word One Generator Differently**: Wording and artwork belonged to the whole server, so renaming a button on the gaming generator renamed it on the study one beside it. An override can now name a single generator, and anything you have not worded separately still falls back to the server's text.
    - **A Screen For Each Server Setting**: The voice role, verified roles, staff roles, bad words and claim timings each open on a screen of their own, with room to say what the setting does - and a button to empty it. Emptying a verified list hands its channels back to `@everyone`; emptying a voice role stops it being handed out.
- Improvements:
    - **A Channel You Can Join Is One You Can Talk In**: Dynamic channels now grant chat and history alongside view and connect, so members no longer arrive somewhere they can see, can enter, and cannot read a word of. Channels that already exist keep the permissions they were created with.
    - **Verified Roles Apply The Same Way Everywhere**: A narrow audience shapes the generator, its category, the control panel and the channels identically, and the generator is included - so a server that verifies its members no longer offers join-to-create to the ones it did not. Overwrites you set yourself are left alone.
    - **The Dashboard Stops At Your Limits**: How many setups a server may have is shown in the header and beside the buttons that make one, and the way to make another is greyed out once it is spent. Auto-scaling pools count towards it too. A refusal now arrives as a message saying why, instead of a form left waiting on a setup that was never coming.
    - **How Full A Category Is**: Discord allows fifty channels in one category, and a generator keeps its own channel, its control panel and everything it creates in the same one. Each generator's bar measures against that fifty now, turning amber at eighty percent and red at the limit.
    - **The Dashboard Says When The Bot Is Not There**: Picking a server the bot was never added to used to open a dashboard full of zeroes and buttons that could not work. It says so now, and offers you another server.
    - **Roles The Bot Cannot Hand Out Are Marked**: Picking a voice role the bot cannot assign used to save cleanly and then do nothing on every join. Both `/setup` and the dashboard now say which roles those are, and why.
    - **Knock Points At What Is Open**: A member with nothing to knock on is shown the channels of that generator that are open to them, rather than a dead end.
    - **Claim From The Control Panel**: Claim sat greyed out there permanently with no way to say why. It answers now with where claiming happens - join the channel you want, open its chat, press Claim on the message waiting there.
    - **A Slow Change Says It Is Thinking**: A setting that has to be rewritten across every channel following it locks its screen and shows Discord's thinking indicator, instead of reporting that the bot did not respond.
    - **Seven Languages, Again**: Fourteen screens that were still English in every language - the new setup screens, the claim notices, and what a command says when it can open nothing - are translated. Regions read as `US West` rather than `us-west`.
- Fixes:
    - **Claim Works Again**: A claim vote moves through its own steps, answers the presses it gets, announces a winner and actually hands the channel over. It had been sitting on its first screen, counting down to nothing.
    - **Claim Works At All On The Current Interface**: On a generator made with the current interface, a room whose owner walked off was never offered to anybody - the Claim button drew greyed for ever, and `/voice claim` said there was nothing to claim while the rooms sat there. The bot was looking for its own button in your button list by position rather than by name, and this interface names its buttons instead of numbering them, so it never found it and concluded claiming was switched off. Every server on this interface has had claiming off since it shipped.
    - **A Restart No Longer Loses An Abandoned Room**: Which rooms were waiting for their owner to come back, which were already up for grabs, and any vote in progress were all held in memory only, so every restart forgot them. A room whose owner had left was never offered again; one already offering itself kept the message inviting people to press a button that now drew greyed; and a vote in progress stopped counting and answered every press with "channel not running", so the channel never changed hands. All three are written down now and picked back up. A room keeps the time its owner actually left rather than starting its wait over, and a vote that ran out while the bot was away is closed out and the channel handed to whoever won it.
    - **A Busy Server Stops Losing Its Logs Channel**: Lines about a room are gathered up and sent together, and the flush meant to keep that under discord's limit of ten asked for the wrong batch, so it never ran. A generator busy enough eventually handed discord more than it takes, the send was refused - and any refused send was read as the logs channel being no good, which quietly unset the one you had configured. Logging stopped for good and nothing said so. Only the three refusals that genuinely mean the channel cannot be posted in do that now, and each leaves a line saying which.
    - **A Press On A Screen From Before A Restart**: A button on a message the bot drew before it restarted answered with nothing at all, and discord gave up after three seconds and reported that the interaction failed. It answers now with what it can work out; where something can only have come from the moment the screen was made, it says it cannot rather than saying nothing.
    - **Settings Stop Vanishing On A Bad Minute**: The sweep that clears away rows for channels discord no longer has read every failure to reach discord as the channel being gone. A rate limit or one bad minute part way through could therefore delete a generator and its settings for a server that was never gone. Anything it could not ask about is left alone now and looked at again next time, and it reports how many it skipped.
    - **The Bot Answers If You Write To It Again**: Sending the bot a direct message opens a feedback screen, and it opened once per person and never again - write a week later and nothing came back at all, for as long as the bot had been running. It answers again after a day now, so coming back is not met with silence.
    - **A List Of Everyone Who Ever Joined**: The note the bot keeps so that nobody spins up channels faster than a generator allows was never cleared, so on a bot that stays up it grew into a list of every member who had ever joined a generator anywhere. An entry is dropped once it is older than the wait it enforces. Nobody is refused, or allowed, any differently than before.
    - **Joining A Brand New Generator**: For about a second after a generator was made, anyone joining it was told their channel could not be created and that the server had probably hit a Discord limit, which it had not. Its settings are written before it can be joined now, in both interface versions.
    - **The Older Interface Draws The Buttons You Arranged**: A v2 generator ignored which buttons were picked, the order and the row breaks - and so did the control panel every time it was redrawn.
    - **Screens Stop Forgetting**: Opening a modal wiped everything the screen behind it knew, and a menu somebody was reading without changing anything was swept out from under them after ten minutes.
    - **A Screen About A Channel That Is Gone**: Left open after the channel was deleted, it used to fall through and quietly edit whichever channel you were sitting in by then. It says the channel is gone now, and takes its own buttons away.
    - **Placeholders Stop Reaching People**: `{invitedDisplayName}` in the invite confirmation, `{ownerDisplayName}` and `{totalMessages}` in the cleared chat notice, and `#{index}` in the title of the timings modal.
    - **Names In The Buttons Menu**: LFM was listed as a second `Claim`, `Invite` was offered as a second `Privacy`, and `Status` printed its raw id. Every option is named by the button it belongs to now.
    - **The Timings Modal Opens On Your Numbers**: It showed the shared defaults, so an admin who opened it to change one field wrote those defaults over the rest.
    - **A Shortened LFM Cooldown Takes Effect**: Shortening it, or switching it off, used to leave the rooms already waiting on the old one - including the setting an admin reaches for to unblock a server.
    - **Choosing Server Wide Roles**: Picking verified or staff roles rewrites every channel under every generator, which outran the three seconds Discord allows, so the screen reported that the bot had not responded while the roles had in fact saved.
    - **Clearing Chat Answers The Click**, and the notice afterwards names who cleared it.
    - **Knock And Invite From A Control Panel** act for the generator whose panel was pressed, rather than for whichever channel the presser happened to be sitting in.
    - **The Welcome Message Has Its Logo Back**.
- Security:
    - **Deleting A Setup Needs Authorisation**: Three operations the dashboard guards behind a login - deleting a generator, deleting a scaling pool, and changing a server's settings - could also be reached by anything able to publish on the internal message bus, with no check at all on who sent it.
- On The Site:
    - New guides: a walkthrough of Join to Create you press rather than read, a page on making a voice channel in Discord at all, and a comparison against the four bots people weigh us against - every cell established on a test server running all four. The placeholders page now covers the channel status and the tokens it takes.

---

**Version: 0.0.18 ~ 09/09/2026**
- New Features:
    - **Knock**: Ask the owner of a private channel to let you in. Press it inside the channel you want and its owner is asked straight away; from the control panel you pick which channel first. Only channels you can see but cannot join are offered - a hidden channel stays hidden. Either answer reaches you, and ignoring a request lets it expire on its own.
    - **Invite**: Let someone into your channel in one press. They get the access the permissions menu would have given them, and a message telling them where the channel is - so a private channel no longer has to be explained in chat.
- Improvements:
    - **Wider Interface**: The buttons are drawn five to a row instead of four, and the legend above them is laid out to match.
    - **Seven Languages**: Both new screens are translated everywhere the rest of the bot is.

---

**Version: 0.0.17 ~ 07/09/2026**
- We Are Now VoiceChannels:
    - **New Name**: Vertix is now **VoiceChannels**, with a new look and a new home at [voicechannels.online](https://voicechannels.online). Every master channel, setting and dynamic channel you already have keeps working exactly as it did - there is nothing to redo.
- New Features:
    - **Staff Roles**: Pick the roles that should always reach a dynamic channel. Their members can join whatever state the owner sets it to, and an owner cannot block or kick them.
    - **Temporary Voice Role**: Hand out a role while someone is sitting in a dynamic channel and take it back when they leave - useful for a colour, a badge, or access to a text channel that only people in voice should see. Set it for the whole server, or per master channel.
    - **Buttons Per Role**: Give one role a different set of buttons from everyone else. An owner who has that role sees their set; every other owner keeps the default one.
    - **New Channel Defaults**: Choose what a freshly created channel starts as - public, private or hidden - and the user limit it starts with, separately from the limit on the generator itself.
- Improvements:
    - **Rebuilt Buttons Screen**: The screen now says which set you are editing, lists every role that has one of its own, and saves the moment you pick. Channels that are already open are refreshed with one button.
    - **Verified Roles Now Govern Access**: The roles you mark as verified actually decide who can see and join the channels a master channel creates.
    - **Clearer Channel Names**: Every placeholder now has one spelling, and there is a page listing all of them and where each one works.
    - **Bad Words Everywhere**: The bad word filter now applies to every way a channel name can be set, not only the first one.
    - **A Reason When Creation Fails**: If a channel cannot be created because its category is full, we now say so instead of doing nothing.
- Fixes:
    - **The Generator's User Limit Is Applied**: New channels start with the limit set on the master channel instead of no limit at all.
    - **Names In Any Alphabet**: Non-latin names are no longer stripped out of a channel name.
    - **Settings Stay Saved**: Server and user settings no longer revert after a restart.
    - **Every Setup Screen Responds**: The staff roles, verified roles, buttons and voice role screens all draw again after you change something.
    - **Removing A Role's Buttons Removes Them**: The role used to come back the next time you opened the screen.
    - **Emoji Show Up Everywhere**: Buttons and menus no longer lose their icons on the site or in the bot.

---

**Version: 0.0.16 ~ 05/02/2026**
- New Languages:
    - 🇪🇸 Spanish
    - 🇫🇷 French
    - 🇩🇪 German
    - 🇯🇵 Japanese
- Dashboard:
    - **Visual Editor**: A flow-based visual editor for customizing bot UI components, embeds, and elements per guild and per language.
    - **Bot Management**: Manage auto-scaling and dynamic channel setups directly from the dashboard - create, configure, and delete master channels.

---

**Version: 0.0.15 ~ 25/01/2026**
- New Features:
    - **Auto-Scaling Channels**: Automatically create and manage voice channels based on demand. When users join the master channel, they're moved to an available room (or a new one is created).
    - **Scaling Channel Management**: Configure your scaling channels directly from `/setup` - set custom prefixes and max members per room.
    - **Delete Scaling Channels**: Easily remove scaling setups with a confirmation dialog that cleans up all related channels.
    - **Channel Numbering**: Use `{index}` in your channel names to automatically number them (e.g., "Room-1", "Room-2").
- Improvements:
    - **Helpful Hints**: Added placeholder suggestions when setting up channel name templates.
    - **Auto-Renumbering**: Channels are automatically renumbered every 5 minutes to keep names consistent.
    - **New Languages**: Scaling features now available in English, Russian, and Greek.

---

**Version: 0.0.14 ~ 16/01/2026**
- New Feature:
    - **Master Channel Deletion**: Added a delete action with confirmation that removes the control panel, all owned dynamic channels, the master channel, and cleans up empty categories.
- Improvements:
    - **Delete Flow Stability**: Prevented errors when the originating setup channel is removed during deletion.

---

**Version: 0.0.13 ~ 16/01/2026**
- New Feature:
    - **Control Panel Channel**: A dedicated text channel is now automatically created alongside your Master Channel. This gives you a permanent place to manage all your dynamic voice channels, even when you're not in one.
- Improvements:
    - **Default Enabled**: The control panel channel is enabled by default when creating new Master Channels. You can toggle it off during setup if preferred.
    - **Wizard Navigation**: Fixed an issue where "Next" and "Back" buttons weren't working correctly in some configuration wizards.

---

**Version: 0.0.12 ~ 02/01/2026**
- Improvements:
    - **Stability**: Resolved Discord's `custom_id` character limit violation (100 chars) by migrating UI modules to a hashing strategy.
    - **UI Framework**: Fixed a critical bug in adapter interaction hand-offs where excluded elements were not properly pre-registered.
    - **Setup Workflow**: Improved compatibility in the Setup Wizard to handle interactions originating from the main setup dashboard.

---

**Version: 0.0.11 ~ 31/12/2025**
- New Features:
    - **Scaling Channel Improvements**: Added `scalingChannelMinAvailableChannels` configuration to ensure a minimum number of available rooms.
    - **Database Utility**: Added `drop-config-collections.sh` script for managing global configuration collections.
- Improvements:
    - **Auto-Scaling Logic**: Restored legacy "1 slot left" trigger and enhanced it with "1 room left" detection.
    - **Framework Stability**: Fixed a critical mutation bug in `ModelDataOwnerConfigBase` and improved falsy value handling in `ModelDataOwnerStrictDataBase`.
    - **Channel Identification**: Improved `ChannelModel` with `getById()` to support fetching by internal MongoDB `_id` and updated cache key generation.

---

**Version: 0.0.10 ~ 29/12/2025**
- New Features:
    - **Channel Templates (Presets)**: Capture your current channel configuration as a template and reuse it later.
    - **Per-Guild Templates**: Templates are stored per user per guild, keeping configurations separate for each Discord server.
    - **Apply/Delete Confirmation**: Apply and Delete actions now use a two-step confirmation flow.
- Improvements:
    - **Templates UI**: Added a dedicated Templates menu with Capture, Apply, and Delete actions.
    - **Stability**: Fixed multiple interaction timeout/state issues in Templates flows (confirm buttons enabling, persistence across steps).

---

**Version: 0.0.9 ~ 28/12/2025**
- New Features:
    - **Role-Based Button Overrides**: Admins can now customize button layouts for specific roles within a single Master Channel.
    - **Live Configuration Sync**: Button changes now apply instantly to all currently active dynamic channels.
    - **Session Recovery Flow**: Added a **Regenerate** button to old or expired setup messages, providing a one-click way to resume your configuration.
- Improvements:
    - **Redesigned Setup Overview**: Improved the master channel configuration layout with better role organization and cleaner visuals.
    - **Enhanced Stability**: Fixed multiple issues that could cause setup sessions to expire or fail unexpectedly.
    - **Settings Preservation**: Improved data handling to ensure your existing V2 configurations are correctly migrated and preserved.

---

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
