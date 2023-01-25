import { array, boolean, number, object, string } from "yup";
import {
  addressOrEnsSchema,
  bigintSchema,
  daoActionSchema,
  ipfsUriSchema,
  membersSchema,
} from "../../client-common";

export const multisigVotingSettings = object({
  minApprovals: number().required(),
  onlyListed: boolean().required(),
});

export const tokenVotingInstallSchema = object({
  minApprovals: membersSchema.required(),
  votingSettings: multisigVotingSettings.required(),
});

export const updateAddressesSchema = object({
  pluginAddress: addressOrEnsSchema.required(),
  members: membersSchema.required(),
});

export const updateMultisigVotingSettingsSchema = object({
  pluginAddress: addressOrEnsSchema.required(),
  votingSettings: multisigVotingSettings.required(),
});

export const approveMultisigProposalSchema = object({
  tryExecution: boolean().required(),
  proposalId: bigintSchema.required(),
  pluginAddress: addressOrEnsSchema.required(),
});
export const createMultisigProposalSchema = object({
  pluginAddress: addressOrEnsSchema.required(),
  metadataUri: ipfsUriSchema.required(),
  actions: array(daoActionSchema).default([]),
  tryExecution: boolean(),
  approve: boolean(),
});

export const canApproveSchema = object({
    pluginAddress: addressOrEnsSchema.required(),
    proposalId: bigintSchema.required(),
    addressOrEns: addressOrEnsSchema.required(),
  });
  export const canExecuteSchema = object({
    pluginAddress: addressOrEnsSchema.required(),
    proposalId: bigintSchema.required(),
  });
