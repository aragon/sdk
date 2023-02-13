import { JsonRpcProvider } from "@ethersproject/providers";

export function mineBlock(provider: JsonRpcProvider) {
  return provider.send("evm_mine", []);
}

export function mineBlockWithTime(
  provider: JsonRpcProvider,
  targetDate: Date,
) {
  const val = Math.ceil(targetDate.getTime() / 1000);
  return provider.send("evm_mine", [
    `0x${val.toString(16)}`,
  ]);
}

export function mineBlockWithTimeOffset(
  provider: JsonRpcProvider,
  secondsForward: number,
) {
  const val = Math.ceil(Date.now() / 1000) + secondsForward;
  return provider.send("evm_mine", [
    `0x${val.toString(16)}`,
  ]);
}

// export function setNextBlockTimeOffset(
//   provider: JsonRpcProvider,
//   secondsForward: number,
// ) {
//   return provider.send("evm_increaseTime", [
//     `0x${secondsForward.toString(16)}`,
//   ]);
// }

export function restoreBlockTime(provider: JsonRpcProvider) {
  return mineBlockWithTime(provider, new Date());
}

export async function getBlockTime(provider: JsonRpcProvider) {
  const blockNumber = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNumber);
  return new Date(block.timestamp * 1000);
}
