import {
  CreateDaoSchema,
  DaoBalancesQuerySchema,
  DaoMetadataSchema,
  DaoQuerySchema,
  DepositErc1155Schema,
  DepositErc20Schema,
  DepositErc721Schema,
  DepositEthSchema,
  InitializeFromSchema,
  PermissionBaseSchema,
  PermissionWithConditionSchema,
  PluginQuerySchema,
  RegisterStandardCallbackSchema,
  SetAllowanceSchema,
  UpgradeToAndCallSchema,
  WithdrawErc1155Schema,
  WithdrawErc20Schema,
  WithdrawErc721Schema,
  WithdrawEthSchema,
} from "../../../src/internal/schemas";
import {
  TEST_ADDRESS,
  TEST_HTTP_URI,
  TEST_INVALID_ADDRESS,
  TEST_INVALID_IPFS_URI,
  TEST_INVALID_SUBDOMAIN,
  TEST_IPFS_URI_V0,
  TEST_SUBDOMAIN,
} from "../../constants";
import {
  InvalidAddressOrEnsError,
  InvalidCidError,
  InvalidParameter,
  InvalidSubdomainError,
  Permissions,
  SizeMismatchError,
  SortDirection,
  TokenType,
} from "@aragon/sdk-client-common";
import {
  AssetBalanceSortBy,
  CreateDaoParams,
  DaoBalancesQueryParams,
  DaoMetadata,
  DaoQueryParams,
  DaoSortBy,
  DepositParams,
  GrantPermissionParams,
  GrantPermissionWithConditionParams,
  InitializeFromParams,
  PluginQueryParams,
  PluginSortBy,
  RegisterStandardCallbackParams,
  SetAllowanceParams,
  UpgradeToAndCallParams,
  WithdrawParams,
} from "../../../src";
import { ValidationError } from "yup";

describe("Test client schemas", () => {
  describe("Test CreateDaoParams", () => {
    it("should validate a valid CreateDaoParams", () => {
      const createDaoParams: CreateDaoParams = {
        metadataUri: TEST_IPFS_URI_V0,
        daoUri: TEST_HTTP_URI,
        ensSubdomain: TEST_SUBDOMAIN,
        trustedForwarder: TEST_ADDRESS,
        plugins: [
          {
            id: TEST_ADDRESS,
            data: new Uint8Array(),
          },
        ],
      };
      CreateDaoSchema.strict().validateSync(createDaoParams);
    });
    it("should validate a valid CreateDaoParams without optional params", () => {
      const createDaoParams: CreateDaoParams = {
        metadataUri: TEST_IPFS_URI_V0,
        ensSubdomain: TEST_SUBDOMAIN,
        plugins: [
          {
            id: TEST_ADDRESS,
            data: new Uint8Array(),
          },
        ],
      };
      CreateDaoSchema.strict().validateSync(createDaoParams);
    });
    it("should throw an error if the metadataUri is missing", () => {
      const createDaoParams = {
        ensSubdomain: TEST_SUBDOMAIN,
        plugins: [
          {
            id: TEST_ADDRESS,
            data: new Uint8Array(),
          },
        ],
      };
      expect(() => CreateDaoSchema.strict().validateSync(createDaoParams))
        .toThrow(
          new ValidationError("metadataUri is a required field"),
        );
    });
    it("should throw an error if the ensSubdomain is missing", () => {
      const createDaoParams = {
        metadataUri: TEST_IPFS_URI_V0,
        plugins: [
          {
            id: TEST_ADDRESS,
            data: new Uint8Array(),
          },
        ],
      };
      expect(() => CreateDaoSchema.strict().validateSync(createDaoParams))
        .toThrow(
          new ValidationError("ensSubdomain is a required field"),
        );
    });
    it("should throw an error if the plugins is missing", () => {
      const createDaoParams = {
        metadataUri: TEST_IPFS_URI_V0,
        ensSubdomain: TEST_SUBDOMAIN,
      };
      expect(() => CreateDaoSchema.strict().validateSync(createDaoParams))
        .toThrow(
          new ValidationError("plugins is a required field"),
        );
    });
    it("should throw an error if the plugins length is 0", () => {
      const createDaoParams = {
        metadataUri: TEST_IPFS_URI_V0,
        ensSubdomain: TEST_SUBDOMAIN,
      };
      expect(() => CreateDaoSchema.strict().validateSync(createDaoParams))
        .toThrow(
          new ValidationError("plugins is a required field"),
        );
    });
    it("should throw an error if the metadataUri is invalid", () => {
      const createDaoParams: CreateDaoParams = {
        metadataUri: TEST_INVALID_IPFS_URI,
        ensSubdomain: TEST_SUBDOMAIN,
        plugins: [
          {
            id: TEST_ADDRESS,
            data: new Uint8Array(),
          },
        ],
      };
      expect(() => CreateDaoSchema.strict().validateSync(createDaoParams))
        .toThrow(
          new ValidationError(new InvalidCidError().message),
        );
    });
    it("should throw an error if the ensSubdomain is invalid", () => {
      const createDaoParams = {
        metadataUri: TEST_IPFS_URI_V0,
        ensSubdomain: TEST_INVALID_SUBDOMAIN,
        plugins: [
          {
            id: TEST_ADDRESS,
            data: new Uint8Array(),
          },
        ],
      };
      expect(() => CreateDaoSchema.strict().validateSync(createDaoParams))
        .toThrow(
          new ValidationError(new InvalidSubdomainError().message),
        );
    });
    it("should throw an error if the plugins are invalid", () => {
      const createDaoParams = {
        metadataUri: TEST_IPFS_URI_V0,
        ensSubdomain: TEST_SUBDOMAIN,
        plugins: [
          {
            id: TEST_INVALID_ADDRESS,
            data: new Uint8Array(),
          },
        ],
      };
      expect(() => CreateDaoSchema.strict().validateSync(createDaoParams))
        .toThrow(
          new ValidationError(new InvalidAddressOrEnsError().message),
        );
    });
  });
  describe("Test DaoMetadata", () => {
    it("should validate a valid DaoMetadata", () => {
      const daoMetadata: DaoMetadata = {
        name: "test",
        description: "test",
        avatar: TEST_IPFS_URI_V0,
        links: [
          {
            name: "test",
            url: TEST_HTTP_URI,
          },
        ],
      };
      DaoMetadataSchema.strict().validateSync(daoMetadata);
    });
    it("should validate a valid DaoMetadata without optional params", () => {
      const daoMetadata: DaoMetadata = {
        name: "test",
        description: "test",
        links: [
          {
            name: "test",
            url: TEST_HTTP_URI,
          },
        ],
      };
      DaoMetadataSchema.strict().validateSync(daoMetadata);
    });
    it("should throw an error if the name is missing", () => {
      const daoMetadata = {
        description: "test",
        links: [
          {
            name: "test",
            url: TEST_HTTP_URI,
          },
        ],
      };
      expect(() => DaoMetadataSchema.strict().validateSync(daoMetadata))
        .toThrow(
          new ValidationError("name is a required field"),
        );
    });
    it("should throw an error if the description is missing", () => {
      const daoMetadata = {
        name: "test",
        links: [
          {
            name: "test",
            url: TEST_HTTP_URI,
          },
        ],
      };
      expect(() => DaoMetadataSchema.strict().validateSync(daoMetadata))
        .toThrow(
          new ValidationError("description is a required field"),
        );
    });
    it("should throw an error if the links is missing", () => {
      const daoMetadata = {
        name: "test",
        description: "test",
      };
      expect(() => DaoMetadataSchema.strict().validateSync(daoMetadata))
        .toThrow(
          new ValidationError("links is a required field"),
        );
    });
  });
  describe("Test DepositParams", () => {
    describe("Test DepositNativeParams", () => {
      it("should validate a valid DepositNativeParams", () => {
        const depositNativeParams: DepositParams = {
          type: TokenType.NATIVE,
          daoAddressOrEns: TEST_ADDRESS,
          amount: BigInt(1),
        };
        DepositEthSchema.strict().validateSync(depositNativeParams);
      });
      it("should throw an error if the daoAddressOrEns is missing", () => {
        const depositNativeParams = {
          type: TokenType.NATIVE,
          amount: BigInt(1),
        };
        expect(() =>
          DepositEthSchema.strict().validateSync(depositNativeParams)
        )
          .toThrow(
            new ValidationError("daoAddressOrEns is a required field"),
          );
      });
      it("should throw an error if the amount is missing", () => {
        const depositNativeParams = {
          type: TokenType.NATIVE,
          daoAddressOrEns: TEST_ADDRESS,
        };
        expect(() =>
          DepositEthSchema.strict().validateSync(depositNativeParams)
        )
          .toThrow(
            new ValidationError("amount is a required field"),
          );
      });
      it("should throw an error if the daoAddressOrEns is invalid", () => {
        const depositNativeParams: DepositParams = {
          type: TokenType.NATIVE,
          daoAddressOrEns: TEST_INVALID_ADDRESS,
          amount: BigInt(1),
        };
        expect(() =>
          DepositEthSchema.strict().validateSync(depositNativeParams)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the amount is invalid", () => {
        const depositNativeParams = {
          type: TokenType.NATIVE,
          daoAddressOrEns: TEST_ADDRESS,
          amount: 1,
        };
        expect(() =>
          DepositEthSchema.strict().validateSync(depositNativeParams)
        )
          .toThrow(
            new ValidationError(new InvalidParameter("bigint").message),
          );
      });
      it("should throw an error if the type is invalid", () => {
        const depositNativeParams = {
          type: TokenType.ERC20,
          daoAddressOrEns: TEST_ADDRESS,
          amount: BigInt(1),
        };
        expect(() =>
          DepositEthSchema.strict().validateSync(depositNativeParams)
        )
          .toThrow(
            new ValidationError(
              "type must be one of the following values: native",
            ),
          );
      });
      it("should throw an error if the type is missing", () => {
        const depositNativeParams = {
          daoAddressOrEns: TEST_ADDRESS,
          amount: BigInt(1),
        };
        expect(() =>
          DepositEthSchema.strict().validateSync(depositNativeParams)
        )
          .toThrow(
            new ValidationError("type is a required field"),
          );
      });
    });
    describe("Test DepositErc20Params", () => {
      it("should validate a valid DepositErc20Params", () => {
        const depositErc20Params: DepositParams = {
          type: TokenType.ERC20,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          amount: BigInt(1),
        };
        DepositErc20Schema.strict().validateSync(depositErc20Params);
      });
      it("should throw an error if the daoAddressOrEns is missing", () => {
        const depositErc20Params = {
          type: TokenType.ERC20,
          tokenAddress: TEST_ADDRESS,
          amount: BigInt(1),
        };
        expect(() =>
          DepositErc20Schema.strict().validateSync(depositErc20Params)
        )
          .toThrow(
            new ValidationError("daoAddressOrEns is a required field"),
          );
      });
      it("should throw an error if the tokenAddress is missing", () => {
        const depositErc20Params = {
          type: TokenType.ERC20,
          daoAddressOrEns: TEST_ADDRESS,
          amount: BigInt(1),
        };
        expect(() =>
          DepositErc20Schema.strict().validateSync(depositErc20Params)
        )
          .toThrow(
            new ValidationError("tokenAddress is a required field"),
          );
      });
      it("should throw an error if the amount is missing", () => {
        const depositErc20Params = {
          type: TokenType.ERC20,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
        };
        expect(() =>
          DepositErc20Schema.strict().validateSync(depositErc20Params)
        )
          .toThrow(
            new ValidationError("amount is a required field"),
          );
      });
      it("should throw an error if the daoAddressOrEns is invalid", () => {
        const depositErc20Params: DepositParams = {
          type: TokenType.ERC20,
          daoAddressOrEns: TEST_INVALID_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          amount: BigInt(1),
        };
        expect(() =>
          DepositErc20Schema.strict().validateSync(depositErc20Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the tokenAddress is invalid", () => {
        const depositErc20Params: DepositParams = {
          type: TokenType.ERC20,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_INVALID_ADDRESS,
          amount: BigInt(1),
        };
        expect(() =>
          DepositErc20Schema.strict().validateSync(depositErc20Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the amount is invalid", () => {
        const depositErc20Params = {
          type: TokenType.ERC20,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          amount: 1,
        };
        expect(() =>
          DepositErc20Schema.strict().validateSync(depositErc20Params)
        )
          .toThrow(
            new ValidationError(new InvalidParameter("bigint").message),
          );
      });
      it("should throw an error if the type is invalid", () => {
        const depositErc20Params = {
          type: TokenType.NATIVE,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          amount: BigInt(1),
        };
        expect(() =>
          DepositErc20Schema.strict().validateSync(depositErc20Params)
        )
          .toThrow(
            new ValidationError(
              "type must be one of the following values: erc20",
            ),
          );
      });
      it("should throw an error if the type is missing", () => {
        const depositErc20Params = {
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          amount: BigInt(1),
        };
        expect(() =>
          DepositErc20Schema.strict().validateSync(depositErc20Params)
        )
          .toThrow(
            new ValidationError("type is a required field"),
          );
      });
    });
    describe("Test DepositErc721Params", () => {
      it("should validate a valid DepositErc721Params", () => {
        const depositErc721Params: DepositParams = {
          type: TokenType.ERC721,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        DepositErc721Schema.strict().validateSync(depositErc721Params);
      });
      it("should throw an error if the daoAddressOrEns is missing", () => {
        const depositErc721Params = {
          type: TokenType.ERC721,
          tokenAddress: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          DepositErc721Schema.strict().validateSync(depositErc721Params)
        )
          .toThrow(
            new ValidationError("daoAddressOrEns is a required field"),
          );
      });
      it("should throw an error if the tokenAddress is missing", () => {
        const depositErc721Params = {
          type: TokenType.ERC721,
          daoAddressOrEns: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          DepositErc721Schema.strict().validateSync(depositErc721Params)
        )
          .toThrow(
            new ValidationError("tokenAddress is a required field"),
          );
      });
      it("should throw an error if the tokenId is missing", () => {
        const depositErc721Params = {
          type: TokenType.ERC721,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
        };
        expect(() =>
          DepositErc721Schema.strict().validateSync(depositErc721Params)
        )
          .toThrow(
            new ValidationError("tokenId is a required field"),
          );
      });
      it("should throw an error if the daoAddressOrEns is invalid", () => {
        const depositErc721Params: DepositParams = {
          type: TokenType.ERC721,
          daoAddressOrEns: TEST_INVALID_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          DepositErc721Schema.strict().validateSync(depositErc721Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the tokenAddress is invalid", () => {
        const depositErc721Params: DepositParams = {
          type: TokenType.ERC721,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_INVALID_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          DepositErc721Schema.strict().validateSync(depositErc721Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the tokenId is invalid", () => {
        const depositErc721Params = {
          type: TokenType.ERC721,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenId: 1,
        };
        expect(() =>
          DepositErc721Schema.strict().validateSync(depositErc721Params)
        )
          .toThrow(
            new ValidationError(new InvalidParameter("bigint").message),
          );
      });
      it("should throw an error if the type is invalid", () => {
        const depositErc721Params = {
          type: TokenType.NATIVE,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          DepositErc721Schema.strict().validateSync(depositErc721Params)
        )
          .toThrow(
            new ValidationError(
              "type must be one of the following values: erc721",
            ),
          );
      });
      it("should throw an error if the type is missing", () => {
        const depositErc721Params = {
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          DepositErc721Schema.strict().validateSync(depositErc721Params)
        )
          .toThrow(
            new ValidationError("type is a required field"),
          );
      });
    });
    describe("Test DepositErc1155Params", () => {
      it("should validate a valid DepositErc1155Params", () => {
        const depositErc1155Params: DepositParams = {
          type: TokenType.ERC1155,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        DepositErc1155Schema.strict().validateSync(depositErc1155Params);
      });
      it("should throw an error if the daoAddressOrEns is missing", () => {
        const depositErc1155Params = {
          type: TokenType.ERC1155,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError("daoAddressOrEns is a required field"),
          );
      });
      it("should throw an error if the tokenAddress is missing", () => {
        const depositErc1155Params = {
          type: TokenType.ERC1155,
          daoAddressOrEns: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError("tokenAddress is a required field"),
          );
      });
      it("should throw an error if the tokenIds is missing", () => {
        const depositErc1155Params = {
          type: TokenType.ERC1155,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          amounts: [BigInt(1)],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError("tokenIds is a required field"),
          );
      });
      it("should throw an error if the amounts is missing", () => {
        const depositErc1155Params = {
          type: TokenType.ERC1155,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError("amounts is a required field"),
          );
      });
      it("should throw an error if the daoAddressOrEns is invalid", () => {
        const depositErc1155Params: DepositParams = {
          type: TokenType.ERC1155,
          daoAddressOrEns: TEST_INVALID_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the tokenAddress is invalid", () => {
        const depositErc1155Params: DepositParams = {
          type: TokenType.ERC1155,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_INVALID_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the tokenIds are invalid", () => {
        const depositErc1155Params = {
          type: TokenType.ERC1155,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [1],
          amounts: [BigInt(1)],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError(new InvalidParameter("bigint").message),
          );
      });
      it("should throw an error if the amounts are invalid", () => {
        const depositErc1155Params = {
          type: TokenType.ERC1155,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [1],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError(new InvalidParameter("bigint").message),
          );
      });
      it("should throw an error if the type is invalid", () => {
        const depositErc1155Params = {
          type: TokenType.NATIVE,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError(
              "type must be one of the following values: erc1155",
            ),
          );
      });
      it("should throw an error if the type is missing", () => {
        const depositErc1155Params = {
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError("type is a required field"),
          );
      });
      it("should throw an error if the tokenIds length is 0", () => {
        const depositErc1155Params = {
          type: TokenType.ERC1155,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [],
          amounts: [BigInt(1)],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError(
              new SizeMismatchError("tokenIds", "amounts").message,
            ),
          );
      });
      it("should throw an error if the amounts length is 0", () => {
        const depositErc1155Params = {
          type: TokenType.ERC1155,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError(
              new SizeMismatchError("tokenIds", "amounts").message,
            ),
          );
      });
      it("should throw an error if the tokenIds or amounts length is 0", () => {
        const depositErc1155Params = {
          type: TokenType.ERC1155,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [],
          amounts: [],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError(
              "amounts field must have at least 1 items",
            ),
          );
      });
      it("should throw an error if the tokenIds and amounts length are different", () => {
        const depositErc1155Params = {
          type: TokenType.ERC1155,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1), BigInt(1)],
        };
        expect(() =>
          DepositErc1155Schema.strict().validateSync(depositErc1155Params)
        )
          .toThrow(
            new ValidationError(
              new SizeMismatchError("tokenIds", "amounts").message,
            ),
          );
      });
    });
  });
  describe("Test SetAllowance", () => {
    it("should validate a valid SetAllowance", () => {
      const setAllowanceParams: SetAllowanceParams = {
        tokenAddress: TEST_ADDRESS,
        amount: BigInt(1),
        spender: TEST_ADDRESS,
      };
      SetAllowanceSchema.strict().validateSync(setAllowanceParams);
    });
    it("should throw an error if the tokenAddress is missing", () => {
      const setAllowanceParams = {
        amount: BigInt(1),
        spender: TEST_ADDRESS,
      };
      expect(() => SetAllowanceSchema.strict().validateSync(setAllowanceParams))
        .toThrow(
          new ValidationError("tokenAddress is a required field"),
        );
    });
    it("should throw an error if the amount is missing", () => {
      const setAllowanceParams = {
        tokenAddress: TEST_ADDRESS,
        spender: TEST_ADDRESS,
      };
      expect(() => SetAllowanceSchema.strict().validateSync(setAllowanceParams))
        .toThrow(
          new ValidationError("amount is a required field"),
        );
    });
    it("should throw an error if the spender is missing", () => {
      const setAllowanceParams = {
        tokenAddress: TEST_ADDRESS,
        amount: BigInt(1),
      };
      expect(() => SetAllowanceSchema.strict().validateSync(setAllowanceParams))
        .toThrow(
          new ValidationError("spender is a required field"),
        );
    });
    it("should throw an error if the tokenAddress is invalid", () => {
      const setAllowanceParams: SetAllowanceParams = {
        tokenAddress: TEST_INVALID_ADDRESS,
        amount: BigInt(1),
        spender: TEST_ADDRESS,
      };
      expect(() => SetAllowanceSchema.strict().validateSync(setAllowanceParams))
        .toThrow(
          new ValidationError(new InvalidAddressOrEnsError().message),
        );
    });
    it("should throw an error if the amount is invalid", () => {
      const setAllowanceParams = {
        tokenAddress: TEST_ADDRESS,
        amount: 1,
        spender: TEST_ADDRESS,
      };
      expect(() => SetAllowanceSchema.strict().validateSync(setAllowanceParams))
        .toThrow(
          new ValidationError(new InvalidParameter("bigint").message),
        );
    });
    it("should throw an error if the spender is invalid", () => {
      const setAllowanceParams: SetAllowanceParams = {
        tokenAddress: TEST_ADDRESS,
        amount: BigInt(1),
        spender: TEST_INVALID_ADDRESS,
      };
      expect(() => SetAllowanceSchema.strict().validateSync(setAllowanceParams))
        .toThrow(
          new ValidationError(new InvalidAddressOrEnsError().message),
        );
    });
    it("should throw an error if the tokenAddress is missing", () => {
      const setAllowanceParams = {
        amount: BigInt(1),
        spender: TEST_ADDRESS,
      };
      expect(() => SetAllowanceSchema.strict().validateSync(setAllowanceParams))
        .toThrow(
          new ValidationError("tokenAddress is a required field"),
        );
    });
  });

  describe("Test Dao Query", () => {
    it("should validate a valid DaoQuery", () => {
      const daoQueryParams: DaoQueryParams = {
        sortBy: DaoSortBy.CREATED_AT,
        skip: 0,
        limit: 1,
        direction: SortDirection.ASC,
      };
      DaoQuerySchema.strict().validateSync(daoQueryParams);
    });
    it("should validate a valid DaoQuery without optional params", () => {
      const daoQueryParams: DaoQueryParams = {};
      DaoQuerySchema.strict().validateSync(daoQueryParams);
    });
    it("should throw an error if the sortBy is invalid", () => {
      const daoQueryParams = {
        sortBy: "invalid",
      };
      expect(() => DaoQuerySchema.strict().validateSync(daoQueryParams))
        .toThrow(
          new ValidationError(
            "sortBy must be one of the following values: createdAt, subdomain",
          ),
        );
    });
  });
  describe("Test DaoBalances Query", () => {
    it("should validate a valid DaoBalancesQuery", () => {
      const daoBalancesQueryParams: DaoBalancesQueryParams = {
        sortBy: AssetBalanceSortBy.LAST_UPDATED,
        skip: 0,
        limit: 1,
        direction: SortDirection.ASC,
        daoAddressOrEns: TEST_ADDRESS,
      };
      DaoBalancesQuerySchema.strict().validateSync(daoBalancesQueryParams);
    });
    it("should validate a valid DaoBalancesQuery without optional params", () => {
      const daoBalancesQueryParams: DaoBalancesQueryParams = {};
      DaoBalancesQuerySchema.strict().validateSync(daoBalancesQueryParams);
    });
    it("should throw an error if the sortBy is invalid", () => {
      const daoBalancesQueryParams = {
        sortBy: "invalid",
      };
      expect(() =>
        DaoBalancesQuerySchema.strict().validateSync(daoBalancesQueryParams)
      )
        .toThrow(
          new ValidationError(
            "sortBy must be one of the following values: lastUpdated",
          ),
        );
    });
    it("should throw an error if the daoAddressOrEns is invalid", () => {
      const daoBalancesQueryParams: DaoBalancesQueryParams = {
        daoAddressOrEns: TEST_INVALID_ADDRESS,
      };
      expect(() =>
        DaoBalancesQuerySchema.strict().validateSync(daoBalancesQueryParams)
      )
        .toThrow(
          new ValidationError(new InvalidAddressOrEnsError().message),
        );
    });
  });
  describe("Test PluginQuery Query", () => {
    it("should validate a valid PluginQuery", () => {
      const pluginQueryParams: PluginQueryParams = {
        sortBy: PluginSortBy.SUBDOMAIN,
        skip: 0,
        limit: 1,
        direction: SortDirection.ASC,
        subdomain: TEST_SUBDOMAIN,
      };
      PluginQuerySchema.strict().validateSync(pluginQueryParams);
    });
    it("should validate a valid PluginQuery without optional params", () => {
      const pluginQueryParams: PluginQueryParams = {};
      PluginQuerySchema.strict().validateSync(pluginQueryParams);
    });
    it("should throw an error if the sortBy is invalid", () => {
      const pluginQueryParams = {
        sortBy: "invalid",
      };
      expect(() => PluginQuerySchema.strict().validateSync(pluginQueryParams))
        .toThrow(
          new ValidationError(
            "sortBy must be one of the following values: subdomain",
          ),
        );
    });
    it("should throw an error if the subdomain is invalid", () => {
      const pluginQueryParams = {
        subdomain: TEST_INVALID_SUBDOMAIN,
      };
      expect(() => PluginQuerySchema.strict().validateSync(pluginQueryParams))
        .toThrow(
          new ValidationError(new InvalidSubdomainError().message),
        );
    });
  });

  describe("Test Permission Schema", () => {
    it("should validate a valid Permission", () => {
      const permissionParams: GrantPermissionParams = {
        permission: Permissions.WITHDRAW_PERMISSION,
        who: TEST_ADDRESS,
        where: TEST_ADDRESS,
      };
      PermissionBaseSchema.strict().validateSync(permissionParams);
    });
    it("should throw an error if the permission is missing", () => {
      const permissionParams = {
        who: TEST_ADDRESS,
        where: TEST_ADDRESS,
      };
      expect(() => PermissionBaseSchema.strict().validateSync(permissionParams))
        .toThrow(
          new ValidationError("permission is a required field"),
        );
    });
    it("should throw an error if the who is missing", () => {
      const permissionParams = {
        permission: Permissions.WITHDRAW_PERMISSION,
        where: TEST_ADDRESS,
      };
      expect(() => PermissionBaseSchema.strict().validateSync(permissionParams))
        .toThrow(
          new ValidationError("who is a required field"),
        );
    });
    it("should throw an error if the where is missing", () => {
      const permissionParams = {
        permission: Permissions.WITHDRAW_PERMISSION,
        who: TEST_ADDRESS,
      };
      expect(() => PermissionBaseSchema.strict().validateSync(permissionParams))
        .toThrow(
          new ValidationError("where is a required field"),
        );
    });
    it("should throw an error if the permission is invalid", () => {
      const permissionParams = {
        permission: 1,
        who: TEST_ADDRESS,
        where: TEST_ADDRESS,
      };
      expect(() => PermissionBaseSchema.strict().validateSync(permissionParams))
        .toThrow(
          new ValidationError(
            "permission must be a `string` type, but the final value was: `1`.",
          ),
        );
    });
    it("should throw an error if the who is invalid", () => {
      const permissionParams = {
        permission: Permissions.WITHDRAW_PERMISSION,
        who: TEST_INVALID_ADDRESS,
        where: TEST_ADDRESS,
      };
      expect(() => PermissionBaseSchema.strict().validateSync(permissionParams))
        .toThrow(
          new ValidationError(new InvalidAddressOrEnsError().message),
        );
    });
    it("should throw an error if the where is invalid", () => {
      const permissionParams = {
        permission: Permissions.WITHDRAW_PERMISSION,
        who: TEST_ADDRESS,
        where: TEST_INVALID_ADDRESS,
      };
      expect(() => PermissionBaseSchema.strict().validateSync(permissionParams))
        .toThrow(
          new ValidationError(new InvalidAddressOrEnsError().message),
        );
    });
  });
  describe("Permission with condition", () => {
    it("should validate a valid Permission with condition", () => {
      const permissionParams: GrantPermissionWithConditionParams = {
        permission: Permissions.WITHDRAW_PERMISSION,
        who: TEST_ADDRESS,
        where: TEST_ADDRESS,
        condition: TEST_ADDRESS,
      };
      PermissionWithConditionSchema.strict().validateSync(permissionParams);
    });
    it("should throw an error if the condition is invalid", () => {
      const permissionParams = {
        permission: Permissions.WITHDRAW_PERMISSION,
        who: TEST_ADDRESS,
        where: TEST_ADDRESS,
        condition: {},
      };
      expect(() =>
        PermissionWithConditionSchema.strict().validateSync(permissionParams)
      )
        .toThrow(
          new ValidationError(
            "condition must be a `string` type, but the final value was: `{}`.",
          ),
        );
    });
    it("should throw an error if the condition is missing", () => {
      const permissionParams = {
        permission: Permissions.WITHDRAW_PERMISSION,
        who: TEST_ADDRESS,
        where: TEST_ADDRESS,
      };
      expect(() =>
        PermissionWithConditionSchema.strict().validateSync(permissionParams)
      )
        .toThrow(
          new ValidationError("condition is a required field"),
        );
    });
  });
  describe("Test Withdraw", () => {
    describe("Test withdraw eth", () => {
      it("should validate a valid WithdrawEth", () => {
        const withdrawEthParams: WithdrawParams = {
          amount: BigInt(1),
          type: TokenType.NATIVE,
          recipientAddressOrEns: TEST_ADDRESS,
        };
        WithdrawEthSchema.strict().validateSync(withdrawEthParams);
      });
      it("should throw an error if the amount is missing", () => {
        const withdrawEthParams = {
          type: TokenType.NATIVE,
          recipientAddressOrEns: TEST_ADDRESS,
        };
        expect(() => WithdrawEthSchema.strict().validateSync(withdrawEthParams))
          .toThrow(
            new ValidationError("amount is a required field"),
          );
      });
      it("should throw an error if the type is missing", () => {
        const withdrawEthParams = {
          amount: BigInt(1),
          recipientAddressOrEns: TEST_ADDRESS,
        };
        expect(() => WithdrawEthSchema.strict().validateSync(withdrawEthParams))
          .toThrow(
            new ValidationError("type is a required field"),
          );
      });
      it("should throw an error if the recipientAddressOrEns is missing", () => {
        const withdrawEthParams = {
          amount: BigInt(1),
          type: TokenType.NATIVE,
        };
        expect(() => WithdrawEthSchema.strict().validateSync(withdrawEthParams))
          .toThrow(
            new ValidationError("recipientAddressOrEns is a required field"),
          );
      });
      it("should throw an error if the amount is invalid", () => {
        const withdrawEthParams = {
          amount: 1,
          type: TokenType.NATIVE,
          recipientAddressOrEns: TEST_ADDRESS,
        };
        expect(() => WithdrawEthSchema.strict().validateSync(withdrawEthParams))
          .toThrow(
            new ValidationError(new InvalidParameter("bigint").message),
          );
      });
      it("should throw an error if the type is invalid", () => {
        const withdrawEthParams = {
          amount: BigInt(1),
          type: "invalid",
          recipientAddressOrEns: TEST_ADDRESS,
        };
        expect(() => WithdrawEthSchema.strict().validateSync(withdrawEthParams))
          .toThrow(
            new ValidationError(
              "type must be one of the following values: native",
            ),
          );
      });
      it("should throw an error if the recipientAddressOrEns is invalid", () => {
        const withdrawEthParams = {
          amount: BigInt(1),
          type: TokenType.NATIVE,
          recipientAddressOrEns: TEST_INVALID_ADDRESS,
        };
        expect(() => WithdrawEthSchema.strict().validateSync(withdrawEthParams))
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
    });
    describe("Test withdraw erc20", () => {
      it("should validate a valid WithdrawErc20", () => {
        const withdrawErc20Params: WithdrawParams = {
          amount: BigInt(1),
          type: TokenType.ERC20,
          recipientAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
        };
        WithdrawErc20Schema.strict().validateSync(withdrawErc20Params);
      });
      it("should throw an error if the amount is missing", () => {
        const withdrawErc20Params = {
          type: TokenType.ERC20,
          recipientAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
        };
        expect(() =>
          WithdrawErc20Schema.strict().validateSync(withdrawErc20Params)
        )
          .toThrow(
            new ValidationError("amount is a required field"),
          );
      });
      it("should throw an error if the type is missing", () => {
        const withdrawErc20Params = {
          amount: BigInt(1),
          recipientAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
        };
        expect(() =>
          WithdrawErc20Schema.strict().validateSync(withdrawErc20Params)
        )
          .toThrow(
            new ValidationError("type is a required field"),
          );
      });
      it("should throw an error if the recipientAddressOrEns is missing", () => {
        const withdrawErc20Params = {
          amount: BigInt(1),
          type: TokenType.ERC20,
          tokenAddress: TEST_ADDRESS,
        };
        expect(() =>
          WithdrawErc20Schema.strict().validateSync(withdrawErc20Params)
        )
          .toThrow(
            new ValidationError("recipientAddressOrEns is a required field"),
          );
      });
      it("should throw an error if the tokenAddress is missing", () => {
        const withdrawErc20Params = {
          amount: BigInt(1),
          type: TokenType.ERC20,
          recipientAddressOrEns: TEST_ADDRESS,
        };
        expect(() =>
          WithdrawErc20Schema.strict().validateSync(withdrawErc20Params)
        )
          .toThrow(
            new ValidationError("tokenAddress is a required field"),
          );
      });
      it("should throw an error if the amount is invalid", () => {
        const withdrawErc20Params = {
          amount: 1,
          type: TokenType.ERC20,
          recipientAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
        };
        expect(() =>
          WithdrawErc20Schema.strict().validateSync(withdrawErc20Params)
        )
          .toThrow(
            new ValidationError(new InvalidParameter("bigint").message),
          );
      });
      it("should throw an error if the type is invalid", () => {
        const withdrawErc20Params = {
          amount: BigInt(1),
          type: "invalid",
          recipientAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
        };
        expect(() =>
          WithdrawErc20Schema.strict().validateSync(withdrawErc20Params)
        )
          .toThrow(
            new ValidationError(
              "type must be one of the following values: erc20",
            ),
          );
      });
      it("should throw an error if the recipientAddressOrEns is invalid", () => {
        const withdrawErc20Params = {
          amount: BigInt(1),
          type: TokenType.ERC20,
          recipientAddressOrEns: TEST_INVALID_ADDRESS,
          tokenAddress: TEST_ADDRESS,
        };
        expect(() =>
          WithdrawErc20Schema.strict().validateSync(withdrawErc20Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the tokenAddress is invalid", () => {
        const withdrawErc20Params = {
          amount: BigInt(1),
          type: TokenType.ERC20,
          recipientAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_INVALID_ADDRESS,
        };
        expect(() =>
          WithdrawErc20Schema.strict().validateSync(withdrawErc20Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
    });
    describe("Test withdraw erc721", () => {
      it("should validate a valid WithdrawErc721", () => {
        const withdrawErc721Params: WithdrawParams = {
          type: TokenType.ERC721,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        WithdrawErc721Schema.strict().validateSync(withdrawErc721Params);
      });
      it("should throw an error if the type is missing", () => {
        const withdrawErc721Params = {
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          WithdrawErc721Schema.strict().validateSync(withdrawErc721Params)
        )
          .toThrow(
            new ValidationError("type is a required field"),
          );
      });
      it("should throw an error if the recipientAddressOrEns is missing", () => {
        const withdrawErc721Params = {
          type: TokenType.ERC721,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          WithdrawErc721Schema.strict().validateSync(withdrawErc721Params)
        )
          .toThrow(
            new ValidationError("recipientAddressOrEns is a required field"),
          );
      });
      it("should throw an error if the daoAddressOrEns is missing", () => {
        const withdrawErc721Params = {
          type: TokenType.ERC721,
          recipientAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          WithdrawErc721Schema.strict().validateSync(withdrawErc721Params)
        )
          .toThrow(
            new ValidationError("daoAddressOrEns is a required field"),
          );
      });
      it("should throw an error if the tokenAddress is missing", () => {
        const withdrawErc721Params = {
          type: TokenType.ERC721,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          WithdrawErc721Schema.strict().validateSync(withdrawErc721Params)
        )
          .toThrow(
            new ValidationError("tokenAddress is a required field"),
          );
      });
      it("should throw an error if the tokenId is missing", () => {
        const withdrawErc721Params = {
          type: TokenType.ERC721,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
        };
        expect(() =>
          WithdrawErc721Schema.strict().validateSync(withdrawErc721Params)
        )
          .toThrow(
            new ValidationError("tokenId is a required field"),
          );
      });
      it("should throw an error if the type is invalid", () => {
        const withdrawErc721Params = {
          type: "invalid",
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          WithdrawErc721Schema.strict().validateSync(withdrawErc721Params)
        )
          .toThrow(
            new ValidationError(
              "type must be one of the following values: erc721",
            ),
          );
      });
      it("should throw an error if the recipientAddressOrEns is invalid", () => {
        const withdrawErc721Params = {
          type: TokenType.ERC721,
          recipientAddressOrEns: TEST_INVALID_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          WithdrawErc721Schema.strict().validateSync(withdrawErc721Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the daoAddressOrEns is invalid", () => {
        const withdrawErc721Params = {
          type: TokenType.ERC721,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_INVALID_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          WithdrawErc721Schema.strict().validateSync(withdrawErc721Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the tokenAddress is invalid", () => {
        const withdrawErc721Params = {
          type: TokenType.ERC721,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_INVALID_ADDRESS,
          tokenId: BigInt(1),
        };
        expect(() =>
          WithdrawErc721Schema.strict().validateSync(withdrawErc721Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the tokenId is invalid", () => {
        const withdrawErc721Params = {
          type: TokenType.ERC721,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenId: 1,
        };
        expect(() =>
          WithdrawErc721Schema.strict().validateSync(withdrawErc721Params)
        )
          .toThrow(
            new ValidationError(new InvalidParameter("bigint").message),
          );
      });
    });
    describe("Test withdraw erc1155", () => {
      it("should validate a valid WithdrawErc1155", () => {
        const withdrawErc1155Params: WithdrawParams = {
          type: TokenType.ERC1155,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params);
      });
      it("should throw an error if the type is missing", () => {
        const withdrawErc1155Params = {
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params)
        )
          .toThrow(
            new ValidationError("type is a required field"),
          );
      });
      it("should throw an error if the recipientAddressOrEns is missing", () => {
        const withdrawErc1155Params = {
          type: TokenType.ERC1155,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params)
        )
          .toThrow(
            new ValidationError("recipientAddressOrEns is a required field"),
          );
      });
      it("should throw an error if the daoAddressOrEns is missing", () => {
        const withdrawErc1155Params = {
          type: TokenType.ERC1155,
          recipientAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params)
        )
          .toThrow(
            new ValidationError("daoAddressOrEns is a required field"),
          );
      });
      it("should throw an error if the tokenAddress is missing", () => {
        const withdrawErc1155Params = {
          type: TokenType.ERC1155,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params)
        )
          .toThrow(
            new ValidationError("tokenAddress is a required field"),
          );
      });
      it("should throw an error if the tokenIds is missing", () => {
        const withdrawErc1155Params = {
          type: TokenType.ERC1155,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          amounts: [BigInt(1)],
        };
        expect(() =>
          WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params)
        )
          .toThrow(
            new ValidationError("tokenIds is a required field"),
          );
      });
      it("should throw an error if the amounts is missing", () => {
        const withdrawErc1155Params = {
          type: TokenType.ERC1155,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
        };
        expect(() =>
          WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params)
        )
          .toThrow(
            new ValidationError("amounts is a required field"),
          );
      });
      it("should throw an error if the type is invalid", () => {
        const withdrawErc1155Params = {
          type: "invalid",
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params)
        )
          .toThrow(
            new ValidationError(
              "type must be one of the following values: erc1155",
            ),
          );
      });
      it("should throw an error if the recipientAddressOrEns is invalid", () => {
        const withdrawErc1155Params: WithdrawParams = {
          type: TokenType.ERC1155,
          recipientAddressOrEns: TEST_INVALID_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the daoAddressOrEns is invalid", () => {
        const withdrawErc1155Params: WithdrawParams = {
          type: TokenType.ERC1155,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_INVALID_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the tokenAddress is invalid", () => {
        const withdrawErc1155Params: WithdrawParams = {
          type: TokenType.ERC1155,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_INVALID_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1)],
        };
        expect(() =>
          WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params)
        )
          .toThrow(
            new ValidationError(new InvalidAddressOrEnsError().message),
          );
      });
      it("should throw an error if the tokenIds are invalid", () => {
        const withdrawErc1155Params = {
          type: TokenType.ERC1155,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [1],
          amounts: [BigInt(1)],
        };
        expect(() =>
          WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params)
        )
          .toThrow(
            new ValidationError(new InvalidParameter("bigint").message),
          );
      });
      it("should throw an error if the amounts are invalid", () => {
        const withdrawErc1155Params = {
          type: TokenType.ERC1155,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [1],
        };
        expect(() =>
          WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params)
        )
          .toThrow(
            new ValidationError(new InvalidParameter("bigint").message),
          );
      });
      it("should throw an error if the tokenIds and amounts are not the same length", () => {
        const withdrawErc1155Params = {
          type: TokenType.ERC1155,
          recipientAddressOrEns: TEST_ADDRESS,
          daoAddressOrEns: TEST_ADDRESS,
          tokenAddress: TEST_ADDRESS,
          tokenIds: [BigInt(1)],
          amounts: [BigInt(1), BigInt(1)],
        };
        expect(() =>
          WithdrawErc1155Schema.strict().validateSync(withdrawErc1155Params)
        )
          .toThrow(
            new ValidationError(
              new SizeMismatchError("tokenIds", "amounts").message,
            ),
          );
      });
    });
  });
  describe("Test register standard callback", () => {
    it("should validate a valid RegisterStandardCallback", () => {
      const registerStandardCallbackParams: RegisterStandardCallbackParams = {
        interfaceId: TEST_ADDRESS,
        callbackSelector: TEST_ADDRESS,
        magicNumber: TEST_ADDRESS,
      };
      RegisterStandardCallbackSchema.strict().validateSync(
        registerStandardCallbackParams,
      );
    });
    it("should throw an error if the interfaceId is missing", () => {
      const registerStandardCallbackParams = {
        callbackSelector: TEST_ADDRESS,
        magicNumber: TEST_ADDRESS,
      };
      expect(() =>
        RegisterStandardCallbackSchema.strict().validateSync(
          registerStandardCallbackParams,
        )
      )
        .toThrow(
          new ValidationError("interfaceId is a required field"),
        );
    });
    it("should throw an error if the callbackSelector is missing", () => {
      const registerStandardCallbackParams = {
        interfaceId: TEST_ADDRESS,
        magicNumber: TEST_ADDRESS,
      };
      expect(() =>
        RegisterStandardCallbackSchema.strict().validateSync(
          registerStandardCallbackParams,
        )
      )
        .toThrow(
          new ValidationError("callbackSelector is a required field"),
        );
    });
    it("should throw an error if the magicNumber is missing", () => {
      const registerStandardCallbackParams = {
        interfaceId: TEST_ADDRESS,
        callbackSelector: TEST_ADDRESS,
      };
      expect(() =>
        RegisterStandardCallbackSchema.strict().validateSync(
          registerStandardCallbackParams,
        )
      )
        .toThrow(
          new ValidationError("magicNumber is a required field"),
        );
    });
  });
  describe("Test upgradeToAndCall", () => {
    it("should validate a valid UpgradeToAndCall", () => {
      const upgradeToAndCallParams: UpgradeToAndCallParams = {
        implementationAddress: TEST_ADDRESS,
        data: new Uint8Array(),
      };
      UpgradeToAndCallSchema.strict().validateSync(upgradeToAndCallParams);
    });
    it("should throw an error if the newImplementation is missing", () => {
      const upgradeToAndCallParams = {
        data: new Uint8Array(),
      };
      expect(() =>
        UpgradeToAndCallSchema.strict().validateSync(
          upgradeToAndCallParams,
        )
      )
        .toThrow(
          new ValidationError("implementationAddress is a required field"),
        );
    });
    it("should throw an error if the data is missing", () => {
      const upgradeToAndCallParams = {
        implementationAddress: TEST_ADDRESS,
      };
      expect(() =>
        UpgradeToAndCallSchema.strict().validateSync(
          upgradeToAndCallParams,
        )
      )
        .toThrow(
          new ValidationError("data is a required field"),
        );
    });
    it("should throw an error if the newImplementation is invalid", () => {
      const upgradeToAndCallParams: UpgradeToAndCallParams = {
        implementationAddress: TEST_INVALID_ADDRESS,
        data: new Uint8Array(),
      };
      expect(() =>
        UpgradeToAndCallSchema.strict().validateSync(
          upgradeToAndCallParams,
        )
      )
        .toThrow(
          new ValidationError(new InvalidAddressOrEnsError().message),
        );
    });
    it("should throw an error if the data is invalid", () => {
      const upgradeToAndCallParams = {
        implementationAddress: TEST_ADDRESS,
        data: {},
      };
      expect(() =>
        UpgradeToAndCallSchema.strict().validateSync(
          upgradeToAndCallParams,
        )
      )
        .toThrow(
          new ValidationError(
            "Invalid parameter:Uint8Array",
          ),
        );
    });
  });
  describe("Test InitializeFrom", () => {
    it("should validate a valid InitializeFrom", () => {
      const initializeFromParams: InitializeFromParams = {
        previousVersion: [1, 0, 0],
        initData: new Uint8Array(),
      };
      InitializeFromSchema.strict().validateSync(initializeFromParams);
    });
    it("should validate without optional fields", () => {
      const initializeFromParams: InitializeFromParams = {
        previousVersion: [1, 0, 0],
      };
      InitializeFromSchema.strict().validateSync(initializeFromParams);
    });
    it("should throw an error if the previousVersion is missing", () => {
      const initializeFromParams = {
        initData: new Uint8Array(),
      };
      expect(() =>
        InitializeFromSchema.strict().validateSync(
          initializeFromParams,
        )
      )
        .toThrow(
          new ValidationError("previousVersion is a required field"),
        );
    });
    it("should throw an error if the previousVersion is invalid", () => {
      const initializeFromParams = {
        previousVersion: [1, 0],
        initData: new Uint8Array(),
      };
      expect(() =>
        InitializeFromSchema.strict().validateSync(
          initializeFromParams,
        )
      )
        .toThrow(
          new ValidationError(
            "previousVersion must have 3 items",
          ),
        );
    });
    it("should throw an error if the initData is invalid", () => {
      const initializeFromParams = {
        previousVersion: [1, 0, 0],
        initData: {},
      };
      expect(() =>
        InitializeFromSchema.strict().validateSync(
          initializeFromParams,
        )
      )
        .toThrow(
          new ValidationError(
            "Invalid parameter:Uint8Array",
          ),
        );
    });
  });
});
