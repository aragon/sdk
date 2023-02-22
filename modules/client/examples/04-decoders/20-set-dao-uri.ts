/* MARKDOWN
### Decode set Dao Uri action
*/
import { Client, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new Client(contextPlugin);
const decodedAction = client.decoding.setDaoUriAction(
  new Uint8Array([0, 10, 20, 30]),
);
console.log(decodedAction);
/*
  "https://the.dao.uri"
*/
