/* MARKDOWN
### Set Plugin Config (ERC-20)
*/
import {
  ClientErc20,
  Context,
  ContextPlugin,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new ClientErc20(contextPlugin);

// create config action
const configActionPrarms: VotingSettings = {
  minDuration: 60 * 60 * 24,
  supportThreshold: 0.3, // 30%
  minParticipation: 0.5, // 50%
};

const pluginAddress = "0x1234567890123456789012345678901234567890";

const configAction = client.encoding.updateVotingSettingsAction(
  pluginAddress,
  configActionPrarms,
);
console.log(configAction);
