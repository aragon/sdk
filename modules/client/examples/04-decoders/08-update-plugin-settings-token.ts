/* MARKDOWN
### Decode Update Plugin Settings Action (TokenVoting)
*/
import {
  TokenVotingClient,
  Context,
  ContextPlugin,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const clientToken = new TokenVotingClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const params: VotingSettings = clientToken.decoding
  .updatePluginSettingsAction(data);

console.log(params);
/*
{
  minDuration: 7200, // seconds
  minTurnout: 0.25, // 25%
  minSupport: 0.5 // 50%
}
*/
