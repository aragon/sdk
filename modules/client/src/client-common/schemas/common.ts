import {
  InvalidAddressError,
  InvalidAddressOrEnsError,
  InvalidBigintError,
  InvalidDataError,
  InvalidDateError,
  InvalidIpfsUriError,
  InvalidPermissionError,
} from "@aragon/sdk-common";
import { isAddress } from "@ethersproject/address";
import { mixed, object, string } from "yup";
import { isEnsName, isIpfsUri, isPermission } from "../utils";

export const addressSchema = string().notRequired().test(
  "isAddress",
  new InvalidAddressError().message,
  (value) => value === undefined || value === null ? true : isAddress(value),
);

export const ipfsUriSchema = string().notRequired().test(
  "isIpfsUri",
  new InvalidIpfsUriError().message,
  (value) => value === undefined || value === null ? true : isIpfsUri(value),
);

// address list or ens
export const addressOrEnsSchema = string().test(
  "isAddressOrEns",
  new InvalidAddressOrEnsError().message,
  (value) =>
    value === undefined || value === null
      ? true
      : isEnsName(value) || isAddress(value),
);
// permissions
export const permissionSchema = string().test(
  "isPermission",
  new InvalidPermissionError().message,
  (value) => value === undefined || value === null ? true : isPermission(value),
);

// uint8array
export const uint8ArraySchema = mixed().test(
  "isUint8Array",
  new InvalidDataError().message,
  (value) =>
    value === undefined || value === null ? true : value instanceof Uint8Array,
);

// date
export const dateSchema = mixed().test(
  "isDate",
  new InvalidDateError().message,
  (value) =>
    value === undefined || value === null ? true : value instanceof Date,
);

// bigint
export const bigintSchema = mixed().test(
  "isBigint",
  new InvalidBigintError().message,
  (value) =>
    value === undefined || value === null ? true : typeof value === "bigint",
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
