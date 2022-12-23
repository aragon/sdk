/* MARKDOWN
### Loading the list of members (multisig plugin)
*/
import {
  Context,
  ContextPlugin,
  MultisigClient,
  MultisigPluginSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);

const daoAddressorEns = "0x12345...";

const settings: MultisigPluginSettings = await client.methods
  .getPluginSettings(daoAddressorEns);
console.log(settings);
/*
{
  members: [
    "0x1234567890123456789012345678901234567890",
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012",
    "0x4567890123456789012345678901234567890123",
    "0x5678901234567890123456789012345678901234",
  ],
  minApprovals: 4
*/
