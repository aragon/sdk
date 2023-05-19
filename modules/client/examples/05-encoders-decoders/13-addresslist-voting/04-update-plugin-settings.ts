/* MARKDOWN
---
title: Update Addresslist Voting Settings
---

## Update the Addresslist Voting Plugin Settings

Updates the settings of a given AddresslistVoting plugin.

### Encoding
*/

import { DaoAction, VotingMode, VotingSettings } from "@aragon/sdk-client";
import { addresslistVotingClient } from "./index";

// The action object for updating the plugin settings.
const params: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.STANDARD, // default STANDARD, otherwise EARLY_EXECUTION or VOTE_REPLACEMENT
};

const pluginAddress: string = "0x1234567890123456789012345678901234567890"; // the address of the AddresslistVoting plugin contract installed in the DAO

const action: DaoAction = addresslistVotingClient.encoding
  .updatePluginSettingsAction(pluginAddress, params);
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

const decodedParams: VotingSettings = addresslistVotingClient.decoding
  .updatePluginSettingsAction(action.data);
console.log({ decodedParams });

/* MARKDOWN
Returns:

```json
{ decodedParams:
  {
    minDuration: 7200, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("1")
  }
}
```
*/
