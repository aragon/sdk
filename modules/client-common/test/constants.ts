import { MetadataAbiInput } from "../src";

export const TEST_WALLET =
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";
export const TEST_WALLET_ADDRESS = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
export const ADDRESS_ONE = "0x0000000000000000000000000000000000000001";

export const web3endpoints = {
  working: [
    "https://cloudflare-eth.com/",
  ],
  failing: ["https://bad-url-gateway.io/"],
};

export const DEFAULT_IPFS_ENDPOINTS = [
  "https://prod.ipfs.aragon.network/api/v0/",
  "https://test.ipfs.aragon.network/api/v0/",
];

export const TEST_ABI: MetadataAbiInput[] = [
  {
    name: "a",
    type: "tuple",
    internalType: "struct A",
    description: "A",
    components: [
      {
        name: "b1",
        type: "address",
        internalType: "address",
        description: "B1",
      },
      {
        name: "b2",
        type: "tuple",
        internalType: "struct B2",
        description: "B2",
        components: [
          {
            name: "c1",
            type: "uint256",
            internalType: "uint256",
            description: "C1",
          },
          {
            name: "c2",
            type: "tuple",
            internalType: "struct C2",
            description: "C2",
            components: [
              {
                name: "d1",
                type: "address",
                internalType: "address",
                description: "D1",
              },
              {
                name: "d2",
                type: "tuple",
                internalType: "struct D2",
                description: "D",
                components: [
                  {
                    name: "e1",
                    type: "address[]",
                    internalType: "address[]",
                    description: "E1",
                  },
                  {
                    name: "e2",
                    type: "tuple",
                    internalType: "struct E2",
                    description: "E2",
                    components: [
                      {
                        name: "f1",
                        type: "uint32",
                        internalType: "uint32",
                        description: "F1",
                      },
                      {
                        name: "f2",
                        type: "tuple",
                        internalType: "struct F2",
                        description: "F2",
                        components: [
                          {
                            name: "g1",
                            type: "uint256",
                            internalType: "uint256",
                            description: "G1",
                          },
                          {
                            name: "g2",
                            type: "uint256",
                            internalType: "uint256",
                            description: "G2",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
