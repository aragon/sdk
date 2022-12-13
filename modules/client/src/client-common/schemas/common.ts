import {
  InvalidAddressError,
  InvalidAddressOrEnsError,
  InvalidBigintError,
  InvalidBigNumberishError,
  InvalidDataError,
  InvalidDateError,
  InvalidIpfsUriError,
  InvalidPermissionError,
} from "@aragon/sdk-common";
import { isAddress } from "@ethersproject/address";
import { mixed, object, string } from "yup";
import { Permissions } from "../../interfaces";
import { isBigNumberish } from "@ethersproject/bignumber/lib/bignumber";
import { isEnsName, isIpfsUri } from "../utils";

export const addressSchema = string().notRequired().test(
  "isAddress",
  new InvalidAddressError().message,
  (value) => value ? isAddress(value) : true,
);

export const ipfsUriSchema = string().notRequired().test(
  "isIpfsUri",
  new InvalidIpfsUriError().message,
  (value) => value ? isIpfsUri(value) : true,
);

// address list or ens
export const addressOrEnsSchema = string().test(
  "isAddressOrEns",
  new InvalidAddressOrEnsError().message,
  (value) => value ? isEnsName(value) || isAddress(value) : true,
);
// permissions
export const permissionSchema = string().test(
  "isPermission",
  new InvalidPermissionError().message,
  (value) => value ? Object.keys(Permissions).includes(value) : true,
);

// uint8array
export const uint8ArraySchema = mixed().test(
  "isUint8Array",
  new InvalidDataError().message,
  (value) => value ? value instanceof Uint8Array : true,
);

// uint8array
export const bigNumberishSchema = mixed().test(
  "isBigNumberish",
  new InvalidBigNumberishError().message,
  (value) => value ? isBigNumberish(value) : true,
);

// date
export const dateSchema = mixed().test(
  "isDate",
  new InvalidDateError().message,
  (value) => value ? value instanceof Date : true,
);

// bigint
export const bigintSchema = mixed().test(
  "isBigint",
  new InvalidBigintError().message,
  (value) => value ? typeof value === "bigint" : true,
);

export const pluginInstallItemSchema = object({
  id: string().required(),
  data: uint8ArraySchema.required(),
});

export const daoActionSchema = object({
  to: addressSchema.required(),
  value: bigintSchema.required(),
  data: uint8ArraySchema.required(),
});
