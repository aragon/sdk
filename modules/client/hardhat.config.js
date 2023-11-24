require('@nomiclabs/hardhat-ethers');
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.19',
  networks: {
    hardhat: {
      forking: {
        url: 'https://example.com',
        blockNumber: 1,
        // Disables forking for tests but necessary for the test-enviornment to function because of a dependency
        enabled: false,
      },
      chainId: 31337,
      // necessary to deploy osx 1.2.1 in hardhat node
      allowUnlimitedContractSize: true,
      accounts: {
        count: 3,
      },
    },
  },
};
