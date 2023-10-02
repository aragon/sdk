import { DaoAction } from "@aragon/sdk-client-common";
import { bytesToHex } from "@aragon/sdk-common";

export function toSubgraphAction(actions: DaoAction[]) {
  return actions.map((action) => {
    return {
      to: action.to,
      value: action.value.toString(),
      data: bytesToHex(action.data),
    };
  });
}
