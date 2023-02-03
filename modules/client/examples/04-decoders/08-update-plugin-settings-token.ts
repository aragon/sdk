/* MARKDOWN
### Decode update plugin settings action for TokenVoting plugin


*/
import {
  Context,
  ContextPlugin,
  TokenVotingClient,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Creates an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Creates a TokenVoting plugin client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of an update plugin settings action.
const decodeUpdateTokenVotingSettings: VotingSettings = tokenVotingClient.decoding.updatePluginSettingsAction(data);
console.log({ decodeUpdateTokenVotingSettings });

/*
Returns:
```json
{
  minDuration: 7200,
  minParticipation: 0.25,
  supportThreshold: 0.5, 
  minProposerVotingPower: BigInt("5000")
}
```
*/
