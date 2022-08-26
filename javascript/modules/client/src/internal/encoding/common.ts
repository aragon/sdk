import { bytesToHex } from "@aragon/sdk-common";
import { FunctionFragment } from "@ethersproject/abi";
import { Interface } from 'ethers/lib/utils'
import { AVAILABLE_FUNCTIONS_ARRAY } from "../constants/encoding";

export function getFunctionFragment(data: Uint8Array): FunctionFragment {
  const hexBytes = bytesToHex(data, true)
  const inter = new Interface(AVAILABLE_FUNCTIONS_ARRAY)
  return inter.getFunction(hexBytes.substring(0, 10))
}