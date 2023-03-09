/* MARKDOWN
---
title: Addresslist Voting Settings
---

## Update the Addresslist Voting Plugin Settings

Updates the settings of a given AddresslistVoting plugin.
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  DaoAction,
  VotingMode,
  VotingSettings
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates an AddresslistVoting client.
const addresslistVotingClient = new AddresslistVotingClient(contextPlugin);

// The action object for updating the plugin settings.
const configActionPrarms: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.STANDARD // default STANDARD, otherwise EARLY_EXECUTION or VOTE_REPLACEMENT
};

const pluginAddress: string = "0x1234567890123456789012345678901234567890"; // the address of the AddresslistVoting plugin contract installed in the DAO

const updatePluginSettingsAction: DaoAction = addresslistVotingClient.encoding.updatePluginSettingsAction(pluginAddress, configActionPrarms);
console.log({ updatePluginSettingsAction });




/* MARKDOWN
---
title: Update Plugin Settings
---

## Decode the Update Plugin Settings Action for the Addresslist Voting Plugin

Decodes the action of a update plugin settings action.
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  VotingSettings,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the simple context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a AddresslistVoting plugin client.
const clientAddressList = new AddresslistVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const pluginSettings: VotingSettings = clientAddressList.decoding.updatePluginSettingsAction(data);
console.log({ pluginSettings });

/* MARKDOWN
Returns:

```json
{
  minDuration: 7200, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("1")
}
```
*/
