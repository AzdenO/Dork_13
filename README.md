# Introducing: Dork-13  
## The Official Skill Issues Inc. Discord Bot  

### Project Description

Dork-13 is intended to eventually fully take over the responsibilities of the **Charlemagne** Discord bot on the server, and provide any functionality required, including functionality that other bots could provide. The aim is for Skill Issues Inc. to have full control of applications in the official server and not become dependant on the maintenance and development of other bots.

### Current Functionality

The bot provides the following current features:

**__Activity Management__**: 

This is the first feature Dork-13 has officially taken over from Charlemagne. Server members can create raid/dungeon cards, but with extended abilities:

- Members can create distinct "sherpa" cards for teaching runs, and set the maximum number of learners allowed to join on a specific run.
- Auto-Notifications are provided 30 minutes before an activity is due to commence, and auto-deletes activity embeds 30 minutes after start time.
- If an activity does not have the required number of joins, Dork notifies not just those who have joined that an activity is to commence soon, but messages alts that they will be required to fill up space
- "Normal Cards" and "Sherpa Cards" when created, are sent to distinct channels, and cards marked as "custom" are delivered to the channel in which the activity command was used. 

__**Commands**__: 

Dork provides a number of helpful commands, which are planned to be extended to include Destiny 2 centred commands like charlemagne has:

- **join-clan**: Randomly selects a clan link from the list of official Skill Issues Inc. clans and returns it to the user.

- **insult (member)**: A fun command where a user can select a server member and Dork-13 will give a fun Destiny 2 centred insult.

- **simulate-join**: A command accessible only to admins, helpful for debugging purposes

**Recruitment**: 

Dork-13 provides functionality for server members to apply to certain roles. Buttons are sent to specific channels, and when clicked, the bot returns a modal for the user to fill out. When submitted, the results from the modal are injected into an embed and forwarded to an admin-only thread, where answers to questions can be reviewed, and buttons provided with "approve" or "reject". Both buttons send a direct message to the user, defined in the recruitment config. If approved, the user is automatically given the associated role. Currently, two types of recruiting positions exist:

- **Moderators**: One step below admins, but are there to enforce server rules, put a stop to any trouble, so on and so forth.
- **Raid Masters**: The go-to people for teaching raids, and are the best of what we have

**Notification Roles Functionality**: 

Dork provides buttons in specific channels for users to sign up to certain roles that can be pinged for certain activities such as raids, conquests or other games. When clicked, a button either adds or takes away a role depending on whether the user has the role already or not. 

**Automatic Welcomes**: 

When a new member joins, Dork randomly selects from a list of pre-defined welcome messages to greet new users.

**Dork-Logs**: 

So that admins and moderators are aware of what the bot is doing, or if it encounters any errors it can recover from (and can let me know if I'm not there to see), Dork forwards 90% of its logs to a specific channel in the server, accessible only to mods and admins. There are obviously crash states where the bot cannot send these messages, but for most, it means not only I can be the one to notice it. 

### Planned Functionality

As noted in the project description, this bot is intended to completely take-over all functionality provided by Charlemagne, as well as some other useful features:

- **Destiny 2 Commands**: Stats, activities counts, reports, etc. Dork will eventually be able to connect to the Official Skill Issues Central API to get member player data and other such game data. This will also mean that like charlemagne, users will have to connect their discord and bungie account to Dork.

- **Message Filtering**: Every message sent in the server will be sent through a filter to ensure that no slurs are sent, and will automatically report to admins the incident.

- **Trouble Tracking**: Admins will be able to register incidents with server members such as rule breaking or verbal abuse to a trouble tracking database that will be managed. When the number of tracked issues of a member reaches a threshold (such as two strikes = raid ban or 6 strikes = server ban) Dork can automatically take action, but only with the permission of an admin