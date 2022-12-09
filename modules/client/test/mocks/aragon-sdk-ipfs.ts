export const mockedIPFSClient = {
  nodeInfo: jest.fn().mockResolvedValue(true),
  add: jest.fn().mockResolvedValue({
    hash: "QmXhJawTJ3PkoKMyF3a4D89zybAHjpcGivkb7F1NkHAjpo",
  }),
  cat: jest.fn().mockImplementation(async () => Buffer.from("{}")),
  pin: jest.fn().mockResolvedValue({
    pins: ["QmXhJawTJ3PkoKMyF3a4D89zybAHjpcGivkb7F1NkHAjpo"],
    progress: undefined,
  }),
  __proto__: {},
};

const mockedModuleStructure = {
  Client: function () {
    return mockedIPFSClient;
  },
};

// mocking the inheritance chain to bypass instanceOf checks
mockedIPFSClient.__proto__ = mockedModuleStructure.Client.prototype;

jest.mock("@aragon/sdk-ipfs", () => mockedModuleStructure);
