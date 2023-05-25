/* MARKDOWN
---
title: Get Proposal
---

## Get a Multisig Proposal by Its ID

Get the proposal details of a given proposal made using the Multisig plugin.
*/

import {
  ContextPlugin,
  MultisigClient,
  MultisigProposal
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const proposalId: string = "0x1234567890123456789012345678901234567890_0x0";

const multisigProposal: MultisigProposal | null = await multisigClient.methods.getProposal(proposalId);
console.log(multisigProposal);

/* MARKDOWN
Returns:

```
{
  id: "0x1234567890123456789012345678901234567890_0x0",
  dao: {
    address: "0x1234567890123456789012345678901234567890",
    name: "Cool DAO"
  },
  creatorAddress: "0x1234567890123456789012345678901234567890",
  metadata: {
    title: "Test Proposal",
    summary: "Test Proposal Summary",
    description: "This is a long description",
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
  },
  creationDate: <Date>,
  actions: [
    {
      to: "0x12345..."
      value: 10n
      data: [12,13,154...]
    }
  ],
  status: "Executed",
  approvals: [
    "0x123456789123456789123456789123456789",
    "0x234567891234567891234567891234567890"
  ],
  potentiallyExecutable: <boolean>,
}
```
*/
