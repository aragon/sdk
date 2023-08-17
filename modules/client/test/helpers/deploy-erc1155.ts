import { Client } from "../../src";
import { contextParamsLocalChain } from "../integration/constants";
import { Context } from "@aragon/sdk-client-common";
import { ContractFactory } from "@ethersproject/contracts";
import {
  abi as ERC1155_ABI,
  bytecode as ERC1155_ABI_BYTECODE,
} from "@openzeppelin/contracts/build/contracts/ERC1155PresetMinterPauser.json";

export async function deployErc1155() {
  const client = new Client(new Context(contextParamsLocalChain));
  const signer = client.web3.getConnectedSigner();

  // the bytecode automatically mints 10 of tokenID 0 to the deployer
  const factory = new ContractFactory(
    ERC1155_ABI,
    ERC1155_ABI_BYTECODE,
    signer,
  );
  const contract = await factory.deploy("https://example.org/{id}.json");
  await contract.mint(signer.getAddress(), 0, 10, "0x");
  await contract.mint(signer.getAddress(), 1, 10, "0x");
  await contract.mint(signer.getAddress(), 2, 10, "0x");
  return contract;
}
