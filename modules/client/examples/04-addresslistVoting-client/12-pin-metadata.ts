/* MARKDOWN
---
title: Pin Metadata
---

## Add and Pin Metadata

Adds and pin data into one of the specified IPFS nodes and return a IPFS CID preceded by "ipfs://".
*/

import { AddresslistVotingClient } from "@aragon/sdk-client";
import { ProposalMetadata } from "@aragon/sdk-client-common";
import { context } from "../index";

// Instantiate an AddresslistVoting plugin client.
const addresslistVotingClient: AddresslistVotingClient =
  new AddresslistVotingClient(context);

const proposalMetadata: ProposalMetadata = {
  title: "Test Proposal",
  summary: "This is a short description",
  description: "This is a long description",
  resources: [
    {
      name: "Discord",
      url: "https://discord.com/...",
    },
    {
      name: "Website",
      url: "https://website...",
    },
  ],
  media: {
    logo: "https://...",
    header: "https://...",
  },
};

const proposalMetadataUri: string = await addresslistVotingClient.methods
  .pinMetadata(proposalMetadata);
console.log(proposalMetadataUri);

/* MARKDOWN
```javascript
"ipfs://Qm..."
```
*/
