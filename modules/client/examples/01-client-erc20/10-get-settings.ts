/* MARKDOWN
### Loading a plugin's settings
*/
import {
  ClientAddressList,
  Context,
  ContextPlugin,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an addres list client
const client = new ClientAddressList(contextPlugin);

const pluginAddress: string = "0x1234567890123456789012345678901234567890";

const settings: VotingSettings | null = await client.methods.getSettings(
  pluginAddress,
);
console.log(settings);
/*
  {
    minDuration: 7200,
    minParticipation: 0.55,
    supportThreshold: 0.25
  }
*/
