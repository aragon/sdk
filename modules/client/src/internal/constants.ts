import { DAO__factory } from "@aragon/osx-ethers";
import { AddressZero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { DaoMetadata } from "../interfaces";
import { erc20ContractAbi } from "./abi/erc20";

export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  new Contract(AddressZero, erc20ContractAbi).interface.getFunction("transfer").format("minimal"),
  DAO__factory.createInterface().getFunction("grant").format("minimal"),
  DAO__factory.createInterface().getFunction("grantWithCondition").format("minimal"),
  DAO__factory.createInterface().getFunction("revoke").format("minimal"),
  DAO__factory.createInterface().getFunction("setMetadata").format("minimal"),
  DAO__factory.createInterface().getFunction("setDaoURI").format("minimal"),
  DAO__factory.createInterface().getFunction("registerStandardCallback").format("minimal"),
  DAO__factory.createInterface().getFunction("setSignatureValidator").format("minimal"),
  DAO__factory.createInterface().getFunction("upgradeTo").format("minimal"),
  DAO__factory.createInterface().getFunction("upgradeToAndCall").format("minimal"),
];

export const UNSUPPORTED_DAO_METADATA_LINK: DaoMetadata = {
  name: "(unsupported metadata link)",
  description: "(the metadata link is not supported)",
  links: [],
};
export const EMPTY_DAO_METADATA_LINK: DaoMetadata = {
  name: "(the DAO has no metadata)",
  description: "(the DAO did not define any content)",
  links: [],
};

export const UNAVAILABLE_DAO_METADATA: DaoMetadata = {
  name: "(unavailable metadata)",
  description: "(the DAO metadata is not available)",
  links: [],
};
