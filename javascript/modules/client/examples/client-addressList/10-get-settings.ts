/*
### Loading a plugin's settings
*/
import {
  ClientErc20,
  Context,
  ContextPlugin,
  IPluginSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an ERC20 client
const client = new ClientErc20(contextPlugin);

const pluginAddress: string = "0x1234567890123456789012345678901234567890";

const settings: IPluginSettings | null = await client.methods.getSettings(
  pluginAddress,
);
console.log(settings);
/*
  {
    minDuration: 7200,
    minTurnout: 0.55,
    minSupport: 0.25
  }
*/
