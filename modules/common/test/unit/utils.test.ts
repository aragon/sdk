import { getInterfaceId } from "../../src/utils";
import { ERC165_ABI } from "./constants";
import { Interface } from "@ethersproject/abi";

describe("Utils", () => {
  describe("getInterfaceId", () => {
    it("should return the interface id for an ERC165 contract", () => {
      const result = getInterfaceId(new Interface(ERC165_ABI));
      // defined here: https://eips.ethereum.org/EIPS/eip-165
      expect(result).toEqual("0x36372b07");
    });
  });
});
