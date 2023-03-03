/* MARKDOWN
### Create an Address List context

Creates the context for an Addresslist plugin to be able to call on its functions.
*/

import { ContextPlugin } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { context, contextParams } from "../01-client/01-getting-started";

// Create a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Update the context plugin.
contextPlugin.set({ network: 1 });
contextPlugin.set({ signer: new Wallet("other private key") });
contextPlugin.setFull(contextParams);

console.log({ contextPlugin });
