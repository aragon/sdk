/* MARKDOWN
### Add and pin metadata

Adds and pins data with the format needed by the Aragon App into one of the specified IPFS nodes and return an IPFS CID preceded by "ipfs://"

*/
import {
  TokenVotingClient,
  Context,
  ContextPlugin,
  ProposalMetadata,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const metadata: ProposalMetadata = {
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

// Pin the metadata in IPFS to get back the URI.
const metadataUri = await tokenVotingClient.methods.pinMetadata(metadata);
console.log({ metadataUri });

/*
```javascript
  "ipfs://Qm..."
```
*/
