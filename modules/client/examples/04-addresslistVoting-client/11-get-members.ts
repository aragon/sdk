/* MARKDOWN
---
title: Get Members
---

## Get DAO Members Introduced by the Addresslist Voting Plugin

Gets an array of all addresses able to vote in a specific AddresslistVoting DAO proposal.
*/

import { AddresslistVotingClient } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiates a plugin context from the Aragon OSx SDK context.

// Instantiates an AddressList client.
const addresslistVotingClient: AddresslistVotingClient =
  new AddresslistVotingClient(context);

const daoPluginAddress = "0x12345382947301297439127433492834"; // The address of the plugin that DAO has installed. You can find this by calling `getDao(daoAddress)` and getting the DAO details .

const members: string[] = await addresslistVotingClient.methods.getMembers(
  { pluginAddress: daoPluginAddress },
);
console.log({ members });

/* MARKDOWN
Returns:

```json
[
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123",
  "0x5678901234567890123456789012345678901234"
]
```
*/
