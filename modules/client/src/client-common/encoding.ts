import { bytesToHex } from "@aragon/sdk-common";
import { FunctionFragment, Interface } from "@ethersproject/abi";

export function getFunctionFragment(
  data: Uint8Array,
  availableFunctions: string[]
): FunctionFragment {
  const hexBytes = bytesToHex(data, true);
  const inter = new Interface(availableFunctions);
  return inter.getFunction(hexBytes.substring(0, 10));
}
