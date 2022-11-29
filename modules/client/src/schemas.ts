import {
  InvalidAddressError,
  InvalidBigintError,
  InvalidDataError,
  InvalidPermissionError,
} from "@aragon/sdk-common";
import { isAddress } from "@ethersproject/address";
import { array, mixed, object, string } from "yup";
import { pluginInstallItemSchema } from "./client-common";
import { Permissions } from "./interfaces";
// common

//address
export const addressSchema = string().test(
  "address",
  new InvalidAddressError().message,
  (val) => isAddress(val || ""),
);

// address list or ens
export const addressOrEnsSchema = string().test(
  "address",
  new InvalidAddressError().message,
  (val) => {
    // todo check ens
    return isAddress(val || "");
  },
);
// permissions
export const permissionSchema = string().test(
  "permission",
  new InvalidPermissionError().message,
  (val) => Object.keys(Permissions).includes(val || ""),
);

// uint8array
export const uint8ArraySchema = mixed().test(
  "uint8Array",
  new InvalidDataError().message,
  (val) => val instanceof Uint8Array,
);

// bigint
export const bigintSchema = mixed().test(
  "bigint",
  new InvalidBigintError().message,
  (val) => {
    return typeof val === "bigint";
  },
);

// Create proposal
export const createParamsSchema = object({
  metadata: string().required(),
  ensSubdomain: string().required(),
  trustedForwarder: string().optional(),
  plugins: array().of(pluginInstallItemSchema).required(),
});

// Withdraw
export const withdrawParamsSchema = object({
  recipientAddress: string().required(),
  amount: bigintSchema.required(),
  tokenAddress: addressSchema.optional(),
  reference: string().optional(),
});

// deposit
export const depositParamsSchema = object({
  daoAddressOrEns: addressOrEnsSchema.required(),
  amount: bigintSchema.required(),
  tokenAddress: addressSchema.optional(),
  reference: string().optional(),
});

// has permission
export const hasPermissionParamsSchema = object({
  daoAddressOrEns: addressOrEnsSchema.required(),
  where: addressOrEnsSchema.required(),
  who: addressOrEnsSchema.required(),
  permission: permissionSchema.required(),
  data: uint8ArraySchema.optional(),
});

// DAO details
const daoResourceLinkSchema = object({
  name: string().required(),
  url: string().required(),
});
export const metadataSchema = object({
  name: string().required(),
  description: string().required(),
  avatar: string().optional(),
  links: array().of(daoResourceLinkSchema).required(),
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
