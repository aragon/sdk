import { array, number, object, string } from "yup";
import {
  addressOrEnsSchema,
  bigintSchema,
  pluginSettingsSchema,
} from "../client-common";

export const newTokenParamsSchema = object({
  name: string().required(),
  symbol: string().required(),
  decimals: number().positive().required(),
  minter: addressOrEnsSchema,
  balances: array(object({
    address: addressOrEnsSchema.required(),
    balance: bigintSchema.required(),
  })).required(),
});
export const existingTokenParamsSchema = object({
  address: addressOrEnsSchema.required(),
});

export const erc20PluginInstallSchema = object({
  settings: pluginSettingsSchema.required(),
  newToken: newTokenParamsSchema.default(undefined),
  useToken: existingTokenParamsSchema.default(undefined),
});
