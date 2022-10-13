/* MARKDOWN
### Decode Update Plugin Settings Action (ERC-20)
*/
import {
  ClientErc20,
  Context,
  ContextPlugin,
  IPluginSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const clientAddressList = new ClientErc20(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const params: IPluginSettings = clientAddressList.decoding
  .updatePluginSettingsAction(data);

console.log(params);
/*
{
  minDuration: 7200, // seconds
  minTurnout: 0.25, // 25%
  minSupport: 0.5 // 50%
}
*/
