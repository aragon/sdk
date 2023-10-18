import {
  AddressOrEnsSchema,
  BigintSchema,
  IpfsUriSchema,
  PaginationSchema,
  PluginInstallItemSchema,
  SizeMismatchError,
  SubdomainSchema,
  Uint8ArraySchema,
} from "@aragon/sdk-client-common";
import { array, mixed, number, object, string } from "yup";

export const CreateDaoSchema = object({
  metadataUri: IpfsUriSchema.required(),
  daoUri: string().url().notRequired(),
  ensSubdomain: SubdomainSchema.required(),
  trustedForwarder: AddressOrEnsSchema.notRequired(),
  plugins: array(PluginInstallItemSchema).min(1).required(),
});

export const DaoMetadataSchema = object({
  name: string().required(),
  description: string().required(),
  avatar: mixed().test((item) => {
    return [IpfsUriSchema, string().url()].some((schema) =>
      schema.strict().isValidSync(item)
    );
  }).notRequired(),
  links: array(object({
    name: string().required(),
    url: string().required(),
  })).required(),
});

export const DepositEthSchema = object({
  type: string().required().oneOf(["native"]),
  daoAddressOrEns: AddressOrEnsSchema.required(),
  amount: BigintSchema.required(),
});

export const DepositErc20Schema = object({
  type: string().required().oneOf(["erc20"]),
  daoAddressOrEns: AddressOrEnsSchema.required(),
  tokenAddress: AddressOrEnsSchema.required(),
  amount: BigintSchema.required(),
});

export const DepositErc721Schema = object({
  type: string().required().oneOf(["erc721"]),
  daoAddressOrEns: AddressOrEnsSchema.required(),
  tokenAddress: AddressOrEnsSchema.required(),
  tokenId: BigintSchema.required(),
});

export const DepositErc1155Schema = object({
  type: string().required().oneOf(["erc1155"]),
  daoAddressOrEns: AddressOrEnsSchema.required(),
  tokenAddress: AddressOrEnsSchema.required(),
  tokenIds: array(BigintSchema).required().min(1),
  amounts: array(BigintSchema).required().min(1),
}).test(
  "isSameLength",
  new SizeMismatchError("tokenIds", "amounts").message,
  function (value) {
    const v = value as any;
    return v.tokenIds && v.amounts
      ? v.tokenIds.length === v.amounts.length
      : true;
  },
);

export const SetAllowanceSchema = object({
  tokenAddress: AddressOrEnsSchema.required(),
  amount: BigintSchema.required(),
  spender: AddressOrEnsSchema.required(),
});

export const HasPermissionSchema = object({
  who: AddressOrEnsSchema.required(),
  where: AddressOrEnsSchema.required(),
  permission: string().required(),
  daoAddressOrEns: AddressOrEnsSchema.required(),
  data: Uint8ArraySchema.notRequired(),
});

export const DaoQuerySchema = PaginationSchema.concat(object({
  sortBy: string().notRequired().oneOf(["createdAt", "subdomain"]),
}));

export const DaoBalancesQuerySchema = PaginationSchema.concat(object({
  sortBy: string().notRequired().oneOf(["lastUpdated"]),
  daoAddressOrEns: AddressOrEnsSchema.notRequired(),
}));

export const PluginQuerySchema = PaginationSchema.concat(object({
  sortBy: string().notRequired().oneOf(["subdomain"]),
  subdomain: SubdomainSchema.notRequired(),
}));

export const PermissionBaseSchema = object({
  who: AddressOrEnsSchema.required(),
  where: AddressOrEnsSchema.required(),
  permission: string().required(),
});

export const PermissionWithConditionSchema = PermissionBaseSchema.concat(
  object({
    condition: AddressOrEnsSchema.required(),
  }),
);

export const WithdrawEthSchema = object({
  type: string().required().oneOf(["native"]),
  recipientAddressOrEns: AddressOrEnsSchema.required(),
  amount: BigintSchema.required(),
});

export const WithdrawErc20Schema = object({
  type: string().required().oneOf(["erc20"]),
  recipientAddressOrEns: AddressOrEnsSchema.required(),
  tokenAddress: AddressOrEnsSchema.required(),
  amount: BigintSchema.required(),
});

export const WithdrawErc721Schema = object({
  type: string().required().oneOf(["erc721"]),
  daoAddressOrEns: AddressOrEnsSchema.required(),
  recipientAddressOrEns: AddressOrEnsSchema.required(),
  tokenAddress: AddressOrEnsSchema.required(),
  tokenId: BigintSchema.required(),
});

export const WithdrawErc1155Schema = object({
  type: string().required().oneOf(["erc1155"]),
  daoAddressOrEns: AddressOrEnsSchema.required(),
  recipientAddressOrEns: AddressOrEnsSchema.required(),
  tokenAddress: AddressOrEnsSchema.required(),
  tokenIds: array(BigintSchema).required().min(1),
  amounts: array(BigintSchema).required().min(1),
}).test(
  "isSameLength",
  new SizeMismatchError("tokenIds", "amounts").message,
  function (value) {
    const v = value as any;
    return v.tokenIds && v.amounts
      ? v.tokenIds.length === v.amounts.length
      : true;
  },
);

export const RegisterStandardCallbackSchema = object({
  interfaceId: string().required(),
  callbackSelector: string().required(),
  magicNumber: string().required(),
});

export const UpgradeToAndCallSchema = object({
  implementationAddress: AddressOrEnsSchema.required(),
  data: Uint8ArraySchema.required(),
});

export const InitializeFromSchema = object({
  previousVersion: array().of(number()).length(3).required(),
  initData: Uint8ArraySchema.notRequired(),
});

export const DaoUpdateSchema = object({
  previousVersion: array().of(number()).length(3).required(),
  initData: Uint8ArraySchema.notRequired(),
  daoFactoryAddress: AddressOrEnsSchema.notRequired(),
});
