import { TokenType } from "@aragon/sdk-client-common";
import { SubgraphContractType } from "../../../src/tokenVoting/internal/types";
import { parseToken } from "../../../src/tokenVoting/internal/utils";

describe("tokenVoting-client utils", () => {
  describe("parseToken", () => {
    it("should return ERC721", () => {
      const token = parseToken({
        __typename: SubgraphContractType.ERC721,
        id: "0x1234567890123456789012345678901234567890",
        name: "TestToken",
        symbol: "TT",
      });
      expect(token).toEqual({
        address: "0x1234567890123456789012345678901234567890",
        name: "TestToken",
        symbol: "TT",
        type: TokenType.ERC721,
      });
    });
    it("should return ERC20", () => {
      const token = parseToken({
        __typename: SubgraphContractType.ERC20,
        id: "0x1234567890123456789012345678901234567890",
        name: "TestToken",
        symbol: "TT",
        decimals: 18,
      });
      expect(token).toEqual({
        address: "0x1234567890123456789012345678901234567890",
        name: "TestToken",
        symbol: "TT",
        decimals: 18,
        type: TokenType.ERC20,
      });
    });
    it("should return ERC20Wrapper", () => {
      const token = parseToken({
        __typename: SubgraphContractType.ERC20_WRAPPER,
        id: "0x1234567890123456789012345678901234567890",
        name: "TestToken",
        symbol: "TT",
        decimals: 18,
        underlyingToken: {
          __typename: SubgraphContractType.ERC20,
          id: "0x1234567890123456789012345678901234567890",
          name: "TestToken",
          symbol: "TT",
          decimals: 18,
        },
      });
      expect(token).toEqual({
        address: "0x1234567890123456789012345678901234567890",
        name: "TestToken",
        symbol: "TT",
        decimals: 18,
        type: TokenType.ERC20,
        underlyingToken: {
          address: "0x1234567890123456789012345678901234567890",
          name: "TestToken",
          symbol: "TT",
          decimals: 18,
          type: TokenType.ERC20,
        },
      });
    });
    it("should return null", () => {
        const token = parseToken({
            // @ts-ignore
            __typename: "Other",
            id: "0x1234567890123456789012345678901234567890",
            name: "TestToken",
            symbol: "TT",
        });
        expect(token).toEqual(null);
    });
  });
});
