/* Header
## General purpose client

The [Client](./src/client.ts) class allows to perform operations that apply to
all DAO's, regardless of the plugins they use.

*/
/* Code */
import { Client, Context } from "@aragon/sdk-client";
import { contextParams } from "../constants";
// Can be stored in a singleton and inherited from there
const context: Context = new Context(contextParams);

const client = new Client(context);

console.log(client);
/* - */
