/* MARKDOWN
### Update plugin settings (TokenVoting)

Updates the configuration of a given TokenVoting plugin for a DAO.
*/

import {
  ContextPlugin,
  TokenVotingClient,
  VotingMode,
  VotingSettings
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiates a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

// The new configuration parameters for the plugin
const configActionPrarms: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.STANDARD, // default standard, otherwise EARLY_EXECUTION or VOTE_REPLACEMENT
};

const pluginAddress: string = "0x1234567890123456789012345678901234567890"; // the address of the plugin contract itself

// Updates the configuration of a TokenVoting plugin for a DAO.
const configAction = tokenVotingClient.encoding.updatePluginSettingsAction(pluginAddress, configActionPrarms);
console.log({ configAction });
