// @ts-ignore
declare const describe, it, expect;

import {
  Client,
  Context,
  IEncodingResult,
  IFreezePermissionParams,
  IGrantPermissionParams,
  IRevokePermissionParams,
  IWithdrawParams,
  Permissions,
} from "../../../src";
import { contextParamsLocalChain } from "../constants";

describe("Client", () => {
  describe("Action generators", () => {
    it("Should create a client and generate a withdraw action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const withdrawParams: IWithdrawParams = {
        recipientAddress: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
        reference: "test",
      };

      const withdrawAction = await client.encoding.withdrawAction(
        "0x1234567890123456789012345678901234567890",
        withdrawParams
      );

      expect(typeof withdrawAction).toBe("object");
      expect(withdrawAction.data).toBeInstanceOf(Uint8Array);
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
      let actions: IEncodingResult[] = [];
      for (let i = 0; i < paramsArray.length; i++) {
        const params = paramsArray[i];
        actions.push(client.encoding.grantAction(daoAddresses[i], params));
      }

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        expect(typeof action).toBe("object");
        expect(action.to).toBe(daoAddresses[i]);
        expect(action.data).toBeInstanceOf(Uint8Array);
      }
      expect(actions[0].data === actions[1].data).toBe(false);
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
      let actions: IEncodingResult[] = [];
      for (let i = 0; i < paramsArray.length; i++) {
        const params = paramsArray[i];
        actions.push(client.encoding.revokeAction(daoAddresses[i], params));
      }

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        expect(typeof action).toBe("object");
        expect(action.to).toBe(daoAddresses[i]);
        expect(action.data).toBeInstanceOf(Uint8Array);
      }
      expect(actions[0].data === actions[1].data).toBe(false);
    });
    it("Should create a client and generate a freeze action", () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const daoAddresses = [
        "0x2468013579246801357924680135792468013579",
        "0x1357924680135792468013579246801357924680",
      ];

      const paramsArray: IFreezePermissionParams[] = [
        {
          where: "0x1234567890123456789012345678901234567890",
          permission: Permissions.UPGRADE_PERMISSION,
        },
        {
          where: "0x0987654321098765432109876543210987654321",
          permission: Permissions.EXECUTE_PERMISSION,
        },
      ];
      let actions: IEncodingResult[] = [];
      for (let i = 0; i < paramsArray.length; i++) {
        const params = paramsArray[i];
        actions.push(client.encoding.freezeAction(daoAddresses[i], params));
      }

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        expect(typeof action).toBe("object");
        expect(action.to).toBe(daoAddresses[i]);
        expect(action.data).toBeInstanceOf(Uint8Array);
      }
      expect(actions[0].data === actions[1].data).toBe(false);
    });
    it("Should encode an update metadata raw action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const installEntry = await client.encoding.updateMetadataAction(
        "0x1234567890123456789012345678901234567890",
        "Qmfeqee"
      );

      expect(typeof installEntry).toBe("object");
      expect(installEntry.data).toBeInstanceOf(Uint8Array);
    });
  });
});
