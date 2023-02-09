/* MARKDOWN
### Add and pin metadata

Adds an pin data with a the format used by aragon app into one of the specified IPFS nodes and return a IPFS CID preceded by "ipfs://".
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  ProposalMetadata
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin = ContextPlugin.fromContext(context);
// Instantiate an AddresslistVoting plugin client.
const client = new AddresslistVotingClient(contextPlugin);

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
const proposalMetadataUri = await client.methods.pinMetadata(proposalMetadata);
console.log({ proposalMetadataUri });

/* MARKDOWN
```javascript
  ipfs://Qm...
```
*/
