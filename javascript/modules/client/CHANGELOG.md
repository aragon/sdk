<!--
Template:
## [TBD]  
  
## [0.0.12-alpha] - Mon May 23 11:17:16 UTC 2022  
  
## [0.0.11-alpha] - Wed May 18 14:51:02 UTC 2022  
  
## [0.0.10-alpha] - Wed May 18 14:42:35 UTC 2022  
  
## [0.0.9-alpha] - Wed May 11 09:17:46 UTC 2022 (Leave the TBD and add your changes below it. Github actions uses this pattern to get the right Changelogs for the release)

Description of the release

### Added
- Link, and make it obvious that date format is ISO 8601.

### Changed
- Clarified the section on "Is there a standard change log format?".

### Fixed
- Fix Markdown links to tag comparison URL with footnote-style links.
-->

# Change Log
All notable changes to the javascript client package of the SDK will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [TBD]  

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
