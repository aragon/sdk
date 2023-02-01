import { DAO__factory } from "@aragon/core-contracts-ethers";
import { DaoMetadata } from "../interfaces";

export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  DAO__factory.createInterface().getFunction("setMetadata").format("minimal"),
  DAO__factory.createInterface().getFunction("grant").format("minimal"),
  DAO__factory.createInterface().getFunction("grantWithCondition").format("minimal"),
  DAO__factory.createInterface().getFunction("revoke").format("minimal"),
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

export const UNAVAILABLE_DAO_METADATA: DaoMetadata = {
  name: "(unavailable metadata)",
  description: "(the DAO metadata is not available)",
  links: [],
};
