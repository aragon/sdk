import { ContractFactory } from "@ethersproject/contracts";
import { Client } from "../../src";
import { contextParamsLocalChain } from "../integration/constants";
import { Context } from "@aragon/sdk-client-common";
import {
  abi as ERC20_ABI,
  bytecode as ERC20_ABI_BYTECODE,
} from "@openzeppelin/contracts/build/contracts/ERC20PresetMinterPauser.json";

export async function deployErc20() {
  const client = new Client(new Context(contextParamsLocalChain));
  const signer = client.web3.getConnectedSigner();
  
  const factory = new ContractFactory(
    ERC20_ABI,
    ERC20_ABI_BYTECODE,
    client.web3.getConnectedSigner(),
  );
  const contract = await factory.deploy("Test", "TOK");
  await contract.mint(signer.getAddress(), "10000000000000000000");

  // If your contract requires constructor args, you can specify them here
  return contract;
}
