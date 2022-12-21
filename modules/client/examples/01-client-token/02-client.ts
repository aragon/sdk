/* MARKDOWN
### Create an Token client
*/
import { ClientToken, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

const client = new ClientToken(contextPlugin);

console.log(client);
