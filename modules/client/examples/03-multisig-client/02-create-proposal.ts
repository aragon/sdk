/* MARKDOWN
### Create a Multisig proposal

Creates a proposal whose governance mechanism is the Multisig plugin and its defined configuration.
*/

import {
  Client,
  ContextPlugin,
  CreateMultisigProposalParams,
  IWithdrawParams,
  MultisigClient,
  ProposalCreationSteps,
  ProposalMetadata
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate an Aragon OSx SDK client.
const client: Client = new Client(context);
// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Insantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

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
  }
};

// Pins the metadata to IPFS and gets back an IPFS URI.
const metadataUri: string = await multisigClient.methods.pinMetadata(proposalMetadata);

const withdrawParams: IWithdrawParams = {
  recipientAddress: "0x1234567890123456789012345678901234567890", // address of the receiver of the transaction
  amount: BigInt(10),
  tokenAddress: "0x1234567890123456789012345678901234567890", // token's contract address
  reference: "test"
};

// Address of the DAO where the proposal will be created.
const daoAddress: string = "0x1234567890123456789012345678901234567890";

// Encodes the action of withdrawing assets from a given DAO's vault and transfers them over to the recipient address.
const withdrawAction = await client.encoding.withdrawAction(daoAddress, withdrawParams);

const proposalParams: CreateMultisigProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadataUri,
  actions: [withdrawAction] // optional - if left as an empty array, no action will be set for the proposal. the action needs to be encoded and will be executed once a proposal passes.
};

// Generates a proposal with the withdraw action as passed in the proposalParams.
const steps = multisigClient.methods.createProposal(proposalParams);

for await (const step of steps) {
  try {
    switch (step.key) {
      case ProposalCreationSteps.CREATING:
        console.log(step.txHash);
        break;
      case ProposalCreationSteps.DONE:
        console.log(step.proposalId);
        break;
    }
  } catch (err) {
    console.error({ err });
  }
}
