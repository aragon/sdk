import {
  DAO__factory,
  PluginSetupProcessor__factory,
} from "@aragon/osx-ethers";
import { AddressZero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import {
  DaoMetadata,
  PluginRepoBuildMetadata,
  PluginRepoReleaseMetadata,
} from "../types";
import { defaultAbiCoder } from "@ethersproject/abi";
import { keccak256 } from "@ethersproject/keccak256";
import { abi as ERC20_ABI } from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { abi as ERC721_ABI } from "@openzeppelin/contracts/build/contracts/ERC721.json";
import { ProposalActionTypes } from "./types";

export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  new Contract(AddressZero, ERC20_ABI).interface.getFunction("transfer")
    .format("minimal"),
  new Contract(AddressZero, ERC721_ABI).interface.getFunction(
    "safeTransferFrom(address,address,uint256)",
  )
    .format("minimal"),
  DAO__factory.createInterface().getFunction("grant").format("minimal"),
  DAO__factory.createInterface().getFunction("grantWithCondition").format(
    "minimal",
  ),
  DAO__factory.createInterface().getFunction("revoke").format("minimal"),
  DAO__factory.createInterface().getFunction("setMetadata").format("minimal"),
  DAO__factory.createInterface().getFunction("setDaoURI").format("minimal"),
  DAO__factory.createInterface().getFunction("registerStandardCallback").format(
    "minimal",
  ),
  DAO__factory.createInterface().getFunction("setSignatureValidator").format(
    "minimal",
  ),
  DAO__factory.createInterface().getFunction("upgradeTo").format("minimal"),
  DAO__factory.createInterface().getFunction("upgradeToAndCall").format(
    "minimal",
  ),
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
export const UNSUPPORTED_RELEASE_METADATA_LINK: PluginRepoReleaseMetadata = {
  name: "(unsupported metadata link)",
  description: "(the metadata link is not supported)",
  images: {},
};
export const EMPTY_RELEASE_METADATA_LINK: PluginRepoReleaseMetadata = {
  name: "(the release has no metadata)",
  description: "(the release did not define any content)",
  images: {},
};

export const UNAVAILABLE_RELEASE_METADATA: PluginRepoReleaseMetadata = {
  name: "(unavailable metadata)",
  description: "(the release metadata is not available)",
  images: {},
};

export const UNSUPPORTED_BUILD_METADATA_LINK: PluginRepoBuildMetadata = {
  ui: "",
  change: "(unsupported metadata link)",
  pluginSetup: {
    prepareInstallation: [],
    prepareUninstallation: [],
    prepareUpdate: [],
  },
};
export const EMPTY_BUILD_METADATA_LINK: PluginRepoBuildMetadata = {
  ui: "",
  change: "(the build has no metadata)",
  pluginSetup: {
    prepareInstallation: [],
    prepareUninstallation: [],
    prepareUpdate: [],
  },
};

export const UNAVAILABLE_BUILD_METADATA: PluginRepoBuildMetadata = {
  ui: "",
  change: "(unavailable metadata)",
  pluginSetup: {
    prepareInstallation: [],
    prepareUninstallation: [],
    prepareUpdate: [],
  },
};

export enum SupportedPluginRepo {
  ADMIN = "admin",
  MULTISIG = "multisig",
  TOKEN_VOTING = "token-voting",
  ADDRESS_LIST_VOTING = "address-list-voting",
}

export const SupportedPluginRepoArray = Object.values(SupportedPluginRepo);

export const ZERO_BYTES_HASH = keccak256(
  defaultAbiCoder.encode(
    ["bytes32"],
    ["0x0000000000000000000000000000000000000000000000000000000000000000"],
  ),
);

export enum PreparationType {
  NONE = 0,
  INSTALLATION = 1,
  UPDATE = 2,
  UNINSTALLATION = 3,
}

export const UPDATE_PLUGIN_SIGNATURES: string[] = [
  DAO__factory.createInterface().getFunction("grant")
    .format("minimal"),
  DAO__factory.createInterface().getFunction("revoke")
    .format("minimal"),
  PluginSetupProcessor__factory.createInterface().getFunction(
    "applyUpdate",
  ).format("minimal"),
  DAO__factory.createInterface().getFunction(
    "upgradeTo",
  ).format("minimal"),
  DAO__factory.createInterface()
    .getFunction("upgradeToAndCall")
    .format("minimal"),
];

export const PLUGIN_UPDATE_ACTION_PATTERN = [
  ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
  ProposalActionTypes.APPLY_UPDATE,
  ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
];
export const PLUGIN_UPDATE_WITH_ROOT_ACTION_PATTERN = [
  ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
  ProposalActionTypes.GRANT_ROOT_PERMISSION,
  ProposalActionTypes.APPLY_UPDATE,
  ProposalActionTypes.REVOKE_ROOT_PERMISSION,
  ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
];
