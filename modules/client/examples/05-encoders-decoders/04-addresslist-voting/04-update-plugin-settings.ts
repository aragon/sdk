/* MARKDOWN
---
title: Addresslist Voting Settings
---

## Update the Addresslist Voting Plugin Settings

Updates the settings of a given AddresslistVoting plugin.

### Encoding
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  DaoAction,
  VotingMode,
  VotingSettings
} from "@aragon/sdk-client";
import { context } from "../../index";

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

const action: DaoAction = addresslistVotingClient.encoding.updatePluginSettingsAction(pluginAddress, configActionPrarms);
console.log({ action });

/* MARKDOWN
Returns:

```
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```

### Decoding
*/


const pluginSettings: VotingSettings = addresslistVotingClient.decoding.updatePluginSettingsAction(action.data);
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
