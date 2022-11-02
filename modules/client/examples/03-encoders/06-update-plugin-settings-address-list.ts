/* MARKDOWN
### Set Plugin Config (Address List)
*/
import {
  ClientAddressList,
  Context,
  ContextPlugin,
  IPluginSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new ClientAddressList(contextPlugin);

// create config action
const configActionPrarms: IPluginSettings = {
  minDuration: 60 * 60 * 24,
  minSupport: 0.3, // 30%
  minTurnout: 0.5, // 50%
};

const pluginAddress = "0x1234567890123456789012345678901234567890";

const configAction = client.encoding.updatePluginSettingsAction(
  pluginAddress,
  configActionPrarms,
);
console.log(configAction);
