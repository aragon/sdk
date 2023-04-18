// @ts-ignore
declare const describe, it, expect;

// mocks need to be at the top of the imports
import "../../mocks/aragon-sdk-ipfs";
import {
  DAO__factory,
  PluginSetupProcessor__factory,
} from "@aragon/osx-ethers";

import {
  ApplyInstallationParams,
  Client,
  Context,
  DaoMetadata,
  IGrantPermissionParams,
  IRevokePermissionParams,
  Permissions,
  WithdrawParams,
} from "../../../src";
import {
  DaoAction,
  SupportedNetworksArray,
} from "../../../src/client-common/interfaces/common";
import { ADDRESS_ONE, contextParamsLocalChain } from "../constants";
import {
  PermissionIds,
  RegisterStandardCallbackParams,
  TokenType,
  UpgradeToAndCallParams,
} from "../../../src/interfaces";
import { toUtf8Bytes, toUtf8String } from "@ethersproject/strings";
import { bytesToHex, hexToBytes } from "@aragon/sdk-common";
import { keccak256 } from "@ethersproject/keccak256";
import { JsonRpcProvider } from "@ethersproject/providers";

jest.spyOn(SupportedNetworksArray, "includes").mockReturnValue(true);
jest.spyOn(Context.prototype, "network", "get").mockReturnValue(
  { chainId: 5, name: "goerli" },
);
describe("Client", () => {
  beforeAll(() => {
    contextParamsLocalChain.ensRegistryAddress = ADDRESS_ONE;
  });
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
      expect(bytesToHex(withdrawAction.data)).toBe(
        "0xa9059cbb0000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000a",
      );
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

      const action = await client.encoding.updateDaoMetadataAction(
        "0x1234567890123456789012345678901234567890",
        ipfsUri,
      );

      expect(typeof action).toBe("object");
      expect(action.data).toBeInstanceOf(Uint8Array);

      const daoInterface = DAO__factory.createInterface();
      const hexString = bytesToHex(action.data);
      const argsDecoded = daoInterface.decodeFunctionData(
        "setMetadata",
        hexString,
      );
      expect(argsDecoded.length).toBe(1);
      expect(toUtf8String(argsDecoded[0])).toBe(
        "ipfs://QmXhJawTJ3PkoKMyF3a4D89zybAHjpcGivkb7F1NkHAjpo",
      );
    });
    it("Should encode a grant with condition action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const action = client.encoding.grantWithConditionAction(
        "0x1234567890123456789012345678901234567890",
        {
          permission: Permissions.EXECUTE_PERMISSION,
          condition: "0x3456789012345678901234567890123456789012",
          where: "0x0987654321098765432109876543210987654321",
          who: "0x0987654321098765432109876543210987654321",
        },
      );

      expect(typeof action).toBe("object");
      expect(action.data).toBeInstanceOf(Uint8Array);

      const daoInterface = DAO__factory.createInterface();
      const hexString = bytesToHex(action.data);
      const argsDecoded = daoInterface.decodeFunctionData(
        "grantWithCondition",
        hexString,
      );
      expect(argsDecoded.length).toBe(4);
      expect(argsDecoded[0]).toBe(
        "0x0987654321098765432109876543210987654321",
      );
      expect(argsDecoded[1]).toBe(
        "0x0987654321098765432109876543210987654321",
      );
      expect(argsDecoded[2]).toBe(
        keccak256(toUtf8Bytes(Permissions.EXECUTE_PERMISSION)),
      );
      expect(argsDecoded[3]).toBe(
        "0x3456789012345678901234567890123456789012",
      );
    });
    it("Should encode a set Dao URI action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const daoUri = "https://dao.example.org";

      const action = client.encoding.setDaoUriAction(
        "0x1234567890123456789012345678901234567890",
        daoUri,
      );

      expect(typeof action).toBe("object");
      expect(action.data).toBeInstanceOf(Uint8Array);

      const daoInterface = DAO__factory.createInterface();
      const hexString = bytesToHex(action.data);
      const argsDecoded = daoInterface.decodeFunctionData(
        "setDaoURI",
        hexString,
      );
      expect(argsDecoded.length).toBe(1);
      expect(argsDecoded[0]).toBe(
        daoUri,
      );
    });
    it("Should encode a register standard callback action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const registerStandardCallbackParams: RegisterStandardCallbackParams = {
        interfaceId: "0x00000001",
        callbackSelector: "0x00000001",
        magicNumber: "0x00000001",
      };

      const action = client.encoding.registerStandardCallbackAction(
        "0x1234567890123456789012345678901234567890",
        registerStandardCallbackParams,
      );

      expect(typeof action).toBe("object");
      expect(action.data).toBeInstanceOf(Uint8Array);

      const daoInterface = DAO__factory.createInterface();
      const hexString = bytesToHex(action.data);
      const argsDecoded = daoInterface.decodeFunctionData(
        "registerStandardCallback",
        hexString,
      );
      expect(argsDecoded.length).toBe(3);
      expect(argsDecoded[0]).toBe(
        registerStandardCallbackParams.interfaceId,
      );
      expect(argsDecoded[1]).toBe(
        registerStandardCallbackParams.callbackSelector,
      );
      expect(argsDecoded[2]).toBe(
        registerStandardCallbackParams.magicNumber,
      );
    });
    it("Should encode a set signature validator action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const validatorAddress = "0x1234567890123456789012345678901234567890";

      const action = client.encoding.setSignatureValidatorAction(
        "0x1234567890123456789012345678901234567890",
        validatorAddress,
      );

      expect(typeof action).toBe("object");
      expect(action.data).toBeInstanceOf(Uint8Array);

      const daoInterface = DAO__factory.createInterface();
      const hexString = bytesToHex(action.data);
      const argsDecoded = daoInterface.decodeFunctionData(
        "setSignatureValidator",
        hexString,
      );
      expect(argsDecoded.length).toBe(1);
      expect(argsDecoded[0]).toBe(
        validatorAddress,
      );
    });
    it("Should encode an update proxy implementation action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const implementationAddress =
        "0x1234567890123456789012345678901234567890";

      const action = client.encoding.upgradeToAction(
        "0x1234567890123456789012345678901234567890",
        implementationAddress,
      );

      expect(typeof action).toBe("object");
      expect(action.data).toBeInstanceOf(Uint8Array);

      const daoInterface = DAO__factory.createInterface();
      const hexString = bytesToHex(action.data);
      const argsDecoded = daoInterface.decodeFunctionData(
        "upgradeTo",
        hexString,
      );
      expect(argsDecoded.length).toBe(1);
      expect(argsDecoded[0]).toBe(
        implementationAddress,
      );
    });
    it("Should encode an update proxy implementation and call action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const params: UpgradeToAndCallParams = {
        implementationAddress: "0x1234567890123456789012345678901234567890",
        data: new Uint8Array([0, 1, 2, 3]),
      };

      const action = client.encoding.upgradeToAndCallAction(
        "0x1234567890123456789012345678901234567890",
        params,
      );

      expect(typeof action).toBe("object");
      expect(action.data).toBeInstanceOf(Uint8Array);

      const daoInterface = DAO__factory.createInterface();
      const hexString = bytesToHex(action.data);
      const argsDecoded = daoInterface.decodeFunctionData(
        "upgradeToAndCall",
        hexString,
      );
      expect(argsDecoded.length).toBe(2);
      expect(argsDecoded[0]).toBe(
        params.implementationAddress,
      );
      expect(argsDecoded[1]).toBe(
        bytesToHex(params.data),
      );
    });
    it("Should encode an applyInstallation action", async () => {
      const networkSpy = jest.spyOn(JsonRpcProvider.prototype, "network", "get");
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const applyInstallationParams: ApplyInstallationParams = {
        helpers: [
          "0x1234567890123456789012345678901234567890",
          "0x2345678901234567890123456789012345678901",
          "0x3456789012345678901234567890123456789012",
          "0x4567890123456789012345678901234567890123",
          "0x5678901234567890123456789012345678901234",
        ],
        permissions: [{
          condition: "0x1234567890123456789012345678901234567890",
          operation: 1,
          permissionId: hexToBytes(PermissionIds.EXECUTE_PERMISSION_ID),
          where: "0x1234567890123456789012345678901234567890",
          who: "0x2345678901234567890123456789012345678901",
        }],
        versionTag: {
          build: 1,
          release: 1,
        },
        pluginRepo: "0x2345678901234567890123456789012345678901",
        pluginAddress: "0x1234567890123456789012345678901234567890",
      };
      const daoAddress = "0x1234567890123456789012345678901234567890";
      networkSpy.mockReturnValueOnce({
        name: "goerli",
        chainId: 31337,
      });
      const actions = client.encoding.applyInstallationAction(
        daoAddress,
        applyInstallationParams,
      );

      expect(actions.length).toBe(3);
      expect(typeof actions[1]).toBe("object");
      expect(actions[1].data).toBeInstanceOf(Uint8Array);

      const daoInterface = PluginSetupProcessor__factory.createInterface();
      const hexString = bytesToHex(actions[1].data);
      const argsDecoded = daoInterface.decodeFunctionData(
        "applyInstallation",
        hexString,
      );
      expect(argsDecoded.length).toBe(2);
      expect(argsDecoded[0]).toBe(
        daoAddress,
      );
      expect(argsDecoded[1].pluginSetupRef.versionTag.build).toBe(
        applyInstallationParams.versionTag.build,
      );
      expect(argsDecoded[1].pluginSetupRef.versionTag.release).toBe(
        applyInstallationParams.versionTag.release,
      );
      expect(argsDecoded[1].plugin).toBe(
        applyInstallationParams.pluginAddress,
      );
      expect(argsDecoded[1].pluginSetupRef.pluginSetupRepo).toBe(
        applyInstallationParams.pluginRepo,
      );
      for (const index in argsDecoded[1].permissions) {
        expect(argsDecoded[1].permissions[parseInt(index)].operation).toBe(
          applyInstallationParams.permissions[parseInt(index)].operation,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].where).toBe(
          applyInstallationParams.permissions[parseInt(index)].where,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].who).toBe(
          applyInstallationParams.permissions[parseInt(index)].who,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].condition).toBe(
          applyInstallationParams.permissions[parseInt(index)].condition,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].permissionId).toBe(
          bytesToHex(
            applyInstallationParams.permissions[parseInt(index)].permissionId,
          ),
        );
      }
    });
  });
});
