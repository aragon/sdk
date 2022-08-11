import { Random } from "@aragon/sdk-common";
import { DaoDetails, DaoDetailsListItem } from "./interfaces/client";
import { ProposalStatus } from "./interfaces/common";
import { Erc20Proposal, AddressListProposal, VoteValues, AddressListProposalListItem, Erc20ProposalListItem } from "./interfaces/plugins";

export function getDummyAddressListProposal(proposalId?: string): AddressListProposal {
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
    dao: {
      address,
      name: dummyDaoNames[index]
    },
    creatorAddress: "0x1234567890123456789012345678901234567890",
    startDate,
    endDate: new Date(startDate.getTime() + 7200000),
    creationDate: new Date(dateWithinThisYear),
    metadata: {
      title: proposalTitles[index],
      summary:
        "As most community members know, Aragon has strived to deploy its products to more cost-efficient blockchain networks to facilitate interaction.",
      description: "This is the super important proposal body",
      resources: [{ url: "https://example.com", name: "Example" }],
      media: {
        logo: 'https://example.com/logo.jpeg',
        header: 'https://example.com/header.jpeg'
      }
    },
    status: ProposalStatus.ACTIVE,
    result: {
      yes,
      no,
      abstain,
    },
    settings: {
      minDuration: Math.floor((Random.getFloat() * 5001) + 5000),
      minSupport: Random.getFloat(),
      minTurnout: Random.getFloat()
    },
    votes: [
      {
        address: "0x1234567890123456789012345678901234567890",
        vote: VoteValues.YES,
      },
      {
        address: "0x2345678901234567890123456789012345678901",
        vote: VoteValues.NO,
      },
      {
        address: "0x3456789012345678901234567890123456789012",
        vote: VoteValues.ABSTAIN,
      },
    ],
    actions: []
  }
}
export function getDummyAddressListProposalListItem(proposalId?: string): AddressListProposalListItem {
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
    dao: {
      address,
      name: dummyDaoNames[index]
    },
    creatorAddress: "0x1234567890123456789012345678901234567890",
    startDate,
    endDate: new Date(startDate.getTime() + 7200000),
    metadata: {
      title: proposalTitles[index],
      summary:
        "As most community members know, Aragon has strived to deploy its products to more cost-efficient blockchain networks to facilitate interaction.",
    },
    status: ProposalStatus.ACTIVE,
    result: {
      yes,
      no,
      abstain,
    },
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
    dao: {
      address,
      name: dummyDaoNames[index]
    },
    creatorAddress: "0x1234567890123456789012345678901234567890",
    startDate,
    endDate: new Date(startDate.getTime() + 7200000),
    creationDate: new Date(dateWithinThisYear),
    metadata: {
      title: proposalTitles[index],
      summary:
        "As most community members know, Aragon has strived to deploy its products to more cost-efficient blockchain networks to facilitate interaction.",
      description: "This is the super important proposal body",
      resources: [{ url: "https://example.com", name: "Example" }],
      media: {
        logo: 'https://example.com/logo.jpeg',
        header: 'https://example.com/header.jpeg'
      }
    },
    status: ProposalStatus.ACTIVE,
    result: {
      yes: BigInt(yes),
      no: BigInt(no),
      abstain: BigInt(abstain),
    },
    settings: {
      minDuration: Math.floor((Random.getFloat() * 5001) + 5000),
      minSupport: Random.getFloat(),
      minTurnout: Random.getFloat()
    },
    votes: [
      {
        address: "0x1234567890123456789012345678901234567890",
        vote: VoteValues.YES,
        weight: BigInt(yes)
      },
      {
        address: "0x2345678901234567890123456789012345678901",
        vote: VoteValues.NO,
        weight: BigInt(no)
      },
      {
        address: "0x3456789012345678901234567890123456789012",
        vote: VoteValues.ABSTAIN,
        weight: BigInt(abstain)
      }
    ],
    token: {
      name: 'The Token',
      address: '0x1234567890123456789012345678901234567890',
      symbol: 'TOK',
      decimals: 18
    },
    usedVotingWeight: BigInt(yes + no + abstain),
    actions: []
  }
}
export function getDummyErc20ProposalListItem(proposalId?: string): Erc20ProposalListItem {
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
    dao: {
      address,
      name: dummyDaoNames[index]
    },
    creatorAddress: "0x1234567890123456789012345678901234567890",
    startDate,
    endDate: new Date(startDate.getTime() + 7200000),
    metadata: {
      title: proposalTitles[index],
      summary:
        "As most community members know, Aragon has strived to deploy its products to more cost-efficient blockchain networks to facilitate interaction.",
    },
    status: ProposalStatus.ACTIVE,
    result: {
      yes: BigInt(yes),
      no: BigInt(no),
      abstain: BigInt(abstain),
    },
    token: {
      name: 'The Token',
      address: '0x1234567890123456789012345678901234567890',
      symbol: 'TOK',
      decimals: 18
    },
  }
}

export function getDummyDao(address?: string): DaoDetails {
  const dummyDaoNames = [
    "Patito Dao",
    "One World Dao",
    "Sparta Dao",
    "Yggdrasil Unite",
  ];
  const dummyDaoEns = [
    "patito.dao.eth",
    "oneworld.dao.eth",
    "spartadao.dao.eth",
    "yggdrasil.dao.eth",
  ];
  const daoIndex = Math.floor(Random.getFloat() * dummyDaoNames.length + 1)

  const fromDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1),
  ).getTime();

  return {
    address: address ?? "0x1234567890123456789012345678901234567890",
    ensDomain: dummyDaoEns[daoIndex],
    metadata: {
      name: dummyDaoNames[daoIndex],
      description: `We are a community that loves trees and the planet. We track where forestation is increasing (or shrinking), fund people who are growing and protecting trees...`,
      avatar: "",
      links: [
        {
          name: "Website",
          url: "https://google.com",
        },
        {
          name: "Discord",
          url: "https://google.com",
        },
      ]
    },
    creationDate: new Date(fromDate + Random.getFloat() * (Date.now() - fromDate)),
    plugins: [
      {
        id: 'addresslistvoting.dao.eth',
        instanceAddress: "0x1234567890123456789012345678901234567890",
        version: "1.0.0"
      },
      {
        id: 'erc20voting.dao.eth',
        instanceAddress: "0x1234567890123456789012345678901234567890",
        version: "1.0.0"
      }
    ]
  }
}
export function getDummyDaoDetailsListItem(address?: string): DaoDetailsListItem {
  const dummyDaoNames = [
    "Patito Dao",
    "One World Dao",
    "Sparta Dao",
    "Yggdrasil Unite",
  ];
  const dummyDaoEns = [
    "patito.dao.eth",
    "oneworld.dao.eth",
    "spartadao.dao.eth",
    "yggdrasil.dao.eth",
  ];
  const daoIndex = Math.floor(Random.getFloat() * dummyDaoNames.length + 1)

  return {
    address: address ?? "0x1234567890123456789012345678901234567890",
    ensDomain: dummyDaoEns[daoIndex],
    metadata: {
      name: dummyDaoNames[daoIndex],
      avatar: "",
    },
    plugins: [
      {
        id: 'addresslistvoting.dao.eth',
        instanceAddress: "0x1234567890123456789012345678901234567890",
        version: "1.0.0"
      },
      {
        id: 'erc20voting.dao.eth',
        instanceAddress: "0x1234567890123456789012345678901234567890",
        version: "1.0.0"
      }
    ]
  }
}
