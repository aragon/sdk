import {
  IERC20MintableUpgradeable__factory,
  IGovernanceWrappedERC20__factory,
  MajorityVotingBase__factory,
} from "@aragon/osx-ethers";
import { getInterfaceId } from "@aragon/sdk-common";
import { MetadataAbiInput } from "@aragon/sdk-client-common";
import { abi as IVOTES_ABI } from "@openzeppelin/contracts/build/contracts/IVotes.json";
import { abi as IVOTES_UPGRADEABLE_ABI } from "@openzeppelin/contracts-upgradeable/build/contracts/IVotesUpgradeable.json";
import { abi as ERC165_ABI } from "@openzeppelin/contracts/build/contracts/ERC165.json";
import { Interface } from "@ethersproject/abi";

export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  MajorityVotingBase__factory.createInterface().getFunction(
    "updateVotingSettings",
  )
    .format("minimal"),
  IERC20MintableUpgradeable__factory.createInterface().getFunction("mint")
    .format("minimal"),
];

export const INSTALLATION_ABI: MetadataAbiInput[] = [
  {
    components: [
      {
        internalType: "enum MajorityVotingBase.VotingMode",
        name: "votingMode",
        type: "uint8",
        description:
          "A parameter to select the vote mode. In standard mode (0), early execution and vote replacement are disabled. In early execution mode (1), a proposal can be executed early before the end date if the vote outcome cannot mathematically change by more voters voting. In vote replacement mode (2), voters can change their vote multiple times and only the latest vote option is tallied.",
      },
      {
        internalType: "uint32",
        name: "supportThreshold",
        type: "uint32",
        description:
          "The support threshold value. Its value has to be in the interval [0, 10^6] defined by `RATIO_BASE = 10**6`.",
      },
      {
        internalType: "uint32",
        name: "minParticipation",
        type: "uint32",
        description:
          "The minimum participation value. Its value has to be in the interval [0, 10^6] defined by `RATIO_BASE = 10**6`.",
      },
      {
        internalType: "uint64",
        name: "minDuration",
        type: "uint64",
        description: "The minimum duration of the proposal vote in seconds.",
      },
      {
        internalType: "uint256",
        name: "minProposerVotingPower",
        type: "uint256",
        description: "The minimum voting power required to create a proposal.",
      },
    ],
    internalType: "struct MajorityVotingBase.VotingSettings",
    name: "votingSettings",
    type: "tuple",
    description:
      "The voting settings that will be enforced when proposals are created.",
  },
  {
    components: [
      {
        internalType: "address",
        name: "token",
        type: "address",
        description:
          "The token address. If this is `address(0)`, a new `GovernanceERC20` token is deployed. If not, the existing token is wrapped as an `GovernanceWrappedERC20`.",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
        description:
          "The token name. This parameter is only relevant if the token address is `address(0)`.",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
        description:
          "The token symbol. This parameter is only relevant if the token address is `address(0)`.",
      },
    ],
    internalType: "struct TokenVotingSetup.TokenSettings",
    name: "tokenSettings",
    type: "tuple",
    description:
      "The token settings that either specify an existing ERC-20 token (`token = address(0)`) or the name and symbol of a new `GovernanceERC20` token to be created.",
  },
  {
    components: [
      {
        internalType: "address[]",
        name: "receivers",
        type: "address[]",
        description: "The receivers of the tokens.",
      },
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]",
        description: "The amounts of tokens to be minted for each receiver.",
      },
    ],
    internalType: "struct GovernanceERC20.MintSettings",
    name: "mintSettings",
    type: "tuple",
    description:
      "The token mint settings struct containing the `receivers` and `amounts`.",
  },
];


export const ERC165_INTERFACE_ID = getInterfaceId(
  new Interface(ERC165_ABI),
);

export const GOVERNANCE_SUPPORTED_INTERFACE_IDS = [
  getInterfaceId(new Interface(IVOTES_UPGRADEABLE_ABI)),
  getInterfaceId(new Interface(IVOTES_ABI)),
  getInterfaceId(IGovernanceWrappedERC20__factory.createInterface()),
];
