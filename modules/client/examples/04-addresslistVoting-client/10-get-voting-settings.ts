/* MARKDOWN
---
title: Get Settings
---

## Get the Addresslist Voting Plugin Settings

Get the settings established for a given AddresslistVoting plugin.
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  VotingSettings,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an AddresslistVoting client.
const addresslistVotingClient: AddresslistVotingClient =
  new AddresslistVotingClient(contextPlugin);

const pluginAddress: string = "0x1234567890123456789012345678901234567890"; // the address of the AddresslistVoting plugin contract installed in the DAO.

const addresslistVotingSettings: VotingSettings | null =
  await addresslistVotingClient.methods.getVotingSettings(pluginAddress);
console.log({ addresslistVotingSettings });

/* MARKDOWN
Returns:

```json
{ addresslistVotingSettings:
  {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: "Standard" // default STANDARD, otherwise EARLY_EXECUTION or VOTE_REPLACEMENT
  }
}
  ```
*/
