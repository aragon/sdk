/* MARKDOWN
### Loading the list of members (multisig plugin)
*/
import {
  Context,
  ContextPlugin,
  MultisigClient,
  MultisigVotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);

const daoAddressorEns = "0x12345...";

const settings: MultisigVotingSettings = await client.methods
  .getVotingSettings(daoAddressorEns);
console.log(settings);
/*
{
  votingSettings: {
    minApprovals: 4,
    onlyListed: true
  }
}
*/
