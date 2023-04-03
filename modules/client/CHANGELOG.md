# Aragon JS SDK (client) changelog

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

<!--
TEMPLATE:
(Leave "## [UPCOMING]" first and describe the changes below it)

### Added
- Feature 1, 2, 3

- Change 1, 2, 3

-->
## [UPCOMING]
## [1.4.2]
### Fixed
- Removed not working sortby
- Fix `Status.DEFEATED` filter
### Fixed
- Error handling if ENS cannot be resolved.
### Changed
- Uses `earlyExecuted` for proposal state calculation in Addresslistvoting and Tokenvoting.
## [1.4.1]
## Fixed
- Amending the type in subgraph's `minApprovals`
- Removed not working sortby
- Fix `Status.DEFEATED` filter
## [1.4.0]
### Added
- Add ipfs optimization.
### Fixed
- Fix plugin installation
## [1.3.1]
### Fixed
- Polygon network names
## [1.3.0]
### Added
- Add support for polygon.

### Changed
- Updates `@aragon/osx-ethers` to v1.2.1.
- Reverts the encoding of `addAddresses` and `removeAddresses` in the multisig plugin to return only one action

## [1.2.0]
### Added
- Add support for mumbai.

### Changed
- Updates `@aragon/osx-ethers` to v1.2.0.

## [1.1.0]
### Added
- `prepareInstallation` function to multisig-client, tokenvoting-client and addresslist-client
- Add `applyInstallation` encoder and decoder to client 
### Changed
- `AddAddresses`and `RemoveAddresses` encoders now return an array of actions one for adding or removing the addresses and other for updating the settings in a specific order for the transaction not to revert
### Fixed
- Subgraph making 2 calls in each request
## [1.0.2]
  
Version bump

## [1.0.1]
### Added
- `settings` to `tokenVotingProposalListItem`

### Fixed
- Multisig proposals returning the wrong settings
## [1.0.0]
### Fixed
- Compute status functions
## [0.23.1-beta]
### Fixed
- Adapt sdk to new subgraph proposalIds
## [0.23.0-beta]
### Changed
- Upgrade contracts to version 0.8.0
### Fixed
- Status in multisig proposal
## [0.22.0-beta]

Release candidate 1

### Added
- Encoders and decoders for `grantWithConditionAction`
- Encoders and decoders for `setDaoUriAction`
- Encoders and decoders for `registerStandardCallbackAction`
- Encoders and decoders for `setSignatureValidatorAction`
- Encoders and decoders for `upgradeToAction`
- Encoders and decoders for `upgradeToAndCallAction`
- Examples for new decoders and encoders
- JsDoc for new encoders and decoders
- Add `settings` and `appovals` fields to `MultisigProposalBase`
- Add `creationBlockNumber` `executionDate` and `creationBlockNumber` to `MultisigProposal`
- Add `totalVotingWeight` to `tokenVotingListItem`

### Changed
- `ICreateProposalParams` => `CreateMajorityVotingProposalParams`
- `IProposalSettings` => `MajorityVotingProposalSettings`
- Rename all mention of `ensureAllowance` to `updateAllowance`
- ensDomain now includes `.dao.eth`
- `getPluginInstallItem` now receives a `network` parameter to select the right Plugin Repo. Defaults to `mainnet`
- Renamed `address`/`addressOrEns` to `voterAddressOrEns`/`approverAddressOrEns` in `canVote`/`canApprove` functions
- `proposalId` is now a `string` everywhere and follows the new general format
- `canExecute()` and `execute()` expect the `proposalId` as parameter now.

### Removed
- removes `IExecuteProposalParams`, `CanExecuteParams` and `ExecuteProposalParams` types/interfaces
- removes `isProposalId()` and moves it to @aragon/sdk-common

## [0.21.2-beta]
### Fixed
- Add `transfer` to available functions

## [0.21.1-beta]
### Fixed 
- `startDate` and `endDate` swapped on `getProposal` funtion of the multisig client

### Changed
- Update common package to `0.10.1-beta` 
### Added
- Add `endDate` and `startDate` to `MultisigProposalListItem`  
## [0.21.0-beta]
### Changed
- Update `getDaoBalances` parameters from `daoAddressOrEns` to `DaoBalancesQueryParams`

### Added
- Add support for Subgraph version `0.7.2-alpha`
- Add Vote Replacement flag in MajorityVoting clients

## [0.20.0-beta]
### Changed
- Updates to contracts-ethers v0.7.1
- Splits `getPluginSettings` in `getVotingSettings` and `getMembers`
- `encoding.withdrawAction` now accepts a single parameter of type `WithdrawParams`
  - `IWithdrawParams` is now `WithdrawParams`
- `decoding.withdrawAction` now receives the `to` and `value` parameters, in addition to `data`
- `DepositParams`
- `IDepositParams` is now `DepositParams`
  - It always gets a `type: TokenType`
- `proposalId` is now a `bigint` on every plugin
  - WARNING: This may change to a string, due to Subgraph limitations
- `IAddressListPluginInstall` is now `IAddresslistVotingPluginInstall`
- `decoders.removeMembersAction()` now returns an array of addresses
- `DaoSortBy.NAME` => `DaoSortBy.SUBDOMAIN`
- `ensureAllowance`'s field `daoAddress` is now named `daoAddressOrEns`
- `TokenType` replaces any other token/transfer type enum

### Added
- Proposals accept a `failSafeActions` variable
- Multisig plugin settings now include `startDate` and `endDate`
- `ICreateProposalParams` now receives an optional `failSafeActions` array, to denote which could fail without disrupting the entire execution flow
- `createDao` now returns `pluginAddresses` when `DONE`
- Multisig proposals have a `startDate`, `endDate` (and `approvals` when reading back)
- `canExecute()` added to `TokenVotingClient.methods` and `AddresslistVotingClient.methods`
- `executionTxHash` added to `TokenVotingProposal` and `AddresslistVotingProposal`
- `CreateDaoParams` now includes `daoUri`
- `pluginAddresses` on `DaoCreationStepValue`
  - WARNING: it may be updated into an array of objects like `{address, pluginRepoEns}` to identify what plugin it corresponds

### Removed
- Freeze action encoders
  - Removed `IFreezePermissionParams` and `IFreezePermissionDecodedParams`
- The `reference` field on deposits and withdrawals

## [0.19.0-alpha]

### Fixed
- Transfer and Balances queries

## [0.18.0-alpha]
### Added
- Add `pinMetadata` examples
### Fixed
- Fix `getVotingSettings` respoinse in tokenVoting and addresslistVoting clients
- Fix `updateMetadata` decoders
- Fix `getProposals` ERC721 support on `tokenVotingClient`
- Fix `VotingMode` not decoding
### Changed
- renames `updateMetadataRawAction` to `updateDaoMetadataRawAction`
- renames `updateMetadataAction` to `updateDaoMetadataAction`
- Renames `getBalances` to `getDaoBalances`
- Renames `getTransfers` to `getDaoTransfers`
- Renames `ICreateParams` to `CreateDaoParams`
- Renames `IMetadata` to `DaoMetadata`
- Add `MultisigClient`
- Changes `ClientAddressList` to `AddresslistVotingClient`
- Changes all `addressList` to `AddresslistVoting`
- Exposes `ensureAllowance` method
- Fix precission in `VotingSettings`
- renames `IPluginSettings` to `VotingSettings`
- renames `minTurnout` to `minParticipation`
- renames `minSupport` to `supportThreshold`
- add `minProposerVotingPower`, `earlyExecution`and `voteReplacement` fields to `VotingSettings` and graphql responses
- renames `ClientErc20` to `TokenVotingClient`
- renames `IErc20PluginInstall` to `ITokenVotingPluginInstall`
- renames `Erc20Proposal` to `TokenVotingProposal`
- renames `Erc20ProposalListItem` to `TokenVotingProposalListItem`
- changes the value of `ERC20VotingPlugin` in `SubgraphPluginTypeMap` from `erc20voting.dao.eth` to `token-voting.plugin.dao.ethh`
- renames `Erc20ProposalResult` to `TokenVotingProposalResult`
- rename `getSettings` to `getVotingSettings`


## [0.16.2-alpha]

### Changed
- Removes Changelog update from javascript publish workflow
- Fix `minSupport` and `minTurnout` return values in `erc20.getSettings()`
- Fix `minSupport` and `minTurnout` return values in `addresslist.getSettings()`

## [0.16.1-alpha]
### Changed
- Split `createDao()` and `pinMetadata()` 
- Split `createProposal()` and `pinMetadata()` 

### Added
- Graphql query in AddresslistPlugin and Erc20Plugin for `getMembers()`

## [0.16.0-alpha]
### Added
- Checks during DAO creation if at least 1 plugin requests exec permission

## [0.15.2-alpha]
### Changed
- Removed `tokenAddresses` param from `getBalances()` function
### Fixed
- Reading metadata back now parses the IPFS URI schema
- Fix `resolveIpfsCid()` cross-browser compatibility

## 0.15.1-alpha
On 2022-12-06 11:20:50
### Fixed
- Bigint overflow in deposit

## 0.15.0-alpha
On 2022-11-26 10:27:25
### Changed
- Stores CIDs with `ipfs://` prefix in contracts

### Added
- Checks if at least one plugin requests `EXECUTE_PERMISSION` during DAO creation
- Mocking of the IPFS client during testing

### Fixed
- Removes hardcoded IPFS CIDs

## 0.14.0-alpha
On 2022-11-22 16:45:52
### Fixed
- Adapt the latest Subgraph query names

## [0.13.0-alpha]
### Added
- Added `createProposal()` using real contracts
- Added `vote()` on proposals using real contracts
- Added `execute()` on proposals using real contracts
- Added `canVote()` on proposals using real contracts
- Added `hasPermission()` using real contract calls

## 0.12.0-alpha
### Changed
- Examples folder and files
- Automatic generated README from examples
- Split clients into modules
- Removed `javascript` folders
- Updates `@aragon/core-contracts-ethers` to `v0.4.1-alpha`
- Parameters types for DAO creation
- Make `tokenAdresses` optional on `getBalances`
### Added
- Update Allowance estimation
- Create dao using real contracts
- Added `daoRegistryAddress` and `pluginRepoRegistryAddress` to web3 module
### Fixed
- Fixed autogenerated docs

## 0.11.0-alpha
On 2022-10-17 09:26:34
### Fixed
- Fix README for `findInterface` function
### Added
- Filtering by status and daoAddress in getProposals
- Types for contract params
### Changed
- Naming in wrap/unwrap function

## 0.10.3-alpha
On 2022-10-05 13:13:17
### Fixed
- Fixed APP-1032 comments

## 0.10.2-alpha
On 2022-10-04 16:58:38

## 0.10.1-alpha
On 2022-10-04 15:35:36
### Fixed
- Fix missing exports

## 0.10.0-alpha
On 2022-10-04 10:32:59
### Added
- Transfers as an unique object
- Filtering on `getTransfers`
### Fixed
- Dao subgraph queries
- Proposal subgraph queries

## 0.9.0-alpha
On 2022-09-29 12:58:04

### Changed
- splitted `internal/core.ts` logic into multiple modules `internal/modules/graphql.ts`,`internal/modules/ipfs.ts` and `internal/modules/web3.ts`

- Remove puginAddress from `PluginContext` class

### Fixed
- Fix `fromContext` function
- Typo in `addreslistvoting.dao.eth` string
## 0.8.0-alpha
On 2022-09-22 11:09:46
### Added
- Adding the `canVote` getter to the address list and ERC20 clients

## 0.7.0-alpha
On 2022-09-21 14:50:29
### Added
- Add mint token encoders and decoders
- Add add members encoders and decoders
- Add remove members encoders and decoders
## 0.6.0-alpha
On 2022-09-20 12:08:58
### Added
- Use real IPFS data
- Use real subgraph data
## 0.5.0-alpha
On 2022-09-15 08:45:35
### Added
- Delays between yields
- Add getToken function to the erc20-client
- Encode and decode of Grant, Revoke and Freeze actions
## 0.4.3-alpha
On 2022-09-07 14:47:58
### Fixed
- Encoding flow when updating plugin settings
## 0.4.2-alpha
On 2022-09-07 11:19:55

### Changed
- Make the signer parameter optional

## 0.4.1-alpha
On 2022-09-07 11:08:27

### Fixed
- Fixed names not appearing in mock calls
## 0.4.0-alpha
On 2022-09-06 16:34:24
### Added
- Add decoders for the following actions:
  - **Client**
    - Withdraw
    - UpdateMetadata
  - **ERC20**
    - UpdatePluginSettings
  - **Address List**
    - UpdatePluginSettings
### Fixed
- Version of the common package `0.2.0` => `0.2.1`

### Added
- Update settings action
- Get Settings method
- Mock methods for the rest of the flows

### Changed
- The plugin address is no longer part of the context
- The plugin address must be specified when calling functions
- All the plugin functions that interact with a SC now receive an object insted of separate parameters
- Update Readme

### Fixed
- Consistency issues in naming

### Added
- Internal Graphql client
- AddressList Client
- JsDoc to AddressList Client and ERC20 Client
- Mocks in AddressList Client
- Other mocks in `Client` and `ERC20Client`

### Changed
- `ContextErc20` => `ContextPlugin`

### Changes (breaking)
- Now using a general-purpose `Client` class and a plugin-specific one for the rest (`ClientErc20`)

### Added
- Providing IPFS support with full isomorphic compatibility

## 0.0.18-alpha
On 2022-06-16 12:44:48

## 0.0.17-alpha
On 2022-06-15 13:01:18

### Changed
- Backing off `ipfs-http-client` until the UI framework supports it

## 0.0.16-alpha
On 2022-06-14 15:03:15

- Gas fee estimation for `deposit` and `updateAllowance`.

### Changed
- `deposit` method handles all steps by using a `AsyncGenerator`.

## [0.0.15-alpha] - Tue Jun 14 12:33:47 UTC 2022  
  
## [0.0.14-alpha] - Tue Jun 14 08:40:07 UTC 2022  

### Added
- Adding IPFS support for pinning and fetching data

## [0.0.13-alpha] - Tue May 24 09:26:45 UTC 2022  

### Added
- Getting `DAOFactory` address from `@aragon/core-contracts-ethers` package depending on the selected network in `Context`.
  
## [0.0.12-alpha] - Mon May 23 11:17:16 UTC 2022  

### Changed
- Upgraded `@aragon/core-contracts-ethers` package to the `0.2.1-alpha` version and adapted the base code to accept the new `VoteConfigStruct` struct.

## [0.0.11-alpha] - Wed May 18 14:51:02 UTC 2022  
  
## [0.0.10-alpha] - Wed May 18 14:42:35 UTC 2022  

### Added
- Deposit ETH and ERC20 tokens to DAO.
- Withdrawal action creation helper.

### Changed
- `average` and `max` values for the gas fee estimations returned as `bigint`.

### Fixed
- Exported `IDeposit` and `ICreateProposal`.

## [0.0.9-alpha] - Wed May 11 09:17:46 UTC 2022 

### Added
- Github actions automation to deploy this package.

### Changed
- Returning of `average` and `max` values for the gas fee estimations.

### Fixed
- Gas fee estimations with new `gasFeeData` functions for EIP-1559.
- Fixes Github actions workflows

## [0.0.5-alpha] - 2022-04-19

### Added
- Creation of proposals.

## [0.0.4-alpha] - 2022-04-13

### Added
- Gas estimation for creating DAOs.

## [0.0.3-alpha] - 2022-04-08

### Added
- Connected signer getter in `ClientCore`.

### Fixed
- Use of a connected signer in the DAO creation process.

## [0.0.2-alpha] - 2022-04-06

### Fixed
- Fixed `@aragon/sdk-common` dependency.

## [0.0.1-alpha] - 2022-04-02

First initial version of the client package.
