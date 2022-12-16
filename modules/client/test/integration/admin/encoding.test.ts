// @ts-ignore
declare const describe, it, expect;

import {
  AdminClient,
} from "../../../src";
import {
  InvalidAddressOrEnsError,
} from "@aragon/sdk-common";
import { TEST_INVALID_ADDRESS } from "../constants";
describe("Client Admin", () => {
  describe("Action generators", () => {
    it("Should create an Admin client and generate a install entry", async () => {
      const installPluginItemItem = AdminClient.encoding
        .getPluginInstallItem(
          "0x0123456789012345678901234567890123456789",
        );

      expect(typeof installPluginItemItem).toBe("object");
      expect(installPluginItemItem.data).toBeInstanceOf(Uint8Array);
    });
    it("Should create an Admin client and fail to generate a install entry", async () => {
      expect(() =>
        AdminClient.encoding
          .getPluginInstallItem(
            TEST_INVALID_ADDRESS,
          )
      ).rejects.toThrow(new InvalidAddressOrEnsError());
    });
  });
});
