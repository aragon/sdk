/* MARKDOWN
### Decode update plugin settings action (Address List)
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  VotingSettings,
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const clientAddressList = new AddresslistVotingClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const params: VotingSettings = clientAddressList.decoding
  .updatePluginSettingsAction(data);

console.log(params);

/*
{
  minDuration: 7200, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("1")
}
*/
