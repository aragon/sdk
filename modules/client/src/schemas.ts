import { array, object, string } from "yup";
import {
  addressOrEnsSchema,
  addressSchema,
  bigintSchema,
  permissionSchema,
  pluginInstallItemSchema,
  uint8ArraySchema,
} from "./client-common";

// DAO details
const daoResourceLinkSchema = object({
  name: string().required(),
  url: string().required(),
});

export const metadataSchema = object({
  name: string().required(),
  description: string().required(),
  avatar: string().optional(),
  links: array(daoResourceLinkSchema).required(),
});
// Create proposal
export const createParamsSchema = object({
  metadata: metadataSchema.required(),
  ensSubdomain: string().required(),
  trustedForwarder: string().optional(),
  plugins: array(pluginInstallItemSchema).required(),
});

// Withdraw
export const withdrawParamsSchema = object({
  recipientAddress: addressOrEnsSchema.required(),
  amount: bigintSchema.required(),
  tokenAddress: addressSchema,
  reference: string(),
});

// deposit
export const depositParamsSchema = object({
  daoAddressOrEns: addressOrEnsSchema.required(),
  amount: bigintSchema.required(),
  tokenAddress: addressSchema,
  reference: string(),
});

// has permission
export const hasPermissionParamsSchema = object({
  daoAddressOrEns: addressOrEnsSchema.required(),
  where: addressOrEnsSchema.required(),
  who: addressOrEnsSchema.required(),
  permission: permissionSchema.required(),
  data: uint8ArraySchema,
});

export const permissionParamsSchema = object({
  where: addressOrEnsSchema.required(),
  who: addressOrEnsSchema.required(),
  permission: permissionSchema.required(),
});

export const freezePermissionParamsSchema = object({
  where: addressOrEnsSchema.required(),
  permission: permissionSchema.required(),
});
