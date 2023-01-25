import { array, boolean, number, object, mixed } from "yup";
import {
  addressOrEnsSchema,
  addressSchema,
  daoActionSchema,
  ipfsUriSchema,
  membersSchema,
} from "../../client-common";

export const multisigVotingSettings = object({
  minApprovals: number().required(),
  onlyListed: boolean().required(),
});

export const multisigInstallSchema = object({
  members: membersSchema.required(),
  votingSettings: multisigVotingSettings.required(),
});

export const updateAddressesSchema = object({
  pluginAddress: addressSchema.required(),
  members: membersSchema.required(),
});

export const updateMultisigVotingSettingsSchema = object({
  pluginAddress: addressSchema.required(),
  votingSettings: multisigVotingSettings.required(),
});

export const approveMultisigProposalSchema = object({
  tryExecution: boolean().required(),
  proposalId: mixed().required(),
  pluginAddress: addressSchema.required(),
});
export const createMultisigProposalSchema = object({
  pluginAddress: addressSchema.required(),
  metadataUri: ipfsUriSchema.required(),
  actions: array(daoActionSchema).default([]),
  tryExecution: boolean(),
  approve: boolean(),
});

export const canApproveSchema = object({
    pluginAddress: addressSchema.required(),
    proposalId: mixed().required(),
    addressOrEns: addressOrEnsSchema.required(),
  });
  export const canExecuteSchema = object({
    pluginAddress: addressSchema.required(),
    proposalId: mixed().required(),
  });
