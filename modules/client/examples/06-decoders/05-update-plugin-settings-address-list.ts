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
