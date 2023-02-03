/* MARKDOWN
### Decode update plugin settings action for TokenVoting plugin

Decode the parameters of an update plugin settings action for the TokenVoting plugin.
*/

import {
  ContextPlugin,
  TokenVotingClient,
  VotingSettings
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a TokenVoting plugin client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of an update plugin settings action.
const decodeUpdateTokenVotingSettings: VotingSettings = tokenVotingClient.decoding.updatePluginSettingsAction(data);
console.log({ decodeUpdateTokenVotingSettings });

/* MARKDOWN
Returns:

```json
{
  minDuration: 7200, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000")
}
```
*/
