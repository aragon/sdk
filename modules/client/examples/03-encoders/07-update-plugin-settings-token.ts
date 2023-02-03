/* MARKDOWN
### Updates the configuration of a TokenVoting plugin for a DAO.

This action is used to set a new configuration of a TokenVoting plugin for a DAO.
*/

import {
  Context,
  ContextPlugin,
  TokenVotingClient,
  VotingMode,
  VotingSettings
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Creates an Aragon SDK context.
const context: Context = new Context(contextParams);
// Creates a plugin context from the Aragon SDK.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

// The new configuration parameters for the plugin
const configActionPrarms: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.STANDARD, // default standard
};

const pluginAddress: string = "0x1234567890123456789012345678901234567890";

// Updates the configuration of a TokenVoting plugin for a DAO.
const configAction = tokenVotingClient.encoding.updatePluginSettingsAction(pluginAddress, configActionPrarms);
console.log({ configAction });
