/* MARKDOWN
### Loading the a proposal by proposalId (admin plugin)
*/
import {
  AdminProposal,
  ClientAdmin,
  Context,
  ContextPlugin,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an ERC20 client
const client = new ClientAdmin(contextPlugin);

const proposalId = "0x12345...";

const proposal: AdminProposal | null = await client.methods.getProposal(
  proposalId,
);
console.log(proposal);
/*
{
  id: "0x12345...",
  dao: {
    address: "0x1234567890123456789012345678901234567890",
    name: "Cool DAO"
  };
  creatorAddress: "0x1234567890123456789012345678901234567890",
  metadata: {
    title: "Test Proposal",
    summary: "test proposal summary",
    description: "this is a long description",
    resources: [
      {
        url: "https://dicord.com/...",
        name: "Discord"
      },
      {
        url: "https://docs.com/...",
        name: "Document"
      }
    ],
    media: {
      header: "https://.../image.jpeg",
      logo: "https://.../image.jpeg"
    }
  };
  creationDate: <Date>,
  actions: [
    {
      to: "0x12345..."
      value: 10n
      data: [12,13,154...]
    }
  ],
  status: "Executed",
  adminAddress: "0x1234567890123456789012345678901234567890"
  pluginAddress: "0x1234567890123456789012345678901234567890"
  proposalId: 0n
}
*/
