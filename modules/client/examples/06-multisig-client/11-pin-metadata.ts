/* MARKDOWN
### Add and pin metadata for the Multisig plugin

Adds an pin data with a the format used by aragon app into one of the specified IPFS nodes and return a IPFS CID preceded by "ipfs://"
*/

import {
  Context,
  ContextPlugin,
  MultisigClient,
  ProposalMetadata,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin = ContextPlugin.fromContext(context);
// Creates a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const metadata: ProposalMetadata = {
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
const metadataUri = await multisigClient.methods.pinMetadata(metadata);
console.log({ metadataUri });

/*
```javascript
  "ipfs://Qm..."
```
*/
