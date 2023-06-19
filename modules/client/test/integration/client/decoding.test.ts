// @ts-ignore
declare const describe, it, expect;

// mocks need to be at the top of the imports
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";

import {
  ApplyUninstallationParams,
  Client,
  DaoMetadata,
  GrantPermissionDecodedParams,
  GrantPermissionParams,
  GrantPermissionWithConditionParams,
  InitializeFromParams,
  PermissionIds,
  Permissions,
  RegisterStandardCallbackParams,
  RevokePermissionDecodedParams,
  RevokePermissionParams,
  UpgradeToAndCallParams,
  WithdrawParams,
} from "../../../src";
import { ADDRESS_ONE, contextParamsLocalChain } from "../constants";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { bytesToHex } from "@aragon/sdk-common";
import { defaultAbiCoder } from "@ethersproject/abi";
import { JsonRpcProvider } from "@ethersproject/providers";
import { AddressZero } from "@ethersproject/constants";
import {
  ApplyInstallationParams,
  Context,
  PermissionOperationType,
  SupportedNetworksArray,
  TokenType,
} from "@aragon/sdk-client-common";

jest.spyOn(SupportedNetworksArray, "includes").mockReturnValue(true);
jest.spyOn(Context.prototype, "network", "get").mockReturnValue(
  { chainId: 5, name: "goerli" },
);
describe("Client", () => {
  beforeAll(() => {
    contextParamsLocalChain.ensRegistryAddress = ADDRESS_ONE;
  });
  describe("Action decoders", () => {
    it("Should decode an encoded grant action", () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const daoAddresses = [
        "0x2468013579246801357924680135792468013579",
        "0x1357924680135792468013579246801357924680",
      ];
      const paramsArray: GrantPermissionParams[] = [
        {
          who: "0x1234567890123456789012345678901234567890",
          where: "0x1234567890123456789012345678901234567890",
          permission: Permissions.UPGRADE_PERMISSION,
        },
        {
          who: "0x0987654321098765432109876543210987654321",
          where: "0x0987654321098765432109876543210987654321",
          permission: Permissions.EXECUTE_PERMISSION,
        },
      ];
      for (let i = 0; i < paramsArray.length; i++) {
        const params = paramsArray[i];
        const action = client.encoding.grantAction(daoAddresses[i], params);
        const decodedParams: GrantPermissionDecodedParams = client.decoding
          .grantAction(
            action.data,
          );

        expect(decodedParams.permission).toBe(params.permission);
        expect(decodedParams.where).toBe(params.where);
        expect(decodedParams.permissionId).toBe(
          keccak256(toUtf8Bytes(params.permission)),
        );
        expect(decodedParams.who).toBe(params.who);
      }
    });
    it("Should decode an encoded revoke action", () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const daoAddresses = [
        "0x2468013579246801357924680135792468013579",
        "0x1357924680135792468013579246801357924680",
      ];
      const paramsArray: RevokePermissionParams[] = [
        {
          who: "0x1234567890123456789012345678901234567890",
          where: "0x1234567890123456789012345678901234567890",
          permission: Permissions.UPGRADE_PERMISSION,
        },
        {
          who: "0x0987654321098765432109876543210987654321",
          where: "0x0987654321098765432109876543210987654321",
          permission: Permissions.EXECUTE_PERMISSION,
        },
      ];
      for (let i = 0; i < paramsArray.length; i++) {
        const params = paramsArray[i];
        const action = client.encoding.revokeAction(daoAddresses[i], params);
        const decodedParams: RevokePermissionDecodedParams = client.decoding
          .revokeAction(
            action.data,
          );

        expect(decodedParams.permission).toBe(params.permission);
        expect(decodedParams.where).toBe(params.where);
        expect(decodedParams.permissionId).toBe(
          keccak256(toUtf8Bytes(params.permission)),
        );
        expect(decodedParams.who).toBe(params.who);
      }
    });

    it("Should decode an encoded raw withdraw action of a native token", async () => {
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

      const decoded = client.decoding.withdrawAction(
        withdrawAction.to,
        withdrawAction.value,
        withdrawAction.data,
      );

      expect(decoded.amount).toBe(withdrawParams.amount);
      expect(decoded.recipientAddressOrEns).toBe(
        withdrawParams.recipientAddressOrEns,
      );
    });

    it("Should decode an encoded raw withdraw action of an erc20 token", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const withdrawParams: WithdrawParams = {
        type: TokenType.ERC20,
        recipientAddressOrEns: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
        tokenAddress: "0x1234567890098765432112345678900987654321",
      };

      const withdrawAction = await client.encoding.withdrawAction(
        withdrawParams,
      );
      const decodedWithdrawParams: WithdrawParams = client.decoding
        .withdrawAction(
          withdrawAction.to,
          withdrawAction.value,
          withdrawAction.data,
        );

      expect(decodedWithdrawParams.amount).toBe(withdrawParams.amount);
      expect(decodedWithdrawParams.recipientAddressOrEns).toBe(
        withdrawParams.recipientAddressOrEns,
      );
      expect(withdrawAction.to).toBe(withdrawParams.tokenAddress);
    });

    it("Should decode an encoded update metadata action", async () => {
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

      mockedIPFSClient.add.mockResolvedValueOnce({
        hash: "QmTW9uFAcuJym8jWhubPTCdfpyPpK8Rx8trVcvzaSoWHqQ",
      });

      mockedIPFSClient.pin.mockResolvedValueOnce({
        pins: ["QmTW9uFAcuJym8jWhubPTCdfpyPpK8Rx8trVcvzaSoWHqQ"],
        progress: undefined,
      });

      const ipfsUri = await client.methods.pinMetadata(params);

      const updateDaoMetadataAction = await client.encoding
        .updateDaoMetadataAction(
          "0x1234567890123456789012345678901234567890",
          ipfsUri,
        );
      const recoveredIpfsUri: string = await client.decoding
        .updateDaoMetadataRawAction(
          updateDaoMetadataAction.data,
        );
      const ipfsRegex =
        /^ipfs:\/\/(Qm([1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,}))$/;

      const expectedCid =
        "ipfs://QmTW9uFAcuJym8jWhubPTCdfpyPpK8Rx8trVcvzaSoWHqQ";
      expect(ipfsRegex.test(recoveredIpfsUri)).toBe(true);
      expect(recoveredIpfsUri).toBe(expectedCid);
    });

    it("Should try to decode an encoded update metadata action with the withdraws decoder and return an error", async () => {
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
      const updateDaoMetadataAction = await client.encoding
        .updateDaoMetadataAction(
          "0x1234567890123456789012345678901234567890",
          ipfsUri,
        );

      expect(() => client.decoding.grantAction(updateDaoMetadataAction.data))
        .toThrow();
    });

    it("Should try to decode a invalid action and return an error", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);

      expect(() =>
        client.decoding.withdrawAction(
          "0x1234567890123456789012345678901234567890",
          BigInt(10),
          data,
        )
      ).toThrow(
        `data signature does not match function transfer. (argument=\"data\", value=\"0x0b1616212121\", code=INVALID_ARGUMENT, version=abi/5.7.0)`,
      );
    });

    it("Should get the function for a given action data", async () => {
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
      const updateDaoMetadataAction = await client.encoding
        .updateDaoMetadataAction(
          "0x1234567890123456789012345678901234567890",
          ipfsUri,
        );
      const iface = client.decoding.findInterface(updateDaoMetadataAction.data);
      expect(iface?.id).toBe("function setMetadata(bytes)");
      expect(iface?.functionName).toBe("setMetadata");
      expect(iface?.hash).toBe("0xee57e36f");
    });

    it("Should get the function for a withdraw action data", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const params: WithdrawParams = {
        type: TokenType.ERC20,
        amount: BigInt(1),
        tokenAddress: "0x1234567890123456789012345678901234567890",
        recipientAddressOrEns: "0x2345678901234567890123456789012345678901",
      };

      const updateDaoMetadataAction = await client.encoding
        .withdrawAction(
          params,
        );
      const iface = client.decoding.findInterface(updateDaoMetadataAction.data);
      expect(iface?.id).toBe(
        "function transfer(address,uint256) returns (bool)",
      );
      expect(iface?.functionName).toBe("transfer");
      expect(iface?.hash).toBe("0xa9059cbb");
    });

    it("Should try to get the function of an invalid data and return null", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);
      const iface = client.decoding.findInterface(data);
      expect(iface).toBe(null);
    });

    it("Should decode an encoded update metadata raw action", async () => {
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

      mockedIPFSClient.add.mockResolvedValueOnce({
        hash: "QmTW9uFAcuJym8jWhubPTCdfpyPpK8Rx8trVcvzaSoWHqQ",
      });
      mockedIPFSClient.pin.mockResolvedValueOnce({
        pins: ["QmTW9uFAcuJym8jWhubPTCdfpyPpK8Rx8trVcvzaSoWHqQ"],
        progress: undefined,
      });

      const ipfsUri = await client.methods.pinMetadata(params);
      const updateDaoMetadataAction = await client.encoding
        .updateDaoMetadataAction(
          "0x1234567890123456789012345678901234567890",
          ipfsUri,
        );

      mockedIPFSClient.cat.mockResolvedValueOnce(
        Buffer.from(JSON.stringify(params)),
      );

      const decodedParams = await client.decoding
        .updateDaoMetadataAction(updateDaoMetadataAction.data);

      expect(decodedParams.name).toBe(params.name);
      expect(decodedParams.description).toBe(params.description);
      expect(decodedParams.avatar).toBe(params.avatar);
      for (let index = 0; index < params.links.length; index++) {
        expect(decodedParams.links[index].name).toBe(params.links[index].name);
        expect(decodedParams.links[index].url).toBe(params.links[index].url);
      }
    });
    it("Should decode a grant with condition action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const expectedParams: GrantPermissionWithConditionParams = {
        permission: Permissions.EXECUTE_PERMISSION,
        condition: "0x3456789012345678901234567890123456789012",
        where: "0x0987654321098765432109876543210987654321",
        who: "0x0987654321098765432109876543210987654321",
      };
      const action = client.encoding.grantWithConditionAction(
        "0x1234567890123456789012345678901234567890",
        expectedParams,
      );

      const decodedParmas = client.decoding.grantWithConditionAction(
        action.data,
      );

      expect(decodedParmas.condition).toBe(
        expectedParams.condition,
      );
      expect(decodedParmas.where).toBe(
        expectedParams.where,
      );
      expect(decodedParmas.who).toBe(
        expectedParams.who,
      );
      expect(decodedParmas.permission).toBe(
        expectedParams.permission,
      );
    });
    it("Should decode a set Dao URI action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const daoUri = "https://dao.example.org";

      const action = await client.encoding.setDaoUriAction(
        "0x1234567890123456789012345678901234567890",
        daoUri,
      );
      const decodedDaoUri = client.decoding.setDaoUriAction(
        action.data,
      );
      expect(decodedDaoUri).toBe(
        daoUri,
      );
    });
    it("Should decode a register standard callback action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const expectedRegisterStandardCallbackParams:
        RegisterStandardCallbackParams = {
          interfaceId: "0x00000001",
          callbackSelector: "0x00000001",
          magicNumber: "0x00000001",
        };

      const action = await client.encoding.registerStandardCallbackAction(
        "0x1234567890123456789012345678901234567890",
        expectedRegisterStandardCallbackParams,
      );
      const decodedRegisterStandardCallbackParams = client.decoding
        .registerStandardCallbackAction(action.data);
      expect(decodedRegisterStandardCallbackParams.interfaceId).toBe(
        expectedRegisterStandardCallbackParams.interfaceId,
      );
      expect(decodedRegisterStandardCallbackParams.callbackSelector).toBe(
        expectedRegisterStandardCallbackParams.callbackSelector,
      );
      expect(decodedRegisterStandardCallbackParams.magicNumber).toBe(
        expectedRegisterStandardCallbackParams.magicNumber,
      );
    });
    it("Should decode a set signature validator action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const expectedValidatorAddress =
        "0x1234567890123456789012345678901234567890";

      const action = await client.encoding.setSignatureValidatorAction(
        "0x1234567890123456789012345678901234567890",
        expectedValidatorAddress,
      );
      const decodedValidatorAddress = client.decoding
        .setSignatureValidatorAction(action.data);

      expect(expectedValidatorAddress).toBe(
        decodedValidatorAddress,
      );
    });
    it("Should decode an update proxy implementation action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const expectedImplementationAddress =
        "0x1234567890123456789012345678901234567890";

      const action = await client.encoding.upgradeToAction(
        "0x1234567890123456789012345678901234567890",
        expectedImplementationAddress,
      );

      const decodedImplementationAddress = client.decoding
        .upgradeToAction(action.data);

      expect(expectedImplementationAddress).toBe(
        decodedImplementationAddress,
      );
    });
    it("Should decode an update proxy implementation and call action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const expectedUpgradeToAndCallParams: UpgradeToAndCallParams = {
        implementationAddress: "0x1234567890123456789012345678901234567890",
        data: new Uint8Array([0, 1, 2, 3]),
      };

      const action = await client.encoding.upgradeToAndCallAction(
        "0x1234567890123456789012345678901234567890",
        expectedUpgradeToAndCallParams,
      );
      const decodedUpgradeToAndCallParams = client.decoding
        .upgradeToAndCallAction(action.data);

      expect(expectedUpgradeToAndCallParams.implementationAddress).toBe(
        decodedUpgradeToAndCallParams.implementationAddress,
      );
      expect(bytesToHex(expectedUpgradeToAndCallParams.data)).toBe(
        bytesToHex(decodedUpgradeToAndCallParams.data),
      );
    });
    it("Should decode an apply uninstallation action", async () => {
      const networkSpy = jest.spyOn(
        JsonRpcProvider.prototype,
        "network",
        "get",
      );
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const applyUninstallationParams: ApplyUninstallationParams = {
        permissions: [{
          operation: PermissionOperationType.REVOKE,
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
      networkSpy.mockReturnValueOnce({
        name: "goerli",
        chainId: 31337,
      });
      const actions = client.encoding.applyUninstallationAction(
        "0x1234567890123456789012345678901234567890",
        applyUninstallationParams,
      );
      expect(actions.length).toBe(3);
      const decodedApplyUninstallationParams = client.decoding
        .applyUninstallationAction(
          actions[1].data,
        );
      expect(applyUninstallationParams.versionTag.build).toBe(
        decodedApplyUninstallationParams.versionTag.build,
      );
      expect(applyUninstallationParams.versionTag.release).toBe(
        decodedApplyUninstallationParams.versionTag.release,
      );
      expect(applyUninstallationParams.pluginAddress).toBe(
        decodedApplyUninstallationParams.pluginAddress,
      );
      expect(applyUninstallationParams.pluginRepo).toBe(
        decodedApplyUninstallationParams.pluginRepo,
      );
      for (const index in applyUninstallationParams.permissions) {
        expect(decodedApplyUninstallationParams.permissions[index].condition)
          .toBe(
            AddressZero,
          );
        expect(applyUninstallationParams.permissions[index].operation).toBe(
          decodedApplyUninstallationParams.permissions[index].operation,
        );
        expect(applyUninstallationParams.permissions[index].who).toBe(
          decodedApplyUninstallationParams.permissions[index].who,
        );
        expect(applyUninstallationParams.permissions[index].where).toBe(
          decodedApplyUninstallationParams.permissions[index].where,
        );
        expect(
          applyUninstallationParams.permissions[index].permissionId,
        ).toBe(
          decodedApplyUninstallationParams.permissions[index].permissionId,
        );
      }
    });
    it("Should decode an apply installation action", async () => {
      const networkSpy = jest.spyOn(
        JsonRpcProvider.prototype,
        "network",
        "get",
      );
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
      networkSpy.mockReturnValueOnce({
        name: "goerli",
        chainId: 31337,
      });
      const actions = client.encoding.applyInstallationAction(
        "0x1234567890123456789012345678901234567890",
        applyInstallationParams,
      );
      expect(actions.length).toBe(3);
      const decodedApplyInstallationParams = client.decoding
        .applyInstallationAction(
          actions[1].data,
        );
      expect(applyInstallationParams.versionTag.build).toBe(
        decodedApplyInstallationParams.versionTag.build,
      );
      expect(applyInstallationParams.versionTag.release).toBe(
        decodedApplyInstallationParams.versionTag.release,
      );
      expect(applyInstallationParams.pluginAddress).toBe(
        decodedApplyInstallationParams.pluginAddress,
      );
      expect(applyInstallationParams.pluginRepo).toBe(
        decodedApplyInstallationParams.pluginRepo,
      );
      expect(keccak256(
        defaultAbiCoder.encode(["address[]"], [
          applyInstallationParams.helpers,
        ]),
      )).toBe(
        decodedApplyInstallationParams.helpersHash,
      );
      for (const index in applyInstallationParams.permissions) {
        expect(applyInstallationParams.permissions[index].condition).toBe(
          decodedApplyInstallationParams.permissions[index].condition,
        );
        expect(applyInstallationParams.permissions[index].operation).toBe(
          decodedApplyInstallationParams.permissions[index].operation,
        );
        expect(applyInstallationParams.permissions[index].who).toBe(
          decodedApplyInstallationParams.permissions[index].who,
        );
        expect(applyInstallationParams.permissions[index].where).toBe(
          decodedApplyInstallationParams.permissions[index].where,
        );
        expect(
          applyInstallationParams.permissions[index]
            .permissionId,
        ).toBe(
          decodedApplyInstallationParams.permissions[index]
            .permissionId,
        );
      }
    });
    it("Should decode an initialize from action", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const params: InitializeFromParams = {
        version: [1, 0, 0],
        initData: new Uint8Array([0, 1, 2, 3]),
      };
      const action = await client.encoding.initializeFromAction(
        "0x1234567890123456789012345678901234567890",
        params,
      );
      const decodedParams = client.decoding.initializeFromAction(action.data);
      for (const index in params.version) {
        expect(params.version[index]).toBe(decodedParams.version[index]);
      }
      expect(bytesToHex(params.initData as Uint8Array)).toBe(
        bytesToHex(decodedParams.initData as Uint8Array),
      );
    });
  });
});
