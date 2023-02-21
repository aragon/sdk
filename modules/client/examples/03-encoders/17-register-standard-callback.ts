/* MARKDOWN
### Register a new standard callback
*/
import { Client, Context, ContextPlugin } from "@aragon/sdk-client";
import { RegisterStandardCallbackParams } from "../../dist/interfaces";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new Client(contextPlugin);

const registerStandardCallbackParaqms: RegisterStandardCallbackParams = {
  interfaceId: "0xaaaaaaaa",
  callbackSelector: "0xaaaaaaab",
  magicNumber: "0xaaaaaaac",
};

const daoAddressOrEns = "0x123123123123123123123123123123123123";
const action = client.encoding.registerStandardCallbackAction(
  daoAddressOrEns,
  registerStandardCallbackParaqms,
);
console.log(action);
/*
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
  */
