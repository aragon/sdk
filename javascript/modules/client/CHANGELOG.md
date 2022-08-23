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
