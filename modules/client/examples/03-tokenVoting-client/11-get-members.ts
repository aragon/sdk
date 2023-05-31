/* MARKDOWN
---
title: Get Members
---

## Get DAO Members Introduced by the Token Voting Plugin

Returns an array with the addresses of all the members of a specific DAO which has the TokenVoting plugin installed.
*/

import { TokenVotingClient, TokenVotingMember } from "@aragon/sdk-client";
import { context } from "../index";

// Create a TokenVoting client
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  context,
);

const pluginAddress: string = "0x12345384572394756239846529574932532985"; //  The address of the plugin that DAO has installed. You can find this by calling `getDao(daoAddress)` and getting the DAO details .

const members: TokenVotingMember[] = await tokenVotingClient.methods.getMembers(
  pluginAddress,
);
console.log(members);

/* MARKDOWN
Returns:

```json
[
  {
    "address": "0x1234567890123456789012345678901234567890",
    "balance": 100n,
    "delegatee": "0x2345678901234567890123456789012345678901",
    "votingPower": 0n,
    "delegators": []
  },
  {
    "address": "0x2345678901234567890123456789012345678901",
    "balance": 0n,
    "delegatee": null,
    "votingPower": 100n,
    "delegators": [
      {
        "address": "0x1234567890123456789012345678901234567890",
        "balance": 100n
      }
    ]
  },
  {
    "address": "0x3456789012345678901234567890123456789012",
    "balance": 200n,
    "delegatee": null,
    "votingPower": 200n,
    "delegators": []
  }
]
```
*/
