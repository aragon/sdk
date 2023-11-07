// @ts-ignore
declare const describe, it, expect;

// mocks need to be at the top of the imports
import "../../mocks/aragon-sdk-ipfs";
import * as ganacheSetup from "../../helpers/ganache-setup";
import * as deployContracts from "../../helpers/deployContracts";
import {
  DAO__factory,
  PluginSetupProcessor__factory,
} from "@aragon/osx-ethers";

import {
  Client,
  DaoMetadata,
  DaoUpdateParams,
  GrantPermissionParams,
  InitializeFromParams,
  RegisterStandardCallbackParams,
  RevokePermissionParams,
  UpgradeToAndCallParams,
  WithdrawParams,
} from "../../../src";
import {
  ADDRESS_ONE,
  ADDRESS_THREE,
  ADDRESS_TWO,
  contextParamsLocalChain,
} from "../constants";
import { toUtf8Bytes, toUtf8String } from "@ethersproject/strings";
import { keccak256 } from "@ethersproject/keccak256";
import { AddressZero } from "@ethersproject/constants";
import {
  ApplyInstallationParams,
  ApplyUninstallationParams,
  ApplyUpdateParams,
  bytesToHex,
  Context,
  DaoAction,
  hexToBytes,
  PermissionIds,
  Permissions,
  TokenType,
} from "@aragon/sdk-client-common";
import { Server } from "ganache";

describe("Client", () => {
  let deployment: deployContracts.Deployment;
  let server: Server;
  beforeAll(async () => {
    server = await ganacheSetup.start();
    deployment = await deployContracts.deploy();
    contextParamsLocalChain.ensRegistryAddress = ADDRESS_ONE;
    contextParamsLocalChain.pluginSetupProcessorAddress = ADDRESS_TWO;
    contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
  });
  afterAll(async () => {
    await server.close();
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

    it("Should create a client and generate an ERC721 withdraw action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const withdrawParams: WithdrawParams = {
        type: TokenType.ERC721,
        tokenAddress: ADDRESS_ONE,
        recipientAddressOrEns: ADDRESS_TWO,
        daoAddressOrEns: ADDRESS_THREE,
        tokenId: BigInt(10),
      };

      const withdrawAction = await client.encoding.withdrawAction(
        withdrawParams,
      );

      expect(typeof withdrawAction).toBe("object");
      expect(withdrawAction.data).toBeInstanceOf(Uint8Array);
      expect(withdrawAction.to).toBe(withdrawParams.tokenAddress);
      expect(withdrawAction.value).toBe(BigInt(0));
      expect(bytesToHex(withdrawAction.data)).toBe(
        "0x42842e0e00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a",
      );
    });
    it("Should create a client and generate an ERC1155 withdraw action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const withdrawParams: WithdrawParams = {
        type: TokenType.ERC1155,
        tokenAddress: ADDRESS_ONE,
        recipientAddressOrEns: ADDRESS_TWO,
        daoAddressOrEns: ADDRESS_THREE,
        tokenIds: [BigInt(10)],
        amounts: [BigInt(20)],
      };

      const withdrawAction = await client.encoding.withdrawAction(
        withdrawParams,
      );

      expect(typeof withdrawAction).toBe("object");
      expect(withdrawAction.data).toBeInstanceOf(Uint8Array);
      expect(withdrawAction.to).toBe(withdrawParams.tokenAddress);
      expect(withdrawAction.value).toBe(BigInt(0));
      expect(bytesToHex(withdrawAction.data)).toBe(
        "0xf242432a00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000",
      );
    });
    it("Should create a client and generate a grant action", () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const daoAddresses = [
        "0x2468013579246801357924680135792468013579",
        "0x1357924680135792468013579246801357924680",
      ];
      const paramsArray: GrantPermissionParams[] = [
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
      const paramsArray: RevokePermissionParams[] = [
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
          permissionId: PermissionIds.EXECUTE_PERMISSION_ID,
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
          applyInstallationParams.permissions[parseInt(index)]
            .permissionId,
        );
      }
    });
    it("Should encode an applyUninstallation action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const applyUninstallationParams: ApplyUninstallationParams = {
        permissions: [{
          operation: 1,
          permissionId: PermissionIds.EXECUTE_PERMISSION_ID,
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
      const actions = client.encoding.applyUninstallationAction(
        daoAddress,
        applyUninstallationParams,
      );

      expect(actions.length).toBe(3);
      expect(typeof actions[1]).toBe("object");
      expect(actions[1].data).toBeInstanceOf(Uint8Array);

      const daoInterface = PluginSetupProcessor__factory.createInterface();
      const hexString = bytesToHex(actions[1].data);
      const argsDecoded = daoInterface.decodeFunctionData(
        "applyUninstallation",
        hexString,
      );
      expect(argsDecoded.length).toBe(2);
      expect(argsDecoded[0]).toBe(
        daoAddress,
      );
      expect(argsDecoded[1].pluginSetupRef.versionTag.build).toBe(
        applyUninstallationParams.versionTag.build,
      );
      expect(argsDecoded[1].pluginSetupRef.versionTag.release).toBe(
        applyUninstallationParams.versionTag.release,
      );
      expect(argsDecoded[1].plugin).toBe(
        applyUninstallationParams.pluginAddress,
      );
      expect(argsDecoded[1].pluginSetupRef.pluginSetupRepo).toBe(
        applyUninstallationParams.pluginRepo,
      );
      for (const index in argsDecoded[1].permissions) {
        expect(argsDecoded[1].permissions[parseInt(index)].operation).toBe(
          applyUninstallationParams.permissions[parseInt(index)].operation,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].where).toBe(
          applyUninstallationParams.permissions[parseInt(index)].where,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].who).toBe(
          applyUninstallationParams.permissions[parseInt(index)].who,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].condition).toBe(
          AddressZero,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].permissionId).toBe(
          applyUninstallationParams.permissions[parseInt(index)]
            .permissionId,
        );
      }
    });
    it("Should encode an applyUpdate action without permissions", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const applyUpdateParams: ApplyUpdateParams = {
        permissions: [],
        versionTag: {
          build: 1,
          release: 1,
        },
        pluginRepo: "0x2345678901234567890123456789012345678901",
        pluginAddress: "0x1234567890123456789012345678901234567890",
        initData: new Uint8Array([0, 1, 2, 3]),
        helpers: [],
      };
      const daoAddress = "0x1234567890123456789012345678901234567890";
      const actions = client.encoding.applyUpdateAction(
        daoAddress,
        applyUpdateParams,
      );

      expect(actions.length).toBe(3);
      expect(typeof actions[1]).toBe("object");
      expect(actions[1].data).toBeInstanceOf(Uint8Array);

      const daoInterface = PluginSetupProcessor__factory.createInterface();
      const hexString = bytesToHex(actions[1].data);
      const argsDecoded = daoInterface.decodeFunctionData(
        "applyUpdate",
        hexString,
      );
      expect(argsDecoded.length).toBe(2);
      expect(argsDecoded[0]).toBe(
        daoAddress,
      );
      expect(argsDecoded[1].pluginSetupRef.versionTag.build).toBe(
        applyUpdateParams.versionTag.build,
      );
      expect(argsDecoded[1].pluginSetupRef.versionTag.release).toBe(
        applyUpdateParams.versionTag.release,
      );
      expect(argsDecoded[1].plugin).toBe(
        applyUpdateParams.pluginAddress,
      );
      expect(argsDecoded[1].pluginSetupRef.pluginSetupRepo).toBe(
        applyUpdateParams.pluginRepo,
      );
      for (const index in argsDecoded[1].permissions) {
        expect(argsDecoded[1].permissions[parseInt(index)].operation).toBe(
          applyUpdateParams.permissions[parseInt(index)].operation,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].where).toBe(
          applyUpdateParams.permissions[parseInt(index)].where,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].who).toBe(
          applyUpdateParams.permissions[parseInt(index)].who,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].condition).toBe(
          AddressZero,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].permissionId).toBe(
          applyUpdateParams.permissions[parseInt(index)]
            .permissionId,
        );
      }
    });
    it("Should encode an applyUpdate action with permissions", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const applyUpdateParams: ApplyUpdateParams = {
        permissions: [{
          operation: 1,
          permissionId: PermissionIds.EXECUTE_PERMISSION_ID,
          where: "0x1234567890123456789012345678901234567890",
          who: "0x2345678901234567890123456789012345678901",
        }],
        versionTag: {
          build: 1,
          release: 1,
        },
        pluginRepo: "0x2345678901234567890123456789012345678901",
        pluginAddress: "0x1234567890123456789012345678901234567890",
        initData: new Uint8Array([0, 1, 2, 3]),
        helpers: [],
      };
      const daoAddress = "0x1234567890123456789012345678901234567890";
      const actions = client.encoding.applyUpdateAction(
        daoAddress,
        applyUpdateParams,
      );

      expect(actions.length).toBe(5);
      expect(typeof actions[1]).toBe("object");
      expect(actions[1].data).toBeInstanceOf(Uint8Array);

      const daoInterface = PluginSetupProcessor__factory.createInterface();
      const hexString = bytesToHex(actions[2].data);
      const argsDecoded = daoInterface.decodeFunctionData(
        "applyUpdate",
        hexString,
      );
      expect(argsDecoded.length).toBe(2);
      expect(argsDecoded[0]).toBe(
        daoAddress,
      );
      expect(argsDecoded[1].pluginSetupRef.versionTag.build).toBe(
        applyUpdateParams.versionTag.build,
      );
      expect(argsDecoded[1].pluginSetupRef.versionTag.release).toBe(
        applyUpdateParams.versionTag.release,
      );
      expect(argsDecoded[1].plugin).toBe(
        applyUpdateParams.pluginAddress,
      );
      expect(argsDecoded[1].pluginSetupRef.pluginSetupRepo).toBe(
        applyUpdateParams.pluginRepo,
      );
      for (const index in argsDecoded[1].permissions) {
        expect(argsDecoded[1].permissions[parseInt(index)].operation).toBe(
          applyUpdateParams.permissions[parseInt(index)].operation,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].where).toBe(
          applyUpdateParams.permissions[parseInt(index)].where,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].who).toBe(
          applyUpdateParams.permissions[parseInt(index)].who,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].condition).toBe(
          AddressZero,
        );
        expect(argsDecoded[1].permissions[parseInt(index)].permissionId).toBe(
          applyUpdateParams.permissions[parseInt(index)]
            .permissionId,
        );
      }
    });

    it("Should encode an initializeFrom action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const params: InitializeFromParams = {
        previousVersion: [1, 0, 0],
        initData: new Uint8Array([0, 1, 2, 3]),
      };
      const action = client.encoding.initializeFromAction(
        "0x1234567890123456789012345678901234567890",
        params,
      );
      expect(typeof action).toBe("object");
      expect(action.data).toBeInstanceOf(Uint8Array);

      const daoInterface = DAO__factory.createInterface();
      const hexString = bytesToHex(action.data);
      const argsDecoded = daoInterface.decodeFunctionData(
        "initializeFrom",
        hexString,
      );
      expect(argsDecoded.length).toBe(2);
      for (const index in argsDecoded[0]) {
        expect(argsDecoded[0][parseInt(index)]).toBe(
          params.previousVersion[parseInt(index)],
        );
      }
      expect(argsDecoded[1]).toBe(
        bytesToHex(params.initData as Uint8Array),
      );
    });
    it("Should encode a DaoUpdate action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const daoUpdateParams: DaoUpdateParams = {
        previousVersion: [1, 0, 0],
      };
      const action = await client.encoding.daoUpdateAction(
        "0x1234567890123456789012345678901234567890",
        daoUpdateParams,
      );
      expect(typeof action).toBe("object");
      expect(action.data).toBeInstanceOf(Uint8Array);

      const daoInterface = DAO__factory.createInterface();
      const upgradeToDecoded = daoInterface.decodeFunctionData(
        "upgradeToAndCall",
        bytesToHex(action.data),
      );
      const initializeFromDecoded = daoInterface.decodeFunctionData(
        "initializeFrom",
        hexToBytes(upgradeToDecoded[1]),
      );
      expect(initializeFromDecoded.length).toBe(2);
      expect(initializeFromDecoded[0].length).toBe(3);
      expect(initializeFromDecoded[1]).toBe(
        bytesToHex(new Uint8Array(0)),
      );
    });
  });
});
