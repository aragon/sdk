/* MARKDOWN
### Create an Multisig client

Creating a multisig client allows you to access the Multisig plugin from your DAO.
*/

import { Context, ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Creates a Multisig plugin client.
const multisigClient: MultisigClient= new MultisigClient(contextPlugin);
console.log({ multisigClient });
