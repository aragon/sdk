const original = jest.requireActual("@ethersproject/providers");
export const mockedEthersProviders = {
  ...original,
  getNetwork: jest.fn().mockReturnValue({ chainId: 31337, name: "goerli" }),
};
jest.mock("@ethersproject/providers", () => {
  return mockedEthersProviders;
});
