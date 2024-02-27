---
title: Update Security Check
---

## Context

Aragon DAOs and the plugins installed can be updated via proposals. Upon execution, the proposal will call the DAO's [`execute` function][execute] and execute whatever action are specified inside its action list.
Accordingly, proposals must be checked thoroughly, especially when it comes to DAO or plugin updates. This happens automatically on the Aragon App frontend.

All proposals scheduled in the DAO are checked via their proposal ID. A proposal is identified as an update proposals if it contains

- one call to either
  - [`upgradeTo(address newImplementation)`][oz-upgradeto]
    OR
  - [`upgradeToAndCall(address newImplementation, bytes memory data)`][oz-upgradetoandcall]
- one or more calls to [`applyUpdate(address _dao, ApplyUpdateParams _params)`][applyupdate]

If a proposal is identified as an update proposal, we conduct general and specific checks on it.

## General Proposal Checks

After a proposal was identified as an update proposal, we check that only allowed actions are part of the action list and that none of them is allowed to fail.

| Error                           | Explanation                                                                                                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"invalidActions"`              | The proposal contains unexpected actions that are not allowed for update proposals.                                                                               |
| `"nonZeroAllowFailureMapValue"` | The allow failure map is not zero (see [the Aragon OSX docs](https://devs.aragon.org/docs/osx/how-it-works/core/dao/actions#the-allowfailuremap-input-argument)). |
| `"proposalNotFound"`            | The proposal could not be found.                                                                                                                                  |

## Action-Specific Checks

After the general checks, we check every action in the `Action[]` array separately. An action has three fields [see][action]:

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

In the following, we explain the action specific checks.

### DAO Update

For DAO updates, we expect single action at position 0 of the action array. This action, must call

- `upgradeTo(address newImplementation)`
  OR
- `upgradeToAndCall(address newImplementation, bytes memory data)`

#### Checking the `upgradeTo` Calldata

| Item    | Error                                     | Explanation                                                                                                                               |
| ------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `to`    | `"invalidToAddress"`                      | The `to` address of the action must be the DAO contract.                                                                                  |
|         |                                           |                                                                                                                                           |
| `value` | `"nonZeroCallValue"`                      | The `value` native token value send with the call must be zero.                                                                           |
|         |                                           |                                                                                                                                           |
| `data`  | `"invalidActions"`                        | The first 4 bytes must match the [`upgradeTo` function][oz-upgradeto] selector (see [General Proposal Checks](#general-proposal-checks)). |
|         | `"invalidUpgradeToImplementationAddress"` | The `newImplementation` address must match with a newer DAO implementation contract developed by Aragon.                                  |

#### Checking the Action `data` calling `upgradeToAndCall`

| Item    | Error                                            | Explanation                                                                                                                                                                                                                                                                                                                                |
| ------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `to`    | `"invalidToAddress"`                             | The `to` address of the action must be the DAO contract.                                                                                                                                                                                                                                                                                   |
|         |                                                  |                                                                                                                                                                                                                                                                                                                                            |
| `value` | `"nonZeroCallValue"`                             | The `value` native token value send with the call must be zero.                                                                                                                                                                                                                                                                            |
|         |                                                  |                                                                                                                                                                                                                                                                                                                                            |
| `data`  | `"invalidActions"`                               | The first 4 bytes must match the [`upgradeToAndCall` function][oz-upgradetoandcall] selector (see [General Proposal Checks](#general-proposal-checks)).                                                                                                                                                                                    |
|         | `"invalidUpgradeToAndCallImplementationAddress"` | The `newImplementation` address must match with a newer DAO implementation contract developed by Aragon.                                                                                                                                                                                                                                   |
|         | `"invalidUpgradeToAndCallData"`                  | The `data` passed into `upgradeToAndCall` must call the [`initializeFrom(uint8[3] _previousProtocolVersion, bytes _initData)` function][initializefrom]. The first 96 bytes of `data` must be occupied by an `uint[3] _previousProtocolVersion` semantic version number. The sub `_initData` must be empty for the current Aragon updates. |
|         | `"invalidUpgradeToAndCallVersion"`               | `uint[3] _previousProtocolVersion` must match with the semantic version number of the DAO the upgrade is transitioning from.                                                                                                                                                                                                               |

### Plugin Update

For each plugin update, we expect a block of associated actions. There can be multiple, independent plugin updates happening in one update proposal.
We expect two types of blocks:

```solidity
[
  grant({_where: plugin, _who: pluginSetupProcessor, _permissionId: UPGRADE_PLUGIN_PERMISSION_ID}),
  applyUpdate({_dao: dao, _params: applyUpdateParams}),
  revoke({_where: plugin, _who: pluginSetupProcessor, _permissionId: UPGRADE_PLUGIN_PERMISSION_ID})
]
```

or

```solidity
[
  grant({_where: plugin, _who: pluginSetupProcessor, _permissionId: UPGRADE_PLUGIN_PERMISSION_ID}),
  grant({_where: dao, _who: pluginSetupProcessor, _permissionId: ROOT_PERMISSION_ID}),
  applyUpdate({_dao: dao, _params: applyUpdateParams}),
  revoke({_where: dao, _who: pluginSetupProcessor, _permissionId: ROOT_PERMISSION_ID}),
  revoke({_where: plugin, _who: pluginSetupProcessor, _permissionId: UPGRADE_PLUGIN_PERMISSION_ID})
]
```

#### Mandatory `applyUpdate` Call

Each block being related to a plugin update must contain an action calling the [`applyUpdate(address _dao, ApplyUpdateParams _params)` function][applyupdate] exactly once.
This action is composed as follows:

This action calls the [`applyUpdate(address _dao, ApplyUpdateParams _params)` function][applyupdate]

| `Action` field | Error                           | Explanation                                                                                                                                |
| -------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `to`           | `"invalidToAddress"`            | The `to` address of the action must be Aragon's `PluginSetupProcessor` contract.                                                           |
|                |                                 |                                                                                                                                            |
| `value`        | `"nonZeroApplyUpdateCallValue"` | The `value` send with the call must be zero.                                                                                               |
|                |                                 |                                                                                                                                            |
| `data`         | `"invalidActions"`              | The first 4 bytes must match the [`applyUpdate` function][applyupdate] selector (see [General Proposal Checks](#general-proposal-checks)). |
|                | `"invalidData"`                 | The bytes must be decodable as specified in the plugins `_metadata` [see our specs][build-metadata] (**currently we skip this**).          |
|                | `"invalidPluginRepoMetadata"`   | The [`build-metadata`][build-metadata] could not be found or is incorrectly formatted.                                                     |
|                | `"pluginNotInstalled"`          | The plugin address referenced in the `_params` is not installed.                                                                           |
|                | `"missingPluginRepo"`           | The plugin repo referenced in the `_params` is not existing.                                                                               |
|                | `"notAragonPluginRepo"`         | The plugin repo referenced in the `_params` is not an Aragon plugin repo.                                                                  |
|                | `"missingPluginPreparation"`    | The update was not prepared in Aragon's `PluginSetupProcessor` contract.                                                                   |
|                | `"updateToOlderOrSameBuild"`    | The update wants to transition to the same or an older build.                                                                              |
|                | `"updateToIncompatibleRelease"` | The update wants to transition to a different, incompatible release.                                                                       |

#### Mandatory `grant`/`revoke` `UPGRADE_PLUGIN_PERMISSION` Calls

The `applyUpdate` action must be wrapped by `grant` and `revoke` actions:

| `Action` field | Error                                                  | Explanation                                                                                                                                          |
| -------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `to`           | `"invalidGrantUpgradePluginPermissionToAddress"`       | The `to` address must be the DAO contract.                                                                                                           |
|                |                                                        |                                                                                                                                                      |
| `value`        | `"nonZeroGrantUpgradePluginPermissionCallValue"`       | The `value` send with the call must be zero.                                                                                                         |
|                | `"nonZeroRevokeUpgradePluginPermissionCallValue"`      | "                                                                                                                                                    |
|                |                                                        |                                                                                                                                                      |
| `data`         | `"invalidActions"`                                     | The first 4 bytes must match the [`grant` or][grant] [`revoke` function][revoke] selector (see [General Proposal Checks](#general-proposal-checks)). |
|                | `"invalidGrantUpgradePluginPermissionWhereAddress"`    | The `where` address must be the plugin proxy contract.                                                                                               |
|                | `"invalidRevokeUpgradePluginPermissionWhereAddress"`   | "                                                                                                                                                    |
|                | `"invalidGrantUpgradePluginPermissionWhoAddress"`      | The `who` address must be Aragon's `PluginSetupProcessor` contract.                                                                                  |
|                | `"invalidRevokeUpgradePluginPermissionWhoAddress"`     | "                                                                                                                                                    |
|                | `"invalidGrantUpgradePluginPermissionPermissionId"`    | `permissionId` must be `keccak256("UPGRADE_PLUGIN_PERMISSION")`.                                                                                     |
|                | `"invalidRevokeUpgradePluginPermissionPermissionId"`   | "                                                                                                                                                    |
|                | `"invalidGrantUpgradePluginPermissionPermissionName"`  | `permissionName` must be `UPGRADE_PLUGIN_PERMISSION`.                                                                                                |
|                | `"invalidRevokeUpgradePluginPermissionPermissionName"` | "                                                                                                                                                    |

#### Optional `grant`/`revoke` `ROOT_PERMISSION` Calls

The `applyUpdate` action CAN be wrapped by `grant` and `revoke` actions:

| `Action` field | Error                                         | Explanation                                                                                                                                          |
| -------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `to`           | `"invalidGrantRootPermissionToAddress"`       | The `to` address must be the DAO contract.                                                                                                           |
|                |                                               |                                                                                                                                                      |
| `value`        | `"nonZeroGrantRootPermissionCallValue"`       | The `value` send with the call must be zero.                                                                                                         |
|                | `"nonZeroRevokeRootPermissionCallValue"`      | The `value` send with the call must be zero.                                                                                                         |
|                |                                               |                                                                                                                                                      |
| `data`         | `"invalidActions"`                            | The first 4 bytes must match the [`grant` or][grant] [`revoke` function][revoke] selector (see [General Proposal Checks](#general-proposal-checks)). |
|                | `"invalidGrantRootPermissionWhereAddress"`    | The `where` address must be the DAO contract.                                                                                                        |
|                | `"invalidRevokeRootPermissionWhereAddress"`   | "                                                                                                                                                    |
|                | `"invalidGrantRootPermissionWhoAddress"`      | The `who` address must be Aragon's `PluginSetupProcessor`.                                                                                           |
|                | `"invalidRevokeRootPermissionWhoAddress"`     | "                                                                                                                                                    |
|                | `"invalidGrantRootPermissionPermissionId"`    | The `permissionId` must be `keccak256("ROOT_PERMISSION")`.                                                                                           |
|                | `"invalidRevokeRootPermissionPermissionId"`   | "                                                                                                                                                    |
|                | `"invalidGrantRootPermissionPermissionName"`  | The `permissionName` must be `ROOT_PERMISSION`.                                                                                                      |
|                | `"invalidRevokeRootPermissionPermissionName"` | "                                                                                                                                                    |

[execute]: ../../osx/01-how-it-works/01-core/01-dao/01-actions.md#a-deep-dive-into-actions-and-execution
[action]: ../../osx/01-how-it-works/01-core/01-dao/01-actions.md#actions
[allowfailuremap]: ../../osx/01-how-it-works/01-core/01-dao/01-actions.md#allowing-for-failure
[initializefrom]: ../../osx/03-reference-guide/core/dao/DAO.md#external-function-initializefrom
[oz-upgradeto]: https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/3d4c0d5741b131c231e558d7a6213392ab3672a5/contracts/proxy/utils/UUPSUpgradeable.sol#L74-L77
[oz-upgradetoandcall]: https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/3d4c0d5741b131c231e558d7a6213392ab3672a5/contracts/proxy/utils/UUPSUpgradeable.sol#L89-L92
[applyupdate]: ../../osx/03-reference-guide/framework/plugin/setup/PluginSetupProcessor.md#external-function-applyupdate
[grant]: ../../osx/03-reference-guide/core/permission/PermissionManager.md#external-function-grant
[revoke]: ../../osx/03-reference-guide/core/permission/PermissionManager.md#external-function-revoke