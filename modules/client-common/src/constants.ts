import { ProposalMetadata } from "./types";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

/** Timeout that will be applied to operations involving
 * many fetch requests that could take a long time */
export const MULTI_FETCH_TIMEOUT = 7 * 1000;

export const UNSUPPORTED_PROPOSAL_METADATA_LINK: ProposalMetadata = {
  title: "(unsupported metadata link)",
  summary: "(the link to the metadata is not supported)",
  description: "(the link to the metadata is not supported)",
  resources: [],
};
export const EMPTY_PROPOSAL_METADATA_LINK: ProposalMetadata = {
  title: "(the proposal has no metadata)",
  summary: "(the current proposal does not have any content defined)",
  description: "(the current proposal does not have any content defined)",
  resources: [],
};
export const UNAVAILABLE_PROPOSAL_METADATA: ProposalMetadata = {
  title: "(unavailable metadata)",
  summary: "(the proposal metadata is not available)",
  description: "(the proposal metadata is not available)",
  resources: [],
};

export const IPFS_ENDPOINTS = {
  prod: [
    {
      url: "https://prod.ipfs.aragon.network/api/v0",
      headers: {
        "X-API-KEY": "b477RhECf8s8sdM7XrkLBs2wHc4kCMwpbcFC55Kt",
      },
    },
  ],
  test: [
    {
      url: "https://test.ipfs.aragon.network/api/v0",
      headers: {
        "X-API-KEY": "b477RhECf8s8sdM7XrkLBs2wHc4kCMwpbcFC55Kt",
      },
    },
  ],
};

const Permissions = {
  UPGRADE_PERMISSION: "UPGRADE_PERMISSION",
  UPGRADE_PLUGIN_PERMISSION: "UPGRADE_PLUGIN_PERMISSION",
  SET_METADATA_PERMISSION: "SET_METADATA_PERMISSION",
  EXECUTE_PERMISSION: "EXECUTE_PERMISSION",
  WITHDRAW_PERMISSION: "WITHDRAW_PERMISSION",
  SET_SIGNATURE_VALIDATOR_PERMISSION: "SET_SIGNATURE_VALIDATOR_PERMISSION",
  SET_TRUSTED_FORWARDER_PERMISSION: "SET_TRUSTED_FORWARDER_PERMISSION",
  ROOT_PERMISSION: "ROOT_PERMISSION",
  CREATE_VERSION_PERMISSION: "CREATE_VERSION_PERMISSION",
  REGISTER_PERMISSION: "REGISTER_PERMISSION",
  REGISTER_DAO_PERMISSION: "REGISTER_DAO_PERMISSION",
  REGISTER_ENS_SUBDOMAIN_PERMISSION: "REGISTER_ENS_SUBDOMAIN_PERMISSION",
  MINT_PERMISSION: "MINT_PERMISSION",
  MERKLE_MINT_PERMISSION: "MERKLE_MINT_PERMISSION",
  MODIFY_ALLOWLIST_PERMISSION: "MODIFY_ALLOWLIST_PERMISSION",
  SET_CONFIGURATION_PERMISSION: "SET_CONFIGURATION_PERMISSION",
};

const PermissionIds = Object.entries(Permissions).reduce(
  (acc, [k, v]) => ({ ...acc, [k + "_ID"]: keccak256(toUtf8Bytes(v)) }),
  {} as { [k: string]: string },
);
Object.freeze(Permissions);
export { Permissions };
Object.freeze(PermissionIds);
export { PermissionIds };
export const IPFS_CID_REGEX =
  /^((Qm[1-9A-HJ-NP-Za-km-z]{44,})|(b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,})|(z[1-9A-HJ-NP-Za-km-z]{48,})|(F[0-9A-F]{50,}))$/;

export const IPFS_URI_REGEX =
  /^ipfs:\/\/((Qm[1-9A-HJ-NP-Za-km-z]{44,})|(b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,})|(z[1-9A-HJ-NP-Za-km-z]{48,})|(F[0-9A-F]{50,}))$/;
export const OSX_PROPOSAL_ID_REGEX =
  /^(0x[A-Fa-f0-9]{40})_(0x[A-Fa-f0-9]{1,64})$/;
export const HEX_STRING_REGEX = /^(0x)?[0-9a-fA-F]*$/;
export const ENS_REGEX = /^(?:[a-z0-9-]+\.)*[a-z0-9-]+\.eth$/;
export const SUBDOMAIN_REGEX = /^[a-z0-9-]+$/;
