/* MARKDOWN
## Context

The [Context](../../context.ts) class is an utility component that holds the
configuration passed to any [Client](../../client.ts) instance.

*/
import { Context } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { contextParams } from "../context";

// Instantiate
const context = new Context(contextParams);

// Update
context.set({ network: 1 });
context.set({ signer: new Wallet("other private key") });
context.setFull(contextParams);
