/* MARKDOWN
### Upgrade to and call action
*/
import { Client, Context, ContextPlugin } from "@aragon/sdk-client";
import { UpgradeToAndCallParams } from "../../dist/interfaces";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new Client(contextPlugin);

const upgradeToAndCallParams: UpgradeToAndCallParams = {
  implementationAddress: "0x1234567890123456789012345678901234567890",
  data: new Uint8Array([10, 20, 130, 40]),
};
const daoAddressOrEns = "0x123123123123123123123123123123123123";
const action = client.encoding.upgradeToAndCallAction(
  daoAddressOrEns,
  upgradeToAndCallParams,
);
console.log(action);
/*
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
  */
