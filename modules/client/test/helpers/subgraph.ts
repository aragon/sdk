import { bytesToHex, DaoAction } from "@aragon/sdk-client-common";

export function toSubgraphAction(actions: DaoAction[]) {
  return actions.map((action) => {
    return {
      to: action.to,
      value: action.value.toString(),
      data: bytesToHex(action.data),
    };
  });
}
