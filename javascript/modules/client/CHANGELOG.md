# Aragon JS SDK (client) changelog

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

<!--
TEMPLATE:
(Leave "## [UPCOMING]" first and describe the changes below it)

### Added
- Feature 1, 2, 3

### Changed
- Change 1, 2, 3

### Fixed
- Fix 1, 2, 3
-->

## [UPCOMING]

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
