/* MARKDOWN
---
title: Update Token Voting Settings
---

## Update the Token Voting Plugin Settings

Updates the configuration of a given TokenVoting plugin for a DAO.

### Encoding
*/

import { DaoAction, VotingMode, VotingSettings } from "@aragon/sdk-client";
import { tokenVotingClient } from "./index";

// The new configuration parameters for the plugin
const params: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.STANDARD, // default standard, otherwise EARLY_EXECUTION or VOTE_REPLACEMENT
};

const pluginAddress: string = "0x1234567890123456789012345678901234567890"; // the address of the TokenVoting plugin contract installed in the DAO

// Updates the configuration of a TokenVoting plugin for a DAO.
const action: DaoAction = tokenVotingClient.encoding.updatePluginSettingsAction(
  pluginAddress,
  params,
);
console.log({ action });

/* MARKDOWN
Returns:

```
{ action:
  {
    to: "0x1234567890...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
}
```

### Decoding
*/

// Decodes the parameters of an update plugin settings action.
const decodedParams: VotingSettings = tokenVotingClient
  .decoding.updatePluginSettingsAction(action.data);
console.log({ decodedParams });

/* MARKDOWN
Returns:

```
{ decodedParams:
  {
    minDuration: 7200, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000")
  }
}
```
*/
