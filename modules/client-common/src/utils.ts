import { FunctionFragment, Interface } from "@ethersproject/abi";
import { id } from "@ethersproject/hash";
import { Log } from "@ethersproject/providers";
import { ContractReceipt } from "@ethersproject/contracts";
import { bytesToHex } from "@aragon/sdk-common";

export function findLog(
  receipt: ContractReceipt,
  iface: Interface,
  eventName: string,
): Log | undefined {
  return receipt.logs.find(
    (log) =>
      log.topics[0] ===
        id(
          iface.getEvent(eventName).format(
            "sighash",
          ),
        ),
  );
}

export function getFunctionFragment(
  data: Uint8Array,
  availableFunctions: string[],
): FunctionFragment {
  const hexBytes = bytesToHex(data);
  const iface = new Interface(availableFunctions);
  return iface.getFunction(hexBytes.substring(0, 10));
}
