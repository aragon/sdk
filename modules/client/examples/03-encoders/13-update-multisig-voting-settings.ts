/* MARKDOWN
### Remove Members (Multisig)
*/
import {
  Context,
  ContextPlugin,
  MultisigClient,
  UpdateMultisigVotingSettingsParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new MultisigClient(contextPlugin);

const updateMinApprovals: UpdateMultisigVotingSettingsParams = {
  votingSettings: {
    minApprovals: 2,
    onlyListed: false,
  },
  pluginAddress: "0x0987654321098765432109876543210987654321",
};
const action = client.encoding.updateMultisigVotingSettings(updateMinApprovals);
console.log(action);
/*
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
*/
