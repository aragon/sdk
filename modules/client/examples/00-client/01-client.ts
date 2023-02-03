/* MARKDOWN
## SDK Client

The [Client](./src/client.ts) class allows you to perform operations that apply to
all DAOs, regardless of the plugins they use.

The general purpose `Client` is how we're able to use the general-purpose functions from the SDK.
We also have clients for each plugin, which allow us to use the plugin-specific functions.

*/
import { Client, Context } from "@aragon/sdk-client";
import { contextParams } from "./00-context";

// Can be stored in a singleton and inherited from there. Can also be stored in a context hook.
const context: Context = new Context(contextParams);
const client: Client = new Client(context);

console.log({ client });
