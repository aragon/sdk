/* MARKDOWN
### Create a Multisig context

Create a Multisig context to use the Multisig plugin throughout your application.
*/

import { Context, ContextPlugin } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { contextParams } from "../00-client/00-context";

// Create an Arago SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Update the Plugin configurations.
contextPlugin.set({ network: 1 });
contextPlugin.set({ signer: new Wallet("private-key") });
contextPlugin.setFull(contextParams);

console.log({ contextPlugin });
