import {
  InvalidProposalIdError,
  InvalidVoteValueError,
} from "@aragon/sdk-common";
import { array, boolean, number, object, string, mixed } from "yup";
import { isProposalId } from "../utils";
import {
  addressOrEnsSchema,
  addressSchema,
  bigintSchema,
  daoActionSchema,
  dateSchema,
  ipfsUriSchema,
} from "./common";
import { VoteValues, VotingMode } from "../interfaces/plugin";

export const voteValuesSchema = number().test(
  "isVoteValue",
  new InvalidVoteValueError().message,
  (value) => value ? Object.values(VoteValues).includes(value) : true,
);
export const votingModeSchema = string().test(
  "isVotingMode",
  new InvalidVoteValueError().message,
  (value) => value ? Object.values(VotingMode).includes(value as VotingMode) : true,
);

export const proposalIdSchema = string().notRequired().test(
  "isProposalId",
  new InvalidProposalIdError().message,
  (value) => value ? isProposalId(value) : true,
);

export const proposalMetadataSchema = object({
  title: string().required(),
  summary: string().required(),
  description: string().required(),
  resources: array(
    object({
      url: string().required(),
      name: string().required(),
    }),
  ).required(),
  media: object({
    header: string(),
    logo: string(),
  }).default(undefined),
});

export const createProposalParamsSchema = object({
  pluginAddress: addressSchema.required(),
  metadataUri: ipfsUriSchema.required(),
  actions: array(daoActionSchema).default([]),
  startDate: dateSchema,
  endDate: dateSchema,
  executeOnPass: boolean(),
  creatorVote: voteValuesSchema,
});

export const voteProposalParamsSchema = object({
  pluginAddress: addressSchema.required(),
  vote: voteValuesSchema.required(),
  proposalId: mixed().required(),
});

export const executeProposalParamsSchema = object({
  pluginAddress: addressSchema.required(),
  proposalId: mixed().required(),
});

export const canVoteParamsSchema = object({
  pluginAddress: addressSchema.required(),
  proposalId:   mixed().required(),
  address: addressOrEnsSchema.required(),
});

export const votingSettingsSchema = object({
  votingMode: votingModeSchema,
  minProposeerVotingPower: bigintSchema,
  supportThreshold: number().lessThan(1).positive().required(),
  minParticipation: number().lessThan(1).positive().required(),
  minDuration: number().positive().required(),
});

export const membersSchema = array(addressOrEnsSchema);
