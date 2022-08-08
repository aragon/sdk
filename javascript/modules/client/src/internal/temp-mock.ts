import { Random } from "@aragon/sdk-common";
import { DaoMetadata } from "./interfaces/client";
import { ProposalStatus } from "./interfaces/common";
import { Erc20Proposal, MultisigProposal, VoteOptions } from "./interfaces/plugins";

export function getDummyMultisigProposal(proposalId?: string): MultisigProposal {

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

  const proposalTitles = [
    "New Founding for Lorex Lab SubDao",
    "Yet another proposal...",
    "Donation so some DAO",
    "Buy more NFTs?",
  ]
  const yes = Math.floor(Random.getFloat() * 1001)
  const no = Math.floor(Random.getFloat() * 1001)
  const abstain = Math.floor(Random.getFloat() * 1001)
  const index = Math.floor(Random.getFloat() * dummyDaoNames.length + 1)
  let address = Random.getFloat() < 0.5 ? "0x1234567890123456789012345678901234567890" : dummyDaoEns[index]

  const dateWithinThisYear = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1)
  ).getTime();

  const startDate = new Date(
    dateWithinThisYear + Random.getFloat() * (Date.now() - dateWithinThisYear)
  );
  const voteId = Math.floor(Random.getFloat() * 101).toString(16)
  return {
    id: proposalId ?? ("0x1234567890123456789012345678901234567890" + '_0x' + voteId),
    daoAddress: address,
    daoName: dummyDaoNames[index],
    startDate,
    endDate: new Date(startDate.getTime() + 7200000),
    creatonDate: new Date(dateWithinThisYear),
    title: proposalTitles[index],
    summary:
      "As most community members know, Aragon has strived to deploy its products to more cost-efficient blockchain networks to facilitate interaction.",
    description: "This is the super important proposal body",
    resources: [{ url: "https://example.com", description: "Example" }],
    creatorAddress: "0x1234567890123456789012345678901234567890",
    status: ProposalStatus.ACTIVE,
    result: {
      yes,
      no,
      abstain,
    },
    config: {
      minParticipationPct: Math.floor(Random.getFloat() * 101),
      minTurnoutPct: Math.floor(Random.getFloat() * 101),
    },
    voters: [
      {
        address: "0x1234567890123456789012345678901234567890",
        voteValue: VoteOptions.YES,
        weight: yes
      },
      {
        address: "0x2345678901234567890123456789012345678901",
        voteValue: VoteOptions.NO,
        weight: no
      },
      {
        address: "0x3456789012345678901234567890123456789012",
        voteValue: VoteOptions.ABSTAIN,
        weight: abstain
      }
    ],
  }
}
export function getDummyErc20Proposal(proposalId?: string): Erc20Proposal {

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

  const proposalTitles = [
    "New Founding for Lorex Lab SubDao",
    "Yet another proposal...",
    "Donation so some DAO",
    "Buy more NFTs?",
  ]
  const yes = Math.floor(Random.getFloat() * 1001)
  const no = Math.floor(Random.getFloat() * 1001)
  const abstain = Math.floor(Random.getFloat() * 1001)
  const index = Math.floor(Random.getFloat() * dummyDaoNames.length + 1)
  let address = Random.getFloat() < 0.5 ? "0x1234567890123456789012345678901234567890" : dummyDaoEns[index]

  const dateWithinThisYear = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1)
  ).getTime();

  const startDate = new Date(
    dateWithinThisYear + Random.getFloat() * (Date.now() - dateWithinThisYear)
  );
  const voteId = Math.floor(Random.getFloat() * 101).toString(16)
  return {
    id: proposalId ?? ("0x1234567890123456789012345678901234567890" + '_0x' + voteId),
    daoAddress: address,
    daoName: dummyDaoNames[index],
    startDate,
    endDate: new Date(startDate.getTime() + 7200000),
    creatonDate: new Date(dateWithinThisYear),
    title: proposalTitles[index],
    summary:
      "As most community members know, Aragon has strived to deploy its products to more cost-efficient blockchain networks to facilitate interaction.",
    description: "This is the super important proposal body",
    resources: [{ url: "https://example.com", description: "Example" }],
    creatorAddress: "0x1234567890123456789012345678901234567890",
    status: ProposalStatus.ACTIVE,
    result: {
      yes,
      no,
      abstain,
    },
    config: {
      minParticipationPct: Math.floor(Random.getFloat() * 101),
      minTurnoutPct: Math.floor(Random.getFloat() * 101),
    },
    voters: [
      {
        address: "0x1234567890123456789012345678901234567890",
        voteValue: VoteOptions.YES,
        weight: yes
      },
      {
        address: "0x2345678901234567890123456789012345678901",
        voteValue: VoteOptions.NO,
        weight: no
      },
      {
        address: "0x3456789012345678901234567890123456789012",
        voteValue: VoteOptions.ABSTAIN,
        weight: abstain
      }
    ],
    token: {
      name: 'The Token',
      address: '0x1234567890123456789012345678901234567890',
      symbol: 'TOK',
      decimals: 18
    },
    votingPower: yes + no + abstain,
  }
}

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
  const daoIndex = Math.floor(Random.getFloat() * dummyDaoNames.length + 1)
  let address = Random.getFloat() < 0.5 ? "0x1234567890123456789012345678901234567890" : dummyDaoEns[daoIndex]
  if (addressOrEns) {
    address = addressOrEns
  }

  const fromDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1),
  ).getTime();

  return {
    address,
    name: dummyDaoNames[daoIndex],
    creatonDate: new Date(fromDate + Random.getFloat() * (Date.now() - fromDate)),
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
