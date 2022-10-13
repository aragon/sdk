/* MARKDOWN
### Create an ERC20 context
*/
import { Context, ContextPlugin } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { contextParams } from "../context";

const context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// update
contextPlugin.set({ network: 1 });
contextPlugin.set({ signer: new Wallet("other private key") });
contextPlugin.setFull(contextParams);

console.log(contextPlugin)
