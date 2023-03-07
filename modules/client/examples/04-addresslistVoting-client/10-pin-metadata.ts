/* MARKDOWN
### Add and pin metadata

Adds and pin data into one of the specified IPFS nodes and return a IPFS CID preceded by "ipfs://".
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  ProposalMetadata
} from "@aragon/sdk-client";
import { context } from "../01-client/index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an AddresslistVoting plugin client.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const proposalMetadata: ProposalMetadata = {
  title: "Test Proposal",
  summary: "This is a short description",
  description: "This is a long description",
  resources: [
    {
      name: "Discord",
      url: "https://discord.com/..."
    },
    {
      name: "Website",
      url: "https://website..."
    },
  ],
  media: {
    logo: "https://...",
    header: "https://..."
  },
};

const proposalMetadataUri: string = await addresslistVotingClient.methods.pinMetadata(proposalMetadata);
console.log({ proposalMetadataUri });

/* MARKDOWN
```javascript
  { proposalMetadataUri: ipfs://Qm... }
```
*/
