import {
  InvalidProposalIdError,
  InvalidVoteValueError,
} from "@aragon/sdk-common";
import { array, boolean, number, object, string } from "yup";
import { isProposalId } from "../utils";
import {
  addressOrEnsSchema,
  daoActionSchema,
  dateSchema,
  ipfsUriSchema,
} from "./common";
import { VoteValues } from "../interfaces/plugin";

export const voteValuesSchema = number().test(
  "isVoteValue",
  new InvalidVoteValueError().message,
  (value) => value ? Object.values(VoteValues).includes(value) : true,
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
  pluginAddress: addressOrEnsSchema.required(),
  metadataUri: ipfsUriSchema.required(),
  actions: array(daoActionSchema).default([]),
  startDate: dateSchema,
  endDate: dateSchema,
  executeOnPass: boolean(),
  creatorVote: voteValuesSchema,
  earlyExecution: boolean(),
  voteReplacement: boolean(),
});

export const voteProposalParamsSchema = object({
  pluginAddress: addressOrEnsSchema.required(),
  vote: voteValuesSchema.required(),
  proposalId: proposalIdSchema.required(),
});

export const executeProposalParamsSchema = object({
  pluginAddress: addressOrEnsSchema.required(),
  proposalId: proposalIdSchema.required(),
});

export const canVoteParamsSchema = object({
  pluginAddress: addressOrEnsSchema.required(),
  proposalId: proposalIdSchema.required(),
  addressOrEns: addressOrEnsSchema.required(),
});

export const pluginSettingsSchema = object({
  minSupport: number().lessThan(1).positive().required(),
  minTurnout: number().lessThan(1).positive().required(),
  minDuration: number().positive().required(),
});
