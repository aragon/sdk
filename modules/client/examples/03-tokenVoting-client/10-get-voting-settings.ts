/* MARKDOWN
---
title: Get Settings
---

## Get the Token Voting Plugin Settings

Gets the settings defined for a specific TokenVoting plugin governance mechanism installed in a DAO.
*/

import {
  ContextPlugin,
  TokenVotingClient,
  VotingSettings,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an Addresslist Client
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  contextPlugin,
);

const pluginAddress: string = "0x1234567890123456789012345678901234567890";

const tokenVotingSettings: VotingSettings | null = await tokenVotingClient
  .methods.getVotingSettings(pluginAddress);
console.log(tokenVotingSettings);

/* MARKDOWN
Returns:

```
{
  minDuration: 10000, // 10 seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"),
  votingMode: "Standard"
}
```
*/
