/* MARKDOWN
### Loading a plugin's settings
*/
import {
  ClientAddressList,
  Context,
  ContextPlugin,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an addres list client
const client = new ClientAddressList(contextPlugin);

const pluginAddress: string = "0x1234567890123456789012345678901234567890";

const settings: VotingSettings | null = await client.methods.getVotingSettings(
  pluginAddress,
);
console.log(settings);
/*
  {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: "Standard",
  }
*/
