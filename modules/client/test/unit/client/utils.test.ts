import { Context, Permissions } from "@aragon/sdk-client-common";
import { Client, PluginUpdateProposalInValidityCause } from "../../../src";
import {
  ADDRESS_ONE,
  ADDRESS_THREE,
  ADDRESS_TWO,
} from "../../integration/constants";
import {
  validateGrantRootPermissionAction,
  validateGrantUpdatePluginPermissionAction,
  validateRevokeRootPermissionAction,
  validateRevokeUpdatePluginPermissionAction,
} from "../../../src/internal/utils";

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
    
  })
});
