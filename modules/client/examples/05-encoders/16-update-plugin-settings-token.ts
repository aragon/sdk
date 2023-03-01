/* MARKDOWN
### Token Voting Encoders

#### Update plugin settings (TokenVoting)

Updates the configuration of a given TokenVoting plugin for a DAO.
*/

import {
  ContextPlugin,
  DaoAction,
  TokenVotingClient,
  VotingMode,
  VotingSettings
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiates a plugin context from the Aragon OSx SDK context.
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

const pluginAddress: string = "0x1234567890123456789012345678901234567890"; // the address of the TokenVoting plugin contract installed in the DAO

// Updates the configuration of a TokenVoting plugin for a DAO.
const updatePluginSettingsAction: DaoAction = tokenVotingClient.encoding.updatePluginSettingsAction(pluginAddress, configActionPrarms);
console.log({ updatePluginSettingsAction });
