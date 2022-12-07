import { DAO__factory } from "@aragon/core-contracts-ethers";
import { IMetadata } from "../interfaces";

export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  DAO__factory.createInterface().getFunction("withdraw").format("minimal"),
  DAO__factory.createInterface().getFunction("setMetadata").format("minimal"),
  DAO__factory.createInterface().getFunction("revoke").format("minimal"),
  DAO__factory.createInterface().getFunction("grant").format("minimal"),
  DAO__factory.createInterface().getFunction("freeze").format("minimal"),
];

export const UNSUPPORTED_DAO_METADATA_LINK: IMetadata = {
  name: "Unsupported metadata link",
  description: "Unsupported metadata link",
  links: [],
};

export const UNAVAILABLE_DAO_METADATA_LINK: IMetadata = {
  name: "Unavailable metadata link",
  description: "Unavailable metadata link",
  links: [],
};
