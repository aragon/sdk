/* MARKDOWN
### Create a Plugin Context

In order to interact with any plugin within our SDK, you first have to create a `ContextPlugin` which will then have `Client`s for each of the plugins.
*/
import { Context, ContextPlugin } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);

// In order to interact with the plugins, you need to create a `ContextPlugin` which will allow you to then generate the clients for any plugin you want to interact with.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Update the context with new parameters if you wish to throughout your app.
contextPlugin.set({ network: 1 });
contextPlugin.set({ signer: new Wallet("other private key") });
contextPlugin.setFull(contextParams);

console.log({ contextPlugin });
