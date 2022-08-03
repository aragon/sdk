import { DaoMetadata } from "../interfaces/client";

// TODO: delete this file

export function getDummyDao(addressOrEns?: string): DaoMetadata {
  const dummyDaoNames = [
    "Patito Dao",
    "One World Dao",
    "Sparta Dao",
    "Yggdrasil Unite",
  ];
  const dummyDaoEns = [
    "patito.eth",
    "oneworld.eth",
    "spartadao.eth",
    "yggdrasil.eth",
  ];
  const daoIndex = Math.floor(Math.random() * dummyDaoNames.length + 1)
  let address = Math.random() < 0.5 ? "0x1234567890123456789012345678901234567890" : dummyDaoEns[daoIndex]
  if (addressOrEns) {
    address = addressOrEns
  }

  const fromDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1),
  ).getTime();

  return {
    address,
    name: dummyDaoNames[daoIndex],
    createdAt: new Date(fromDate + Math.random() * (Date.now() - fromDate)),
    description: `We are a community that loves trees and the planet. We track where forestation is increasing (or shrinking), fund people who are growing and protecting trees...`,
    links: [
      {
        description: "Website",
        url: "https://google.com",
      },
      {
        description: "Discord",
        url: "https://google.com",
      },
    ],
    plugins: [
      "0x1234567890123456789012345678901234567890",
      "0x1234567890123456789012345678901234567890"
    ]
  }
}