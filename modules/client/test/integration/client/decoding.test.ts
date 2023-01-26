// @ts-ignore
declare const describe, it, expect;

// mocks need to be at the top of the imports
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";

import {
  Client,
  Context,
  IFreezePermissionDecodedParams,
  IFreezePermissionParams,
  IGrantPermissionDecodedParams,
  IGrantPermissionParams,
  DaoMetadata,
  IRevokePermissionDecodedParams,
  IRevokePermissionParams,
  WithdrawParams,
  Permissions,
} from "../../../src";
import { contextParamsLocalChain } from "../constants";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { AddressZero } from "@ethersproject/constants";
import { TransferTokenType, WithdrawType } from "../../../src/interfaces";
describe("Client", () => {
  describe("Action decoders", () => {
    it("Should decode an encoded grant action", () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const daoAddresses = [
        "0x2468013579246801357924680135792468013579",
        "0x1357924680135792468013579246801357924680",
      ];
      const paramsArray: IGrantPermissionParams[] = [
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
        const decodedParams: IGrantPermissionDecodedParams = client.decoding
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
      const paramsArray: IRevokePermissionParams[] = [
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
        const decodedParams: IRevokePermissionDecodedParams = client.decoding
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
    it("Should decode an encoded freeze action", () => {
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
      for (let i = 0; i < paramsArray.length; i++) {
        const params = paramsArray[i];
        const action = client.encoding.freezeAction(daoAddresses[i], params);
        const decodedParams: IFreezePermissionDecodedParams = client.decoding
          .freezeAction(
            action.data,
          );

        expect(decodedParams.permission).toBe(params.permission);
        expect(decodedParams.permissionId).toBe(
          keccak256(toUtf8Bytes(params.permission)),
        );
        expect(decodedParams.where).toBe(params.where);
      }
    });
    it("Should decode an encoded raw withdraw action of an erc20 token", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const withdrawParams: WithdrawParams = {
        type: TransferTokenType.ERC20,
        recipientAddress: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
        reference: "test",
        tokenAddress: "0x1234567890098765432112345678900987654321",
      };

      const withdrawAction = await client.encoding.withdrawAction(
        "0x1234567890123456789012345678901234567890",
        withdrawParams,
      );
      const decodedWithdrawParams: WithdrawParams = client.decoding
        .withdrawAction(
          withdrawAction.data,
        );

      expect(decodedWithdrawParams.amount).toBe(withdrawParams.amount);
      expect(decodedWithdrawParams.recipientAddress).toBe(
        withdrawParams.recipientAddress,
      );
      expect(decodedWithdrawParams.reference).toBe(withdrawParams.reference);
      expect(decodedWithdrawParams.tokenAddress).toBe(
        withdrawParams.tokenAddress,
      );
    });

    it("Should decode an encoded raw withdraw action of a native token", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const withdrawParams: WithdrawParams = {
        type: WithdrawType.ERC20,
        recipientAddress: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
        reference: "test",
      };

      const withdrawAction = await client.encoding.withdrawAction(
        "0x1234567890123456789012345678901234567890",
        withdrawParams,
      );
      const decodedWithdrawParams: WithdrawParams = client.decoding
        .withdrawAction(
          withdrawAction.data,
        );

      expect(decodedWithdrawParams.amount).toBe(withdrawParams.amount);
      expect(decodedWithdrawParams.recipientAddress).toBe(
        withdrawParams.recipientAddress,
      );
      expect(decodedWithdrawParams.reference).toBe(withdrawParams.reference);
      expect(decodedWithdrawParams.tokenAddress).toBe(AddressZero);
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

      const updateDaoMetadataAction = await client.encoding.updateDaoMetadataAction(
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
      const updateDaoMetadataAction = await client.encoding.updateDaoMetadataAction(
        "0x1234567890123456789012345678901234567890",
        ipfsUri,
      );

      expect(() => client.decoding.withdrawAction(updateDaoMetadataAction.data))
        .toThrow("The received action is different from the expected one");
    });

    it("Should try to decode a invalid action and return an error", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);

      expect(() => client.decoding.withdrawAction(data)).toThrow(
        `no matching function (argument="sighash", value="0x0b161621", code=INVALID_ARGUMENT, version=abi/5.7.0)`,
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
      const updateDaoMetadataAction = await client.encoding.updateDaoMetadataAction(
        "0x1234567890123456789012345678901234567890",
        ipfsUri,
      );
      const iface = client.decoding.findInterface(updateDaoMetadataAction.data);
      expect(iface?.id).toBe("function setMetadata(bytes)");
      expect(iface?.functionName).toBe("setMetadata");
      expect(iface?.hash).toBe("0xee57e36f");
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
      const updateDaoMetadataAction = await client.encoding.updateDaoMetadataAction(
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
  });
});
