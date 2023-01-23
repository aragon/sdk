/* MARKDOWN
### Add and pin metadata
Adds an pin data with a the format used by aragon app into one of the specified IPFS nodes and return a ipfs cid preceded by ipfs://

*/
import {
  TokenVotingClient,
  Context,
  ContextPlugin,
  ProposalMetadata,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin = ContextPlugin.fromContext(context);
const client = new TokenVotingClient(contextPlugin);
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
const metadataUri = await client.methods.pinMetadata(metadata);
console.log(metadataUri);

/*
  ipfs://Qm...
*/
