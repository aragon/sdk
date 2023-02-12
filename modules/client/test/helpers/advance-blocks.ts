import { EthereumProvider } from "ganache";

export async function advanceBlocks(
  provider: EthereumProvider,
  amountOfBlocks: number,
) {
  for (let i = 0; i < amountOfBlocks; i++) {
    await provider.send("evm_mine", []);
  }
}
