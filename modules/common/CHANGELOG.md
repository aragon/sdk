# Aragon JS SDK (common) changelog

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
## UPCOMING
### Removes
- removed `random.ts`
### Added
- `tryUntil` function

## 0.12.0-beta
### Added
- `getCompactProposalId` and `getExtendedProposalId` functions
## 0.11.0-beta

Release candidate 1

### Changed
- Rename `EnsureAllowanceError` to `UpdateAllowanceError`
- Changes `encodeProposalId` and `decodeProposalId` function to support the new format

### Adds
- Adds `isProposalId()` function to the package
- Adds `encodeProposalId(addr, nonce)` and `decodeProposalId(pid)`
- Adds `UnsupportedNetworkError` error type

## 0.10.1-beta
- Fix `hextoBytes` throwing an error when `0x` is the input

## 0.10.0-beta
- Adds new error `EnsureAllowanceError`
- Adds new error `InvalidPrecisionError`
- Adds `boolArrayToBitmap` and `bitmapToBoolArray`

## 0.9.1-alpha
On 2022-12-13 15:57:38
### Fixed
- IPFS uri resolving

## [0.9.0-alpha]
### Added
- Adds new error `MissingExecPermissionError`

### Fixed
- Fix helper function to resolve IPFS CIDS

## [0.8.0-alpha]
### Added
- Helper function to resolve IPFS CID's

## [0.7.0-alpha]
### Added
- New error type for failed pinning on IPFS

## [0.6.0-alpha]
### Added
- New error types
## 0.5.0-alpha
On 2022-09-22 11:10:24
### Added
- New error types
## 0.4.0-alpha
On 2022-09-21 14:49:57
### Added
- New error types
## 0.3.0-alpha
On 2022-09-20 12:08:47 
### Added
- New error types
### Fixed
- `Buffer` being used not compatible with web environments
### Updated
- Renaming `bufferToHexString` to `bytesToHex`
- Renaming `hexStringToBuffer` to `hexToBytes`
- Version bump

## 0.0.2-alpha

### Added
- Github actions automation to deploy this package 
- `Random.getFloat()`

## 0.0.1-alpha

- Initial version
