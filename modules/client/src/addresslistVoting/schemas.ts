import { array, object } from "yup";
import { addressOrEnsSchema, pluginSettingsSchema } from "../client-common";

export const membersSchema = array(addressOrEnsSchema);

export const addressListPluginInstallSchema = object({
  settings: pluginSettingsSchema.required(),
  addresses: membersSchema.required(),
});
