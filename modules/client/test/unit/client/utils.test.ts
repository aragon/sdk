import * as mockedGraphqlRequest from "../../mocks/graphql-request";
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";

import {
  ApplyUpdateParams,
  Context,
  DaoAction,
  MultiTargetPermission,
  PermissionIds,
  Permissions,
  TokenType,
} from "@aragon/sdk-client-common";
import {
  Client,
  DaoUpdateProposalInvalidityCause,
  PluginUpdateProposalInValidityCause,
  ProposalSettingsErrorCause,
} from "../../../src";
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
  startsWithDaoUpdateAction,
  containsPluginUpdateActionBlock,
  containsPluginUpdateActionBlockWithRootPermission,
  validateApplyUpdateFunction,
  validateGrantRootPermissionAction,
  validateGrantUpgradePluginPermissionAction,
  validateRevokeRootPermissionAction,
  validateRevokeUpgradePluginPermissionAction,
  validateUpdateDaoProposalActions,
  validateUpdatePluginProposalActions,
} from "../../../src/internal/utils";
import {
  ProposalActionTypes,
  SubgraphDao,
  SubgraphPluginRepo,
  SubgraphPluginUpdatePreparation,
} from "../../../src/internal/types";
import { SupportedPluginRepo } from "../../../src/internal/constants";

describe("Test client utils", () => {
  const pspAddress = ADDRESS_TWO;
  const context = new Context({ pluginSetupProcessorAddress: pspAddress });
  const client = new Client(context);
  const pluginAddress = ADDRESS_ONE;
  const daoAddress = ADDRESS_THREE;
  const pluginRepo = ADDRESS_FOUR;
  const tokenVotingRepoAddress = ADDRESS_ONE;
  let applyUpdateParams: ApplyUpdateParams;
  let subgraphDao: SubgraphDao;
  let subgraphPluginRepo: SubgraphPluginRepo;
  let subgraphPluginPreparation: SubgraphPluginUpdatePreparation;
  let permission: MultiTargetPermission;
  const mockedClient = mockedGraphqlRequest.getMockedInstance(
    client.graphql.getClient(),
  );
  describe("validateGrantUpgradePluginPermissionAction", () => {
    beforeEach(() => {
      mockedClient.request.mockReset();
      mockedClient.request.mockResolvedValue({
        pluginInstallations: [{
          id: ADDRESS_ONE,
        }],
      });
    });
    it("should return an empty array for a valid action", async () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = await validateGrantUpgradePluginPermissionAction(
        grantAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([]);
    });
    it("should return an error if the action is not a grant action", async () => {
      expect(() =>
        validateGrantUpgradePluginPermissionAction(
          {
            to: daoAddress,
            value: BigInt(0),
            data: new Uint8Array(),
          },
          pspAddress,
          daoAddress,
          client.graphql,
        )
      ).rejects.toThrow();
    });
    it("should return an error value of the action is not 0", async () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      grantAction.value = BigInt(10);
      const result = await validateGrantUpgradePluginPermissionAction(
        grantAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .NON_ZERO_GRANT_UPGRADE_PLUGIN_PERMISSION_CALL_VALUE,
      ]);
    });
    it("should return an error if `to` is not the DAO address", async () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      grantAction.to = ADDRESS_ONE;
      const result = await validateGrantUpgradePluginPermissionAction(
        grantAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_UPGRADE_PLUGIN_PERMISSION_TO_ADDRESS,
      ]);
    });
    it("should return an error if the plugin does not exist", async () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginInstallations: [],
      });
      const result = await validateGrantUpgradePluginPermissionAction(
        grantAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .PLUGIN_NOT_INSTALLED,
      ]);
    });
    it("should return an error if the permission is not granted to the psp", async () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: pluginAddress,
        who: daoAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = await validateGrantUpgradePluginPermissionAction(
        grantAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_UPGRADE_PLUGIN_PERMISSION_WHO_ADDRESS,
      ]);
    });
    it("should return an error if the permission is not correct", async () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.MINT_PERMISSION,
      });
      const result = await validateGrantUpgradePluginPermissionAction(
        grantAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_UPGRADE_PLUGIN_PERMISSION_PERMISSION_NAME,
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_UPGRADE_PLUGIN_PERMISSION_PERMISSION_ID,
      ]);
    });
    it("should return two causes if the permission is not granted to the psp and the plugin does not exist", async () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: pluginAddress,
        who: daoAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginInstallations: [],
      });
      const result = await validateGrantUpgradePluginPermissionAction(
        grantAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .PLUGIN_NOT_INSTALLED,
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_UPGRADE_PLUGIN_PERMISSION_WHO_ADDRESS,
      ]);
    });
  });
  describe("validateRevokeUpgradePluginPermissionAction", () => {
    beforeEach(() => {
      mockedClient.request.mockReset();
      mockedClient.request.mockResolvedValue({
        pluginInstallations: [{
          id: ADDRESS_ONE,
        }],
      });
    });
    it("should return an empty array for a valid action", async () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = await validateRevokeUpgradePluginPermissionAction(
        revokeAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([]);
    });
    it("should return an error if the action is not a revoke action", async () => {
      expect(() =>
        validateRevokeUpgradePluginPermissionAction(
          {
            to: daoAddress,
            value: BigInt(0),
            data: new Uint8Array(),
          },
          pspAddress,
          daoAddress,
          client.graphql,
        )
      ).rejects.toThrow();
    });
    it("should return an error value of the action is not 0", async () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      revokeAction.value = BigInt(10);
      const result = await validateRevokeUpgradePluginPermissionAction(
        revokeAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .NON_ZERO_REVOKE_UPGRADE_PLUGIN_PERMISSION_CALL_VALUE,
      ]);
    });
    it("should return an error if `to` is not the DAO address", async () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      revokeAction.to = ADDRESS_ONE;
      const result = await validateRevokeUpgradePluginPermissionAction(
        revokeAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_UPGRADE_PLUGIN_PERMISSION_TO_ADDRESS,
      ]);
    });
    it("should return an error if the installation does not exist", async () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginInstallations: [],
      });
      const result = await validateRevokeUpgradePluginPermissionAction(
        revokeAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .PLUGIN_NOT_INSTALLED,
      ]);
    });
    it("should return an error if the is not revoked from the psp", async () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: pluginAddress,
        who: daoAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      const result = await validateRevokeUpgradePluginPermissionAction(
        revokeAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_UPGRADE_PLUGIN_PERMISSION_WHO_ADDRESS,
      ]);
    });
    it("should return an error if the permission is not correct", async () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: pluginAddress,
        who: pspAddress,
        permission: Permissions.MINT_PERMISSION,
      });
      const result = await validateRevokeUpgradePluginPermissionAction(
        revokeAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_UPGRADE_PLUGIN_PERMISSION_PERMISSION_NAME,
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_UPGRADE_PLUGIN_PERMISSION_PERMISSION_ID,
      ]);
    });
    it("should return two causes if the permission is not granted to the psp and the plugin installation does not exist", async () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: daoAddress,
        who: daoAddress,
        permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginInstallations: [],
      });
      const result = await validateRevokeUpgradePluginPermissionAction(
        revokeAction,
        pspAddress,
        daoAddress,
        client.graphql,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .PLUGIN_NOT_INSTALLED,
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_UPGRADE_PLUGIN_PERMISSION_WHO_ADDRESS,
      ]);
    });
  });
  describe("validateGrantRootPermissionAction", () => {
    beforeEach(() => {
      mockedClient.request.mockReset();
    });
    it("should return an empty array for a valid action", () => {
      const revokeAction = client.encoding.grantAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.ROOT_PERMISSION,
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
          pspAddress,
          daoAddress,
        )
      ).toThrow();
    });
    it("should return an error value of the action is not 0", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.ROOT_PERMISSION,
      });
      grantAction.value = BigInt(10);
      const result = validateGrantRootPermissionAction(
        grantAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .NON_ZERO_GRANT_ROOT_PERMISSION_CALL_VALUE,
      ]);
    });
    it("should return an error if `to` is not the DAO address", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.ROOT_PERMISSION,
      });
      grantAction.to = ADDRESS_ONE;
      const result = validateGrantRootPermissionAction(
        grantAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_ROOT_PERMISSION_TO_ADDRESS,
      ]);
    });
    it("should return an error if the permission is not granted in the DAO", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.ROOT_PERMISSION,
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
        permission: Permissions.ROOT_PERMISSION,
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
          .INVALID_GRANT_ROOT_PERMISSION_PERMISSION_NAME,
        PluginUpdateProposalInValidityCause
          .INVALID_GRANT_ROOT_PERMISSION_PERMISSION_ID,
      ]);
    });
    it("should return two causes if the permission is not granted to the psp and is not granted in the plugin", () => {
      const grantAction = client.encoding.grantAction(daoAddress, {
        where: pluginAddress,
        who: daoAddress,
        permission: Permissions.ROOT_PERMISSION,
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
    beforeEach(() => {
      mockedClient.request.mockReset();
    });
    it("should return an empty array for a valid action", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.ROOT_PERMISSION,
      });
      const result = validateRevokeRootPermissionAction(
        revokeAction,
        daoAddress,
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
          pspAddress,
          daoAddress,
        )
      ).toThrow();
    });
    it("should return an error value of the action is not 0", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.ROOT_PERMISSION,
      });
      revokeAction.value = BigInt(10);
      const result = validateRevokeRootPermissionAction(
        revokeAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .NON_ZERO_REVOKE_ROOT_PERMISSION_CALL_VALUE,
      ]);
    });
    it("should return an error if `to` is not the DAO address", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.ROOT_PERMISSION,
      });
      revokeAction.to = ADDRESS_ONE;
      const result = validateRevokeRootPermissionAction(
        revokeAction,
        daoAddress,
        pspAddress,
      );
      expect(result).toEqual([
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_ROOT_PERMISSION_TO_ADDRESS,
      ]);
    });
    it("should return an error if the permission is not revoked in the DAO", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: daoAddress,
        who: pspAddress,
        permission: Permissions.ROOT_PERMISSION,
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
        permission: Permissions.ROOT_PERMISSION,
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
          .INVALID_REVOKE_ROOT_PERMISSION_PERMISSION_NAME,
        PluginUpdateProposalInValidityCause
          .INVALID_REVOKE_ROOT_PERMISSION_PERMISSION_ID,
      ]);
    });
    it("should return two causes if the permission is not granted to the psp and is not granted in the plugin", () => {
      const revokeAction = client.encoding.revokeAction(daoAddress, {
        where: pluginAddress,
        who: daoAddress,
        permission: Permissions.ROOT_PERMISSION,
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
    function getApplyUpdateAction(daoAddress: string, applyUpdateParams: ApplyUpdateParams) {
       const applyUpdateActions = client.encoding.applyUpdateAndPermissionsActionBlock(
        daoAddress,
        applyUpdateParams,
      );
      return applyUpdateActions[1];
    }

    beforeEach(() => {
      mockedClient.request.mockReset();
      mockedIPFSClient.cat.mockReset();
    });
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
      const action = getApplyUpdateAction(daoAddress, applyUpdateParams);
      mockedClient.request.mockResolvedValue({
        dao: subgraphDao,
        pluginRepo: subgraphPluginRepo,
        pluginPreparations: [subgraphPluginPreparation],
      });
      mockedIPFSClient.cat.mockResolvedValue(Buffer.from(
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
      const action = getApplyUpdateAction(daoAddress, applyUpdateParams);
      action.value = BigInt(10);
      mockedClient.request.mockResolvedValue({
        dao: subgraphDao,
        pluginPreparations: [subgraphPluginPreparation],
        pluginRepo: subgraphPluginRepo,
      });
      mockedIPFSClient.cat.mockResolvedValue(Buffer.from(
        JSON.stringify(TOKEN_VOTING_BUILD_METADATA),
      ));
      const result = await validateApplyUpdateFunction(
        action,
        daoAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result).toMatchObject([
        PluginUpdateProposalInValidityCause.NON_ZERO_APPLY_UPDATE_CALL_VALUE,
      ]);
    });
    it("should return an `UPDATE_TO_INCOMPATIBLE_RELEASE` when the release is different from the one on subgraph", async () => {
      const updatedApplyUpdateParams = {
        ...applyUpdateParams,
        versionTag: {
          release: 2,
          build: 2,
        },
      };
      const action = getApplyUpdateAction(daoAddress, updatedApplyUpdateParams);
      mockedClient.request.mockResolvedValue({
      pluginRepo: subgraphPluginRepo,
        dao: subgraphDao,
        pluginPreparations: [subgraphPluginPreparation],
      });
      mockedIPFSClient.cat.mockResolvedValue(Buffer.from(
        JSON.stringify(TOKEN_VOTING_BUILD_METADATA),
      ));
      const result = await validateApplyUpdateFunction(
        action,
        daoAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result).toMatchObject([
        PluginUpdateProposalInValidityCause.UPDATE_TO_INCOMPATIBLE_RELEASE,
        PluginUpdateProposalInValidityCause.INVALID_PLUGIN_REPO_METADATA,
      ]);
    });
    it("should return an `UPDATE_TO_OLDER_OR_SAME_BUILD` when the release is different from the one on subgraph", async () => {
      const updatedApplyUpdateParams = {
        ...applyUpdateParams,
        versionTag: {
          release: 1,
          build: 1,
        },
      };
      const action = getApplyUpdateAction(daoAddress, updatedApplyUpdateParams);
      mockedClient.request.mockResolvedValue({
        dao: subgraphDao,
        pluginRepo: subgraphPluginRepo,
        pluginPreparations: [subgraphPluginPreparation],
      });
      mockedIPFSClient.cat.mockResolvedValue(Buffer.from(
        JSON.stringify(TOKEN_VOTING_BUILD_METADATA),
      ));
      const result = await validateApplyUpdateFunction(
        action,
        daoAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result).toMatchObject([
        PluginUpdateProposalInValidityCause.UPDATE_TO_OLDER_OR_SAME_BUILD,
      ]);
    });
    it("should return an `PLUGIN_NOT_INSTALLED` when the plugin is not found on subgraph", async () => {
      const subgraphDaoWithoutPlugin = {
        ...subgraphDao,
        plugins: [],
      };
      const action = getApplyUpdateAction(daoAddress, applyUpdateParams);
      mockedClient.request.mockResolvedValue({
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
      const action = getApplyUpdateAction(daoAddress, applyUpdateParams);
      mockedClient.request.mockResolvedValue({
        dao: subgraphDao,
        pluginRepo: externalPluginRepo,
        pluginPreparations: [subgraphPluginPreparation],
      });
      mockedIPFSClient.cat.mockResolvedValue(Buffer.from(
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
      const action = getApplyUpdateAction(daoAddress, applyUpdateParams);
      mockedClient.request.mockResolvedValue({
        dao: subgraphDao,
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
      const action = getApplyUpdateAction(daoAddress, updatedApplyUpdateParams);
      mockedClient.request.mockResolvedValue({
        dao: subgraphDao,
        pluginPreparations: [subgraphPluginPreparation],
        pluginRepo: subgraphPluginRepo,
      });
      mockedIPFSClient.cat.mockResolvedValue(Buffer.from(
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
      const action = getApplyUpdateAction(daoAddress, applyUpdateParams);
      mockedClient.request.mockResolvedValue({
        dao: subgraphDao,
        pluginRepo: subgraphPluginRepo,
        pluginPreparations: [subgraphPluginPreparation],
      });
      mockedIPFSClient.cat.mockResolvedValue(Buffer.from(
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
      const action = getApplyUpdateAction(daoAddress, applyUpdateParams);
      mockedClient.request.mockResolvedValue({
        dao: subgraphDao,
        pluginPreparations: [],
        pluginRepo: subgraphPluginRepo,
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
  describe("validateUpdatePluginProposalActions", () => {
    beforeEach(() => {
      mockedClient.request.mockReset();
    });
    beforeAll(() => {
      subgraphPluginPreparation = {
        data: "0x",
      };

      applyUpdateParams = {
        versionTag: {
          build: 2,
          release: 1,
        },
        initData: new Uint8Array(),
        pluginRepo: ADDRESS_ONE,
        pluginAddress: ADDRESS_ONE,
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
        id: ADDRESS_ONE,
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
      permission = {
        who: ADDRESS_ONE,
        where: ADDRESS_TWO,
        permissionId: PermissionIds.MINT_PERMISSION_ID,
        operation: 1,
      };
    });
    it("should return an empty array for a valid actions", async () => {
      const actions = client.encoding.applyUpdateAndPermissionsActionBlock(
        daoAddress,
        applyUpdateParams,
      );
      mockedClient.request.mockResolvedValueOnce({
        pluginInstallations: [{
          id: ADDRESS_ONE,
        }],
      });
      mockedClient.request.mockResolvedValueOnce({
        dao: subgraphDao,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginRepo: subgraphPluginRepo,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginPreparations: [subgraphPluginPreparation],
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginInstallations: [{
          id: ADDRESS_ONE,
        }],
      });
      mockedIPFSClient.cat.mockResolvedValueOnce(Buffer.from(
        JSON.stringify(TOKEN_VOTING_BUILD_METADATA),
      ));
      const result = await validateUpdatePluginProposalActions(
        actions,
        daoAddress,
        pspAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result.isValid).toEqual(true);
      expect(result.actionErrorCauses).toMatchObject([[]]);
      expect(result.proposalSettingsErrorCauses).toMatchObject([]);
    });
    it("should return an empty array for a valid actions where root is granted", async () => {
      const actions = client.encoding.applyUpdateAndPermissionsActionBlock(
        daoAddress,
        {
          ...applyUpdateParams,
          permissions: [permission],
        },
      );
      mockedClient.request.mockResolvedValueOnce({
        pluginInstallations: [{
          id: ADDRESS_ONE,
        }],
      });
      mockedClient.request.mockResolvedValueOnce({
        dao: subgraphDao,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginRepo: subgraphPluginRepo,
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginPreparations: [subgraphPluginPreparation],
      });
      mockedClient.request.mockResolvedValueOnce({
        pluginInstallations: [{
          id: ADDRESS_ONE,
        }],
      });
      mockedIPFSClient.cat.mockResolvedValueOnce(Buffer.from(
        JSON.stringify(TOKEN_VOTING_BUILD_METADATA),
      ));
      const result = await validateUpdatePluginProposalActions(
        actions,
        daoAddress,
        pspAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result.isValid).toEqual(true);
      expect(result.actionErrorCauses).toMatchObject([[]]);
      expect(result.proposalSettingsErrorCauses).toMatchObject([]);
    });
    it("should return an empty for two groups of apply update", async () => {
      const actionsGroupOne = client.encoding.applyUpdateAndPermissionsActionBlock(
        daoAddress,
        applyUpdateParams,
      );
      const actionsGroupTwo = client.encoding.applyUpdateAndPermissionsActionBlock(
        daoAddress,
        {
          ...applyUpdateParams,
          permissions: [permission],
        },
      );
      // setup mocks
      for (let i = 0; i < 3; i++) {
        mockedClient.request.mockResolvedValueOnce({
          pluginInstallations: [{
            id: ADDRESS_ONE,
          }],
        });
        mockedClient.request.mockResolvedValueOnce({
          dao: subgraphDao,
        });
        mockedClient.request.mockResolvedValueOnce({
          pluginRepo: subgraphPluginRepo,
        });
        mockedClient.request.mockResolvedValueOnce({
          pluginPreparations: [subgraphPluginPreparation],
        });
        mockedClient.request.mockResolvedValueOnce({
          pluginInstallations: [{
            id: ADDRESS_ONE,
          }],
        });
        mockedIPFSClient.cat.mockResolvedValueOnce(Buffer.from(
          JSON.stringify(TOKEN_VOTING_BUILD_METADATA),
        ));
      }

      const result = await validateUpdatePluginProposalActions(
        [...actionsGroupOne, ...actionsGroupTwo],
        daoAddress,
        pspAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result.isValid).toEqual(true);
      expect(result.actionErrorCauses).toMatchObject([[],[]]);
      expect(result.proposalSettingsErrorCauses).toMatchObject([]);
    });
    it("should return an INVALID_ACTIONS when the actions don't match the expected pattern", async () => {
      const actions = await client.encoding.withdrawAction({
        amount: BigInt(0),
        type: TokenType.NATIVE,
        recipientAddressOrEns: ADDRESS_ONE,
      });

      const result = await validateUpdatePluginProposalActions(
        [actions],
        daoAddress,
        pspAddress,
        client.graphql,
        client.ipfs,
      );
      expect(result.isValid).toEqual(false);
      expect(result.actionErrorCauses).toMatchObject([]);
      expect(result.proposalSettingsErrorCauses).toMatchObject([ProposalSettingsErrorCause.INVALID_ACTIONS]);
    });
  });
  describe("validateUpdateDaoProposalActions", () => {
    let currentDaoVersion: [number, number, number];
    let upgradeToAndCallAction: DaoAction;
    let upgradeToAction: DaoAction;
    let initializeFromAction: DaoAction;
    const implementationAddress = ADDRESS_TWO;
    beforeEach(() => {
      mockedClient.request.mockReset();
      currentDaoVersion = [1, 0, 0];
      initializeFromAction = client.encoding.initializeFromAction(daoAddress, {
        previousVersion: currentDaoVersion,
        initData: new Uint8Array(),
      });
      upgradeToAndCallAction = client.encoding.upgradeToAndCallAction(
        daoAddress,
        {
          implementationAddress,
          data: initializeFromAction.data,
        },
      );
      upgradeToAction = client.encoding.upgradeToAction(
        daoAddress,
        implementationAddress,
      );
    });
    it("should return an empty array for a valid upgradeToAndCall action", () => {
      const result = validateUpdateDaoProposalActions(
        [upgradeToAndCallAction],
        daoAddress,
        pspAddress,
        currentDaoVersion,
      );
      expect(result.isValid).toEqual(true);
      expect(result.actionErrorCauses).toMatchObject([]);
      expect(result.proposalSettingsErrorCauses).toMatchObject([]);
    });
    it("should return an empty array for a valid upgradeTo action", () => {
      const result = validateUpdateDaoProposalActions(
        [upgradeToAction],
        daoAddress,
        pspAddress,
        currentDaoVersion,
      );
      expect(result.isValid).toEqual(true);
      expect(result.actionErrorCauses).toMatchObject([]);
      expect(result.proposalSettingsErrorCauses).toMatchObject([]);
    });
    it("should return INVALID_ACTIONS when the actions are not valid for updating a dao", async () => {
      const withdrawAction = await client.encoding.withdrawAction({
        amount: BigInt(10),
        type: TokenType.NATIVE,
        recipientAddressOrEns: ADDRESS_ONE,
      });
      const result = validateUpdateDaoProposalActions(
        [withdrawAction],
        daoAddress,
        pspAddress,
        currentDaoVersion,
      );
      expect(result.isValid).toEqual(false);
      expect(result.proposalSettingsErrorCauses).toMatchObject([
        ProposalSettingsErrorCause.INVALID_ACTIONS,
      ]);
      expect(result.actionErrorCauses).toMatchObject([]);
    });
    it("should return INVALID_TO_ADDRESS when the to address is not the dao address", () => {
      upgradeToAndCallAction.to = ADDRESS_FOUR;
      const result = validateUpdateDaoProposalActions(
        [upgradeToAndCallAction],
        daoAddress,
        pspAddress,
        currentDaoVersion,
      );
      expect(result.isValid).toEqual(false);
      expect(result.actionErrorCauses).toMatchObject([
        DaoUpdateProposalInvalidityCause.INVALID_TO_ADDRESS,
      ]);
      expect(result.proposalSettingsErrorCauses).toMatchObject([]);
    });
    it("should return NON_ZERO_CALL_VALUE when the the value of the action is not 0", () => {
      upgradeToAndCallAction.value = BigInt(10);
      const result = validateUpdateDaoProposalActions(
        [upgradeToAndCallAction],
        daoAddress,
        pspAddress,
        currentDaoVersion,
      );
      expect(result.isValid).toEqual(false);
      expect(result.actionErrorCauses).toMatchObject([
        DaoUpdateProposalInvalidityCause.NON_ZERO_CALL_VALUE,
      ]);
      expect(result.proposalSettingsErrorCauses).toMatchObject([]);
      
    });
    it("should return INVALID_UPGRADE_TO_IMPLEMENTATION_ADDRESS when the implementation address is not the correct one", () => {
      upgradeToAction = client.encoding.upgradeToAction(
        daoAddress,
        daoAddress,
      );
      const result = validateUpdateDaoProposalActions(
        [upgradeToAction],
        daoAddress,
        pspAddress,
        currentDaoVersion,
      );
      expect(result.isValid).toEqual(false);
      expect(result.actionErrorCauses).toMatchObject([
        DaoUpdateProposalInvalidityCause
          .INVALID_UPGRADE_TO_IMPLEMENTATION_ADDRESS,
      ]);
      expect(result.proposalSettingsErrorCauses).toMatchObject([]);
    });
    it("should return INVALID_UPGRADE_TO_AND_CALL_IMPLEMENTATION_ADDRESS when the implementation address is not the correct one", () => {
      upgradeToAndCallAction = client.encoding.upgradeToAndCallAction(
        daoAddress,
        {
          implementationAddress: daoAddress,
          data: initializeFromAction.data,
        },
      );
      const result = validateUpdateDaoProposalActions(
        [upgradeToAndCallAction],
        daoAddress,
        pspAddress,
        currentDaoVersion,
      );
      expect(result.isValid).toEqual(false);
      expect(result.actionErrorCauses).toMatchObject([
        DaoUpdateProposalInvalidityCause
          .INVALID_UPGRADE_TO_AND_CALL_IMPLEMENTATION_ADDRESS,
      ]);
      expect(result.proposalSettingsErrorCauses).toMatchObject([]);
    });
    it("should return INVALID_UPGRADE_TO_AND_CALL_VERSION when the version in the encoded initializeFrom action is not the correct one", () => {
      initializeFromAction = client.encoding.initializeFromAction(
        daoAddress,
        {
          previousVersion: [1, 3, 0],
          initData: new Uint8Array(),
        },
      );
      upgradeToAndCallAction = client.encoding.upgradeToAndCallAction(
        daoAddress,
        {
          implementationAddress,
          data: initializeFromAction.data,
        },
      );
      const result = validateUpdateDaoProposalActions(
        [upgradeToAndCallAction],
        daoAddress,
        pspAddress,
        currentDaoVersion,
      );
      expect(result.isValid).toEqual(false);
      expect(result.actionErrorCauses).toMatchObject([
        DaoUpdateProposalInvalidityCause
          .INVALID_UPGRADE_TO_AND_CALL_VERSION,
      ]);
      expect(result.proposalSettingsErrorCauses).toMatchObject([]);
    });
    it("should return INVALID_UPGRADE_TO_AND_CALL_DATA when the data in the encoded initializeFrom action is not empty", () => {
      initializeFromAction = client.encoding.initializeFromAction(
        daoAddress,
        {
          previousVersion: currentDaoVersion,
          initData: new Uint8Array([0, 10, 20, 30]),
        },
      );
      upgradeToAndCallAction = client.encoding.upgradeToAndCallAction(
        daoAddress,
        {
          implementationAddress,
          data: initializeFromAction.data,
        },
      );
      const result = validateUpdateDaoProposalActions(
        [upgradeToAndCallAction],
        daoAddress,
        pspAddress,
        currentDaoVersion,
      );
      expect(result.isValid).toEqual(false);
      expect(result.actionErrorCauses).toMatchObject([
        DaoUpdateProposalInvalidityCause
          .INVALID_UPGRADE_TO_AND_CALL_DATA,
      ]);
      expect(result.proposalSettingsErrorCauses).toMatchObject([]);
    });
  });
  describe("startsWithDaoUpdateAction", () => {
    it("should return the expected output given a specific input", () => {
      const cases = [
        { input: [ProposalActionTypes.UPGRADE_TO], expected: true },
        { input: [ProposalActionTypes.UPGRADE_TO_AND_CALL], expected: true },
        {
          input: [
            ProposalActionTypes.UPGRADE_TO,
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
          ],
          expected: true,
        },
        {
          input: [
            ProposalActionTypes.UPGRADE_TO_AND_CALL,
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
          ],
          expected: true,
        },
        {
          input: [
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
          ],
          expected: false,
        },
        {
          input: [
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.UPGRADE_TO,
          ],
          expected: false,
        },
        {
          input: [
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.UPGRADE_TO_AND_CALL,
          ],
          expected: false,
        },
        {
          input: [
            ProposalActionTypes.UPGRADE_TO,
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
            //
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.GRANT_ROOT_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_ROOT_PERMISSION,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
          ],
          expected: true,
        },
      ];
      for (const { input, expected } of cases) {
        const result = startsWithDaoUpdateAction(input);
        expect(result).toEqual(expected);
      }
    });
  });
  describe("containsPluginUpdateActionBlock", () => {
    it("should return the expected output given a specific input", () => {
      const cases = [
        { input: [ProposalActionTypes.UPGRADE_TO], expected: false },
        { input: [ProposalActionTypes.UPGRADE_TO_AND_CALL], expected: false },
        {
          input: [
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
          ],
          expected: true,
        },
        {
          input: [
            ProposalActionTypes.GRANT_ROOT_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_ROOT_PERMISSION,
          ],
          expected: false,
        },
        {
          input: [
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
          ],
          expected: false,
        },
        {
          input: [
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
          ],
          expected: true,
        },
      ];
      for (const { input, expected } of cases) {
        const result = containsPluginUpdateActionBlock(input);
        expect(result).toEqual(expected);
      }
    });
  });
  describe("isPluginUpdateWithRootAction", () => {
    it("should return the expected output given a specific input", () => {
      const cases = [
        { input: [ProposalActionTypes.UPGRADE_TO], expected: false },
        { input: [ProposalActionTypes.UPGRADE_TO_AND_CALL], expected: false },
        {
          input: [
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.GRANT_ROOT_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_ROOT_PERMISSION,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
          ],
          expected: true,
        },
        {
          input: [
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.GRANT_ROOT_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
          ],
          expected: false,
        },
        {
          input: [
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.GRANT_ROOT_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_ROOT_PERMISSION,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.GRANT_PLUGIN_UPGRADE_PERMISSION,
            ProposalActionTypes.GRANT_ROOT_PERMISSION,
            ProposalActionTypes.APPLY_UPDATE,
            ProposalActionTypes.REVOKE_ROOT_PERMISSION,
            ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
          ],
          expected: true,
        },
      ];
      for (const { input, expected } of cases) {
        const result = containsPluginUpdateActionBlockWithRootPermission(input);
        expect(result).toEqual(expected);
      }
    });
  });
});
