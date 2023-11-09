import * as mockedGraphqlRequest from "../../mocks/graphql-request";
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";

import {
  ApplyUpdateParams,
  Context,
  Permissions,
} from "@aragon/sdk-client-common";
import { Client, PluginUpdateProposalInValidityCause } from "../../../src";
// import * as deployV1Contracts from "../../helpers/deploy-v1-contracts";

import {
  ADDRESS_FOUR,
  ADDRESS_ONE,
  ADDRESS_THREE,
  ADDRESS_TWO,
  IPFS_CID,
  TOKEN_VOTING_BUILD_METADATA,
} from "../../integration/constants";
import {
  validateApplyUpdateFunction,
  validateGrantRootPermissionAction,
  validateGrantUpdatePluginPermissionAction,
  validateRevokeRootPermissionAction,
  validateRevokeUpdatePluginPermissionAction,
} from "../../../src/internal/utils";
import {
  SubgraphDao,
  SubgraphPluginRepo,
  SubgraphPluginUpdatePreparation,
} from "../../../src/internal/types";
import { SupportedPluginRepo } from "../../../src/internal/constants";

describe("Test client utils", () => {
  describe("validateGrantUpdatePluginPermissionAction", () => {
    const context = new Context();
    const client = new Client(context);
    const pluginAddress = ADDRESS_ONE;
    const pspAddress = ADDRESS_TWO;
    const daoAddress = ADDRESS_THREE;
    it("should return an empty array for a valid action", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateGrantUpdatePluginPermissionAction(
        grantAction,
        pluginAddress,
        pspAddress,
      );
      expect(result).toEqual([]);
    });
    it("should return an error if the action is not a grant action", () => {
      expect(() =>
        validateGrantUpdatePluginPermissionAction(
          {
            to: daoAddress,
            value: BigInt(0),
            data: new Uint8Array(),
          },
          pluginAddress,
          pspAddress,
        )
      ).toThrow();
    });
    it("should return an error value of the action is not 0", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      grantAction.value = BigInt(10);
      const result = validateGrantUpdatePluginPermissionAction(
        grantAction,
        pluginAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_UPDATE_PERMISSION_VALUE,
      ]);
    });
    it("should return an error if the action permission is note granted in the plugin", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateGrantUpdatePluginPermissionAction(
        grantAction,
        pluginAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_UPDATE_PERMISSION_WHERE_ADDRESS,
      ]);
    });
    it("should return an error if the permission is not granted to the psp", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: pluginAddress,
        who: daoAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateGrantUpdatePluginPermissionAction(
        grantAction,
        pluginAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_UPDATE_PERMISSION_WHO_ADDRESS,
      ]);
    });
    it("should return an error if the permission is not correct", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.MINT_PERMISSION,
      });
      const result = validateGrantUpdatePluginPermissionAction(
        grantAction,
        pluginAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_UPDATE_PERMISSION_PERMISSION,
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_UPDATE_PERMISSION_PERMISSION_ID,
      ]);
    });
    it("should return two causes if the permission is not granted to the psp and is not granted in the plugin", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: daoAddress,
        who: daoAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateGrantUpdatePluginPermissionAction(
        grantAction,
        pluginAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_UPDATE_PERMISSION_WHERE_ADDRESS,
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_UPDATE_PERMISSION_WHO_ADDRESS,
      ]);
    });
  });
  describe("validateRevokeUpdatePluginPermissionAction", () => {
    const context = new Context();
    const client = new Client(context);
    const pluginAddress = ADDRESS_ONE;
    const pspAddress = ADDRESS_TWO;
    const daoAddress = ADDRESS_THREE;
    it("should return an empty array for a valid action", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateRevokeUpdatePluginPermissionAction(
        revokeAction,
        pluginAddress,
        pspAddress,
      );
      expect(result).toEqual([]);
    });
    it("should return an error if the action is not a revoke action", () => {
      expect(() =>
        validateRevokeUpdatePluginPermissionAction(
          {
            to: daoAddress,
            value: BigInt(0),
            data: new Uint8Array(),
          },
          pluginAddress,
          pspAddress,
        )
      ).toThrow();
    });
    it("should return an error value of the action is not 0", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      revokeAction.value = BigInt(10);
      const result = validateRevokeUpdatePluginPermissionAction(
        revokeAction,
        pluginAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_UPDATE_PERMISSION_VALUE,
      ]);
    });
    it("should return an error if the permission is not revoked in the plugin", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateRevokeUpdatePluginPermissionAction(
        revokeAction,
        pluginAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_UPDATE_PERMISSION_WHERE_ADDRESS,
      ]);
    });
    it("should return an error if the is not revoked from the psp", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: pluginAddress,
        who: daoAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateRevokeUpdatePluginPermissionAction(
        revokeAction,
        pluginAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_UPDATE_PERMISSION_WHO_ADDRESS,
      ]);
    });
    it("should return an error if the permission is not correct", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.MINT_PERMISSION,
      });
      const result = validateRevokeUpdatePluginPermissionAction(
        revokeAction,
        pluginAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_UPDATE_PERMISSION_PERMISSION,
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_UPDATE_PERMISSION_PERMISSION_ID,
      ]);
    });
    it("should return two causes if the permission is not granted to the psp and is not granted in the plugin", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: daoAddress,
        who: daoAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateRevokeUpdatePluginPermissionAction(
        revokeAction,
        pluginAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_UPDATE_PERMISSION_WHERE_ADDRESS,
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_UPDATE_PERMISSION_WHO_ADDRESS,
      ]);
    });
  });
  describe("validateGrantRootPermissionAction", () => {
    const context = new Context();
    const client = new Client(context);
    const pluginAddress = ADDRESS_ONE;
    const pspAddress = ADDRESS_TWO;
    const daoAddress = ADDRESS_THREE;
    it("should return an empty array for a valid action", () => {
      const revokeAction = client.encoding.grantAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateGrantRootPermissionAction(
        revokeAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([]);
    });
    it("should return an error if the action is not a revoke action", () => {
      expect(() =>
        validateGrantRootPermissionAction(
          {
            to: daoAddress,
            value: BigInt(0),
            data: new Uint8Array(),
          },
          daoAddress,
          pspAddress,
        )
      ).toThrow();
    });
    it("should return an error value of the action is not 0", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      grantAction.value = BigInt(10);
      const result = validateGrantRootPermissionAction(
        grantAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_ROOT_PERMISSION_VALUE,
      ]);
    });
    it("should return an error if the permission is not granted in the DAO", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateGrantRootPermissionAction(
        grantAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_ROOT_PERMISSION_WHERE_ADDRESS,
      ]);
    });
    it("should return an error if the permission is not granted to the psp", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: daoAddress,
        who: daoAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateGrantRootPermissionAction(
        grantAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_ROOT_PERMISSION_WHO_ADDRESS,
      ]);
    });
    it("should return an error if the permission is not correct", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.MINT_PERMISSION,
      });
      const result = validateGrantRootPermissionAction(
        grantAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_ROOT_PERMISSION_PERMISSION,
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_ROOT_PERMISSION_PERMISSION_ID,
      ]);
    });
    it("should return two causes if the permission is not granted to the psp and is not granted in the plugin", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: pluginAddress,
        who: daoAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateGrantRootPermissionAction(
        grantAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_ROOT_PERMISSION_WHERE_ADDRESS,
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_ROOT_PERMISSION_WHO_ADDRESS,
      ]);
    });
  });
  describe("validateRevokeRootPermissionAction", () => {
    const context = new Context();
    const client = new Client(context);
    const pluginAddress = ADDRESS_ONE;
    const pspAddress = ADDRESS_TWO;
    const daoAddress = ADDRESS_THREE;
    it("should return an empty array for a valid action", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateRevokeRootPermissionAction(
        revokeAction,
        pluginAddress,
        pspAddress,
      );
      expect(result).toEqual([]);
    });
    it("should return an error if the action is not a revoke action", () => {
      expect(() =>
        validateRevokeRootPermissionAction(
          {
            to: daoAddress,
            value: BigInt(0),
            data: new Uint8Array(),
          },
          pluginAddress,
          pspAddress,
        )
      ).toThrow();
    });
    it("should return an error value of the action is not 0", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      revokeAction.value = BigInt(10);
      const result = validateRevokeRootPermissionAction(
        revokeAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_ROOT_PERMISSION_VALUE,
      ]);
    });
    it("should return an error if the permission is not revoked in the DAO", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateRevokeRootPermissionAction(
        revokeAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_ROOT_PERMISSION_WHERE_ADDRESS,
      ]);
    });
    it("should return an error if the is not revoked from the psp", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: daoAddress,
        who: daoAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateRevokeRootPermissionAction(
        revokeAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_ROOT_PERMISSION_WHO_ADDRESS,
      ]);
    });
    it("should return an error if the permission is not correct", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.MINT_PERMISSION,
      });
      const result = validateRevokeRootPermissionAction(
        revokeAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_ROOT_PERMISSION_PERMISSION,
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_ROOT_PERMISSION_PERMISSION_ID,
      ]);
    });
    it("should return two causes if the permission is not granted to the psp and is not granted in the plugin", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: pluginAddress,
        who: daoAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = validateRevokeRootPermissionAction(
        revokeAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_ROOT_PERMISSION_WHERE_ADDRESS,
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_ROOT_PERMISSION_WHO_ADDRESS,
      ]);
    });
  });
  describe("validateApplyUpdateFunction", () => {
    const context = new Context();
    const client = new Client(context);
    const mockedClient = mockedGraphqlRequest.getMockedInstance(
      client.graphql.getClient(),
    );
    const pluginAddress = ADDRESS_ONE;
    // const pspAddress = ADDRESS_TWO;
    const daoAddress = ADDRESS_THREE;
    const pluginRepo = ADDRESS_FOUR;
    const tokenVotingRepoAddress = ADDRESS_ONE;
    let applyUpdateParams: ApplyUpdateParams;
    let subgraphDao: SubgraphDao;
    let subgraphPluginRepo: SubgraphPluginRepo;
    let subgraphPluginPreparation: SubgraphPluginUpdatePreparation;
    beforeAll(() => {
      applyUpdateParams = {
        versionTag: {
          build: 2,
          release: 1,
        },
        initData: new Uint8Array(),
        pluginRepo,
        pluginAddress,
        permissions: [],
        helpers: [],
      };
      subgraphDao = {
        id: daoAddress,
        subdomain: "test-tokenvoting-dao",
        metadata: `ipfs://${IPFS_CID}`,
        createdAt: "1234567890",
        plugins: [{
          appliedPreparation: {
            pluginAddress: pluginAddress,
          },
          appliedPluginRepo: {
            subdomain: SupportedPluginRepo.TOKEN_VOTING,
          },
          appliedVersion: {
            build: 1,
            release: {
              release: 1,
            },
          },
        }],
      };
      subgraphPluginRepo = {
        id: tokenVotingRepoAddress,
        subdomain: SupportedPluginRepo.TOKEN_VOTING,
        releases: [
          {
            release: 1,
            metadata: `ipfs://${IPFS_CID}`,
            builds: [
              {
                build: 1,
                metadata: `ipfs://${IPFS_CID}`,
              },
              {
                build: 2,
                metadata: `ipfs://${IPFS_CID}`,
              },
            ],
          },
        ],
      };
      subgraphPluginPreparation = {
        data: "0x",
      };
    });
    it("should return an empty array for a valid action", async () => {
      const applyUpdateActions = client.encoding.applyUpdateAction(
        daoAddress,
        applyUpdateParams,
      );
      const action = applyUpdateActions[1];
      mockedClient.request.mockResolvedValueOnce({
        dao: subgraphDao,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginRepo: subgraphPluginRepo,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginPreparation: subgraphPluginPreparation,
      });
      mockedIPFSClient.cat.mockResolvedValueOnce(Buffer.from(
        JSON.stringify(TOKEN_VOTING_BUILD_METADATA),
      ));
      const result = await validateApplyUpdateFunction(
        action,
        daoAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result).toEqual([]);
    });
    it("should return an `INVALID_APPLY_UPDATE_ACTION_VALUE` when the value in the action is not 0", async () => {
      const applyUpdateActions = client.encoding.applyUpdateAction(
        daoAddress,
        applyUpdateParams,
      );
      const action = applyUpdateActions[1];
      action.value = BigInt(10);
      mockedClient.request.mockResolvedValueOnce({
        dao: subgraphDao,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginRepo: subgraphPluginRepo,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginPreparation: subgraphPluginPreparation,
      });
      mockedIPFSClient.cat.mockResolvedValueOnce(Buffer.from(
        JSON.stringify(TOKEN_VOTING_BUILD_METADATA),
      ));
      const result = await validateApplyUpdateFunction(
        action,
        daoAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result).toMatchObject([
        PluginUpdateProposalInValidityCause.INVALID_APPLY_UPDATE_ACTION_VALUE,
      ]);
    });
    it("should return an `INVALID_PLUGIN_RELEASE` when the release is different from the one on subgraph", async () => {
      const updatedApplyUpdateParams = {
        ...applyUpdateParams,
        versionTag: {
          release: 2,
          build: 2,
        },
      };
      const applyUpdateActions = client.encoding.applyUpdateAction(
        daoAddress,
        updatedApplyUpdateParams,
      );
      const action = applyUpdateActions[1];
      mockedClient.request.mockResolvedValueOnce({
        dao: subgraphDao,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginRepo: subgraphPluginRepo,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginPreparation: subgraphPluginPreparation,
      });
      mockedIPFSClient.cat.mockResolvedValueOnce(Buffer.from(
        JSON.stringify(TOKEN_VOTING_BUILD_METADATA),
      ));
      const result = await validateApplyUpdateFunction(
        action,
        daoAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result).toMatchObject([
        PluginUpdateProposalInValidityCause.INVALID_PLUGIN_RELEASE,
      ]);
    });
    it("should return an `INVALID_PLUGIN_BUILD` when the release is different from the one on subgraph", async () => {
      const updatedApplyUpdateParams = {
        ...applyUpdateParams,
        versionTag: {
          release: 1,
          build: 1,
        },
      };
      const applyUpdateActions = client.encoding.applyUpdateAction(
        daoAddress,
        updatedApplyUpdateParams,
      );
      const action = applyUpdateActions[1];
      mockedClient.request.mockResolvedValueOnce({
        dao: subgraphDao,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginRepo: subgraphPluginRepo,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginPreparation: subgraphPluginPreparation,
      });
      mockedIPFSClient.cat.mockResolvedValueOnce(Buffer.from(
        JSON.stringify(TOKEN_VOTING_BUILD_METADATA),
      ));
      const result = await validateApplyUpdateFunction(
        action,
        daoAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result).toMatchObject([
        PluginUpdateProposalInValidityCause.INVALID_PLUGIN_BUILD,
      ]);
    });
    it("should return an `PLUGIN_NOT_INSTALLED` when the plugin is not found on subgraph", async () => {
      const subgraphDaoWithoutPlugin = {
        ...subgraphDao,
        plugins: [],
      };
      const applyUpdateActions = client.encoding.applyUpdateAction(
        daoAddress,
        applyUpdateParams,
      );
      const action = applyUpdateActions[1];
      mockedClient.request.mockResolvedValueOnce({
        dao: subgraphDaoWithoutPlugin,
      });
      const result = await validateApplyUpdateFunction(
        action,
        daoAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result).toMatchObject([
        PluginUpdateProposalInValidityCause.PLUGIN_NOT_INSTALLED,
      ]);
    });
    it("should return an `NOT_ARAGON_PLUGIN_REPO` when the plugin is not an aragon plugin", async () => {
      const externalPluginRepo = {
        ...subgraphPluginRepo,
        subdomain: "external-plugin-repo",
      };
      const applyUpdateActions = client.encoding.applyUpdateAction(
        daoAddress,
        applyUpdateParams,
      );
      const action = applyUpdateActions[1];
      mockedClient.request.mockResolvedValueOnce({
        dao: subgraphDao,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginRepo: externalPluginRepo,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginPreparation: subgraphPluginPreparation,
      });
      mockedIPFSClient.cat.mockResolvedValueOnce(Buffer.from(
        JSON.stringify(TOKEN_VOTING_BUILD_METADATA),
      ));
      const result = await validateApplyUpdateFunction(
        action,
        daoAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result).toMatchObject([
        PluginUpdateProposalInValidityCause.NOT_ARAGON_PLUGIN_REPO,
      ]);
    });
    it("should return an `MISSING_PLUGIN_REPO` when the plugin repo is not on subgraph", async () => {
      const applyUpdateActions = client.encoding.applyUpdateAction(
        daoAddress,
        applyUpdateParams,
      );
      const action = applyUpdateActions[1];
      mockedClient.request.mockResolvedValueOnce({
        dao: subgraphDao,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginRepo: null,
      });
      const result = await validateApplyUpdateFunction(
        action,
        daoAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result).toMatchObject([
        PluginUpdateProposalInValidityCause.MISSING_PLUGIN_REPO,
      ]);
    });
    it("should return an `INVALID_DATA` when the provided init data does not match the abi in the metadata", async () => {
      const updatedApplyUpdateParams = {
        ...applyUpdateParams,
        initData: new Uint8Array([1, 2, 3]),
      };
      const applyUpdateActions = client.encoding.applyUpdateAction(
        daoAddress,
        updatedApplyUpdateParams,
      );
      const action = applyUpdateActions[1];
      mockedClient.request.mockResolvedValueOnce({
        dao: subgraphDao,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginRepo: subgraphPluginRepo,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginPreparation: subgraphPluginPreparation,
      });
      mockedIPFSClient.cat.mockResolvedValueOnce(Buffer.from(
        JSON.stringify(TOKEN_VOTING_BUILD_METADATA),
      ));
      const result = await validateApplyUpdateFunction(
        action,
        daoAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result).toMatchObject([
        PluginUpdateProposalInValidityCause.INVALID_DATA,
      ]);
    });
    it("should return an `INVALID_PLUGIN_REPO_METADATA` when the provided metadata does not exist or is not correct", async () => {
      const applyUpdateActions = client.encoding.applyUpdateAction(
        daoAddress,
        applyUpdateParams,
      );
      const action = applyUpdateActions[1];
      mockedClient.request.mockResolvedValueOnce({
        dao: subgraphDao,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginRepo: subgraphPluginRepo,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginPreparation: subgraphPluginPreparation,
      });
      mockedIPFSClient.cat.mockResolvedValueOnce(Buffer.from(
        JSON.stringify({}),
      ));
      const result = await validateApplyUpdateFunction(
        action,
        daoAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result).toMatchObject([
        PluginUpdateProposalInValidityCause.INVALID_PLUGIN_REPO_METADATA,
      ]);
    });
    it("should return an `MISSING_PLUGIN_PREPARATION` when the pluginPreparation is null", async () => {
      const applyUpdateActions = client.encoding.applyUpdateAction(
        daoAddress,
        applyUpdateParams,
      );
      const action = applyUpdateActions[1];
      mockedClient.request.mockResolvedValueOnce({
        dao: subgraphDao,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginRepo: subgraphPluginRepo,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginPreparation: null,
      });
      const result = await validateApplyUpdateFunction(
        action,
        daoAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result).toMatchObject([
        PluginUpdateProposalInValidityCause.MISSING_PLUGIN_PREPARATION,
      ]);
    });
  });
});
