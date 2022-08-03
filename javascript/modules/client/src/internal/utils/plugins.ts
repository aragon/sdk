import { ProposalStatus } from "../interfaces/common";
import { Erc20Proposal, MultisigProposal, VoteOptions } from "../interfaces/plugins";

export function getERC20ProposalsWithStatus(proposals: Erc20Proposal[]) {
  const now = new Date();

  return proposals.map(proposal => {
    if (proposal.startDate >= now) {
      return { ...proposal, status: ProposalStatus.PENDING };
    } else if (proposal.endDate >= now) {
      return { ...proposal, status: ProposalStatus.ACTIVE };
    } else if (proposal.executed) {
      return { ...proposal, status: ProposalStatus.EXECUTED };
    } else if (
      proposal.result.yea &&
      proposal.result.nay &&
      proposal.result.yea > proposal.result.nay
    ) {
      return { ...proposal, status: ProposalStatus.SUCCEEDED };
    } else {
      return { ...proposal, status: ProposalStatus.DEFEATED };
    }
  });
}
export function getMultisigProposalsWithStatus(proposals: MultisigProposal[]) {
  const now = new Date();

  return proposals.map(proposal => {
    if (proposal.startDate >= now) {
      return { ...proposal, status: ProposalStatus.PENDING };
    } else if (proposal.endDate >= now) {
      return { ...proposal, status: ProposalStatus.ACTIVE };
    } else if (proposal.executed) {
      return { ...proposal, status: ProposalStatus.EXECUTED };
    } else if (
      proposal.result.yea &&
      proposal.result.nay &&
      proposal.result.yea > proposal.result.nay
    ) {
      return { ...proposal, status: ProposalStatus.SUCCEEDED };
    } else {
      return { ...proposal, status: ProposalStatus.DEFEATED };
    }
  });
}

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
  const yea = Math.floor(Math.random() * 1001)
  const nay = Math.floor(Math.random() * 1001)
  const abstain = Math.floor(Math.random() * 1001)
  const index = Math.floor(Math.random() * dummyDaoNames.length + 1)
  let address = Math.random() < 0.5 ? "0x1234567890123456789012345678901234567890" : dummyDaoEns[index]

  const dateWithinThisYear = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1)
  ).getTime();

  const startDate = new Date(
    dateWithinThisYear + Math.random() * (Date.now() - dateWithinThisYear)
  );
  const voteId = Math.floor(Math.random() * 101).toString(16)
  return {
    id: proposalId ?? ("0x1234567890123456789012345678901234567890" + '_0x' + voteId),
    daoAddress: address,
    daoName: dummyDaoNames[index],
    startDate,
    endDate: new Date(startDate.getTime() + 7200000),
    createdAt: new Date(dateWithinThisYear),
    title: proposalTitles[index],
    summary:
      "As most community members know, Aragon has strived to deploy its products to more cost-efficient blockchain networks to facilitate interaction.",
    proposal: "This is the super important proposal body",
    resources: [{ url: "https://example.com", description: "Example" }],
    voteId,
    creator: "0x1234567890123456789012345678901234567890",
    status: ProposalStatus.ACTIVE,
    result: {
      yea,
      nay,
      abstain,
    },
    config: {
      participationRequiredPct: Math.floor(Math.random() * 101),
      supportRequiredPct: Math.floor(Math.random() * 101),
    },
    voters: [
      {
        address: "0x1234567890123456789012345678901234567890",
        voteValue: VoteOptions.YEA,
        weight: yea
      },
      {
        address: "0x2345678901234567890123456789012345678901",
        voteValue: VoteOptions.NAY,
        weight: nay
      },
      {
        address: "0x3456789012345678901234567890123456789012",
        voteValue: VoteOptions.ABSTAIN,
        weight: abstain
      }
    ],
    open: Boolean(Math.round(Math.random())),
    executed: Boolean(Math.round(Math.random()))
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
  const yea = Math.floor(Math.random() * 1001)
  const nay = Math.floor(Math.random() * 1001)
  const abstain = Math.floor(Math.random() * 1001)
  const index = Math.floor(Math.random() * dummyDaoNames.length + 1)
  let address = Math.random() < 0.5 ? "0x1234567890123456789012345678901234567890" : dummyDaoEns[index]

  const dateWithinThisYear = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1)
  ).getTime();

  const startDate = new Date(
    dateWithinThisYear + Math.random() * (Date.now() - dateWithinThisYear)
  );
  const voteId = Math.floor(Math.random() * 101).toString(16)
  return {
    id: proposalId ?? ("0x1234567890123456789012345678901234567890" + '_0x' + voteId),
    daoAddress: address,
    daoName: dummyDaoNames[index],
    startDate,
    endDate: new Date(startDate.getTime() + 7200000),
    createdAt: new Date(dateWithinThisYear),
    title: proposalTitles[index],
    summary:
      "As most community members know, Aragon has strived to deploy its products to more cost-efficient blockchain networks to facilitate interaction.",
    proposal: "This is the super important proposal body",
    resources: [{ url: "https://example.com", description: "Example" }],
    voteId,
    creator: "0x1234567890123456789012345678901234567890",
    status: ProposalStatus.ACTIVE,
    result: {
      yea,
      nay,
      abstain,
    },
    config: {
      participationRequiredPct: Math.floor(Math.random() * 101),
      supportRequiredPct: Math.floor(Math.random() * 101),
    },
    voters: [
      {
        address: "0x1234567890123456789012345678901234567890",
        voteValue: VoteOptions.YEA,
        weight: yea
      },
      {
        address: "0x2345678901234567890123456789012345678901",
        voteValue: VoteOptions.NAY,
        weight: nay
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
    votingPower: yea + nay + abstain,
    open: Boolean(Math.round(Math.random())),
    executed: Boolean(Math.round(Math.random()))
  }
}

export function getRandomInteger(min: number, max: number): number {
  return Math.round(Math.random() * (max - min + 1) + min)
}