---
title: Update Security Check
---

## General Update Proposal Checks

The security check is composed of two functions: `isDaoUpdateProposalValid` and `isPluginUpdateProposalValid` that both receive a proposal ID as an input.
If the proposal cannot be found via the ID or the subgraph is down, we return `"proposalNotFound"` in both cases.

A proposal contains an `Action[]` array (see [our docs](https://devs.aragon.org/docs/osx/how-it-works/core/dao/actions#actions)).

The update proposal MUST only contain actions related to the update and no other actions.
If an unexpected action is present, we return `"invalidActions"`.

DAO proposals contain an `_allowFailureMap` value indicating actions in the action array that are allowed to fail (see [our docs](https://devs.aragon.org/docs/osx/how-it-works/core/dao/actions#the-allowfailuremap-input-argument)).
For updates, `_allowFailureMap` MUST be zero (no failure is allowed).
If it is non-zero, we return `"nonZeroAllowFailureMapValue"`.

## Specific Action Checks

Every `Action` in the actions array has three parameters:

```solidity title="@aragon/osx/core/dao/IDAO.sol"
/// @notice The action struct to be consumed by the DAO's `execute` function resulting in an external call.
/// @param to The address to call.
/// @param value The native token value to be sent with the call.
/// @param data The bytes-encoded function selector and calldata for the call.
struct Action {
  address to;
  uint256 value;
  bytes data;
}
```

In the following, we distinguish between actions related to the DAO.

### DAO Update

For DAO updates, we expect single action at position 0 of the action array being characterized as follows:

- `to` MUST be the DAO address. If not, we return `"invalidToAddress"`.

- `value` MUST be zero. If not, we return `"nonZeroCallValue"`.

- `data` MUST contain the `upgradeTo(address newImplementation)` OR `upgradeToAndCall(address newImplementation, bytes memory data)` function selector depending on the nature of the update
  - The `upgradeToAndCall` call
    - MUST go to the right implementation address. This can be either the latest version or any other, newer version. If not, we return `"invalidUpgradeToImplementationAddress"`.
    - MUST go to the `initializeFrom` function
    - the additional data passed to `initializeFrom` MUST be empty. If not, we return `"invalidUpgradeToAndCallData"`.
      - the semantic version number of the previous DAO must be as expected. If not, we return `"invalidUpgradeToAndCallVersion"`.
  - `upgradeTo` can be called instead, if no reinitalization of the DAO is required. The call
    - MUST go to the right implementation address. This can be either the latest version or any other, newer version. If not, we return `"invalidUpgradeToAndCallImplementationAddress"`.
    - MUST have empty subsequent calldata. If not, we return `"invalidUpgradeToAndCallData"`.

### Plugin Updates

For each plugin update, we expect a block of associated actions. There can be multiple, independent plugin updates happening in one update proposal.
We expect two types of blocks:

```
[
  grant({_where: plugin, _who: pluginSetupProcessor, _permissionId: UPGRADE_PLUGIN_PERMISSION_ID}),
  applyUpdate({_dao: dao, _params: applyUpdateParams}),
  revoke({_where: plugin, _who: pluginSetupProcessor, _permissionId: UPGRADE_PLUGIN_PERMISSION_ID})
]
```

or

```
[
  grant({_where: plugin, _who: pluginSetupProcessor, _permissionId: UPGRADE_PLUGIN_PERMISSION_ID}),
  grant({_where: dao, _who: pluginSetupProcessor, _permissionId: ROOT_PERMISSION_ID}),
  applyUpdate({_dao: dao, _params: applyUpdateParams}),
  revoke({_where: dao, _who: pluginSetupProcessor, _permissionId: ROOT_PERMISSION_ID}),
  revoke({_where: plugin, _who: pluginSetupProcessor, _permissionId: UPGRADE_PLUGIN_PERMISSION_ID})
]
```

#### Mandatory `applyUpdate` Call

Each block being related to a plugin update MUST contain an `applyUpdate` action exactly once. This action is composed as follows:

- `to` MUST be the `PluginSetupProcessor` address
- `value` MUST be zero. If not, we return `"nonZeroApplyUpdateCallValue"`.
- `data` MUST contain the `applyUpdate` function selector in the first 4 bytes. The following bytes MUST be encoded according to the [the `build-metadata.json` specifications](https://devs.aragon.org/docs/osx/how-to-guides/plugin-development/publication/metadata).
  If we cannot decode the action, we return `"invalidData"`.
  If we cannot obtain the metadata, we return `"invalidPluginRepoMetadata"`.
  Furthermore, the data MUST
  - update a plugin that is currently installed to the DAO. If not, we return `"pluginNotInstalled"`.
  - update a plugin from an Aragon plugin repo. If it is not an Aragon repo, we return `"notAragonPluginRepo"`. If it does not exist, we return `"missingPluginRepo"`.
  - reference an update preparation (resulting from an `prepareUpdate` call). If the update is not prepared, we return `"missingPluginPreparation"`.
  - update to a new build and not
    - to the same or an older build. If not, we return `"updateToOlderOrSameBuild"`.
    - to a different release. If not, we return `"updateToIncompatibleRelease"`.

#### Mandatory `grant`/`revoke` `UPGRADE_PLUGIN_PERMISSION` Calls

The `applyUpdate` action MUST be wrapped by `grant` and `revoke` actions on the same DAO where

- `to` MUST be the DAO address
- `value` MUST be zero. If not, we return `"nonZeroGrantUpgradePluginPermissionCallValue"` / `"nonZeroRevokeUpgradePluginPermissionCallValue"`.
- `data` MUST contain the `grant` / `revoke` function selector in the first 4 bytes. The subsequent bytes MUST be as follows:
  - `where` MUST be the plugin proxy address. If not, we return `"invalidGrantUpgradePluginPermissionWhereAddress"` / `"invalidRevokeUpgradePluginPermissionWhereAddress"`.
  - `who` MUST be the `PluginSetupProcessor` address. If not, we return `"invalidGrantUpgradePluginPermissionWhoAddress"` / `"invalidRevokeUpgradePluginPermissionWhoAddress"`.
  - `permissionId` MUST be `bytes32 UPGRADE_PLUGIN_PERMISSION_ID = keccak256("UPGRADE_PLUGIN_PERMISSION")`. If not, we return `"invalidGrantUpgradePluginPermissionPermissionId"` / `"invalidRevokeUpgradePluginPermissionPermissionId"`.
  - `permissionName` MUST be `UPGRADE_PLUGIN_PERMISSION`. If not, we return `"invalidGrantUpgradePluginPermissionPermissionName"` / `"invalidRevokeUpgradePluginPermissionPermissionName"`

#### Optional `grant`/`revoke` `ROOT_PERMISSION` Calls

The `applyUpdate` action CAN be wrapped by `grant` and `revoke` actions on the same DAO where

- `to` MUST be the DAO address
- `value` MUST be zero. If not, we return `"nonZeroGrantRootPermissionCallValue"` / `"nonZeroRevokeRootPermissionCallValue"`.
- `data` MUST contain the `grant` / `revoke` function selector in the first 4 bytes. The subsequent bytes MUST be as follows:
  - `where` MUST be the DAO proxy address. If not, we return `"invalidGrantRootPermissionWhereAddress"` / `"invalidRevokeRootPermissionWhereAddress"`.
  - `who` MUST be the `PluginSetupProcessor` address. If not, we return `"invalidGrantRootPermissionWhoAddress"` / `"invalidRevokeRootPermissionWhoAddress"`.
  - `permissionId` MUST be `bytes32 ROOT_PERMISSION_ID = keccak256("ROOT_PERMISSION")`. If not, we return `"invalidGrantRootPermissionPermissionId"` / `"invalidRevokeRootPermissionPermissionId"`.
  - `permissionName` MUST be `ROOT_PERMISSION`. If not, we return `"invalidGrantRootPermissionPermissionName"` / `"invalidRevokeRootPermissionPermissionName"`


