/* MARKDOWN
### Create an Address List client
*/
import { ClientAddressList, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../context";

const context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

const client = new ClientAddressList(contextPlugin);

console.log(client);
