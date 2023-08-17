import { Client } from "../../src";
import { contextParamsLocalChain } from "../integration/constants";
import { Context } from "@aragon/sdk-client-common";
import { ContractFactory } from "@ethersproject/contracts";
import {
  abi as ERC721_ABI,
  bytecode as ERC721_ABI_BYTECODE,
} from "@openzeppelin/contracts/build/contracts/ERC721PresetMinterPauserAutoId.json";

export async function deployErc721() {
  const client = new Client(new Context(contextParamsLocalChain));
  const signer = client.web3.getConnectedSigner();
  // the bytecode automatically mints tokenID 0 to the deployer
  const factory = new ContractFactory(
    ERC721_ABI,
    ERC721_ABI_BYTECODE,
    signer,
  );
  const contract = await factory.deploy(
    "Test NFT",
    "TNFT",
    "https://example.org/metadata.json",
  );
  await contract.mint(signer.getAddress());
  return contract;
}
