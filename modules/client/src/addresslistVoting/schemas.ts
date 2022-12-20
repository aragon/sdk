import { array, object } from "yup";
import { addressOrEnsSchema, votingSettingsSchema } from "../client-common";

export const membersSchema = array(addressOrEnsSchema);

export const addressListPluginInstallSchema = object({
  settings: votingSettingsSchema.required(),
  addresses: membersSchema.required(),
});
