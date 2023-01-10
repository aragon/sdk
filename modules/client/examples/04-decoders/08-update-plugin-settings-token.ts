/* MARKDOWN
### Decode Update Plugin Settings Action (TokenVoting)
*/
import {
  Context,
  ContextPlugin,
  TokenVotingClient,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const tokenVotingClient = new TokenVotingClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const params: VotingSettings = tokenVotingClient.decoding
  .updatePluginSettingsAction(data);

console.log(params);
/*
{
  minDuration: 7200, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000")
}
*/
