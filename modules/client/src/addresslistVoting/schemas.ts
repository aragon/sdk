import {  object } from "yup";
import { membersSchema, votingSettingsSchema } from "../client-common";


export const addresslistVotingInstallSchema = object({
  votingSettings: votingSettingsSchema.required(),
  addresses: membersSchema.required(),
});
