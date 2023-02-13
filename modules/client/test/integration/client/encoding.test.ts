// @ts-ignore
declare const describe, it, expect;

// mocks need to be at the top of the imports
import "../../mocks/aragon-sdk-ipfs";
import { DAO__factory } from "@aragon/core-contracts-ethers";

import {
  Client,
  Context,
  DaoMetadata,
  IGrantPermissionParams,
  IRevokePermissionParams,
  Permissions,
  WithdrawParams,
} from "../../../src";
import { DaoAction } from "../../../src/client-common/interfaces/common";
import { contextParamsLocalChain } from "../constants";
import { TokenType } from "../../../src/interfaces";
import { toUtf8String } from "@ethersproject/strings";
import { bytesToHex } from "@aragon/sdk-common";

describe("Client", () => {
  describe("Action generators", () => {
    it("Should create a client and generate a native withdraw action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const withdrawParams: WithdrawParams = {
        type: TokenType.NATIVE,
        recipientAddressOrEns: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
      };

      const withdrawAction = await client.encoding.withdrawAction(
        withdrawParams,
      );

      expect(withdrawAction.value).toBe(withdrawParams.amount);
      expect(withdrawAction.to).toBe(
        withdrawParams.recipientAddressOrEns,
      );
      expect(withdrawAction.data.length).toBe(0);
    });

    it("Should create a client and generate an ERC20 withdraw action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const withdrawParams: WithdrawParams = {
        type: TokenType.ERC20,
        tokenAddress: "0x0123456789012345678901234567890123456789",
        recipientAddressOrEns: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
      };

      const withdrawAction = await client.encoding.withdrawAction(
        withdrawParams,
      );

      expect(typeof withdrawAction).toBe("object");
      expect(withdrawAction.data).toBeInstanceOf(Uint8Array);
      expect(bytesToHex(withdrawAction.data)).toBe("0xa9059cbb0000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000a");
    });
    it("Should create a client and generate a grant action", () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const daoAddresses = [
        "0x2468013579246801357924680135792468013579",
        "0x1357924680135792468013579246801357924680",
      ];
      const paramsArray: IGrantPermissionParams[] = [
        {
          who: "0x0987654321098765432109876543210987654321",
          where: "0x0987654321098765432109876543210987654321",
          permission: Permissions.EXECUTE_PERMISSION,
        },
        {
          who: "0x1234567890123456789012345678901234567890",
          where: "0x1234567890123456789012345678901234567890",
          permission: Permissions.UPGRADE_PERMISSION,
        },
      ];
      let actions: DaoAction[] = [];
      for (let i = 0; i < paramsArray.length; i++) {
        const params = paramsArray[i];
        actions.push(client.encoding.grantAction(daoAddresses[i], params));
      }
      const decoder = new TextDecoder();
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        expect(typeof action).toBe("object");
        expect(action.to).toBe(daoAddresses[i]);
        expect(action.data).toBeInstanceOf(Uint8Array);
      }
      expect(
        decoder.decode(actions[0].data) === decoder.decode(actions[1].data),
      ).toBe(false);
    });
    it("Should create a client and generate a revoke action", () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const daoAddresses = [
        "0x2468013579246801357924680135792468013579",
        "0x1357924680135792468013579246801357924680",
      ];
      const paramsArray: IRevokePermissionParams[] = [
        {
          who: "0x0987654321098765432109876543210987654321",
          where: "0x0987654321098765432109876543210987654321",
          permission: Permissions.EXECUTE_PERMISSION,
        },
        {
          who: "0x1234567890123456789012345678901234567890",
          where: "0x1234567890123456789012345678901234567890",
          permission: Permissions.UPGRADE_PERMISSION,
        },
      ];
      let actions: DaoAction[] = [];
      for (let i = 0; i < paramsArray.length; i++) {
        const params = paramsArray[i];
        actions.push(client.encoding.revokeAction(daoAddresses[i], params));
      }
      const decoder = new TextDecoder();
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        expect(typeof action).toBe("object");
        expect(action.to).toBe(daoAddresses[i]);
        expect(action.data).toBeInstanceOf(Uint8Array);
      }
      expect(
        decoder.decode(actions[0].data) === decoder.decode(actions[1].data),
      ).toBe(false);
    });
    it("Should encode an update metadata raw action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const params: DaoMetadata = {
        name: "New Name",
        description: "New description",
        avatar: "https://theavatar.com/image.jpg",
        links: [
          {
            url: "https://discord.com/...",
            name: "Discord",
          },
          {
            url: "https://twitter.com/...",
            name: "Twitter",
          },
        ],
      };
      const ipfsUri = await client.methods.pinMetadata(params);

      const installEntry = await client.encoding.updateDaoMetadataAction(
        "0x1234567890123456789012345678901234567890",
        ipfsUri,
      );

      expect(typeof installEntry).toBe("object");
      expect(installEntry.data).toBeInstanceOf(Uint8Array);

      const daoInterface = DAO__factory.createInterface();
      const hexString = bytesToHex(installEntry.data);
      const argsDecoded = daoInterface.decodeFunctionData(
        "setMetadata",
        hexString,
      );
      expect(argsDecoded.length).toBe(1);
      expect(toUtf8String(argsDecoded[0])).toBe(
        "ipfs://QmXhJawTJ3PkoKMyF3a4D89zybAHjpcGivkb7F1NkHAjpo",
      );
    });
  });
});
