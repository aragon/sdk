// mocks need to be at the top of the imports
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";
import * as mockedGraphqlRequest from "../../mocks/graphql-request";

import {
  CanVoteParams,
  Client,
  CreateMajorityVotingProposalParams,
  DelegateTokensStep,
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
  ExecuteProposalStep,
  ProposalCreationSteps,
  ProposalQueryParams,
  ProposalSortBy,
  SetAllowanceSteps,
  SubgraphVoteValues,
  TokenVotingClient,
  TokenVotingMember,
  TokenVotingPluginPrepareInstallationParams,
  TokenVotingProposal,
  UndelegateTokensStep,
  UnwrapTokensStep,
  VoteProposalParams,
  VoteProposalStep,
  VoteValues,
  VotingMode,
  WrapTokensStep,
} from "../../../src";
import * as ganacheSetup from "../../helpers/ganache-setup";
import * as deployContracts from "../../helpers/deployContracts";

import {
  getExtendedProposalId,
  InvalidAddressOrEnsError,
} from "@aragon/sdk-common";
import {
  ADDRESS_FOUR,
  ADDRESS_ONE,
  ADDRESS_THREE,
  ADDRESS_TWO,
  contextParamsLocalChain,
  SUBGRAPH_ACTIONS,
  SUBGRAPH_PROPOSAL_BASE,
  TEST_INVALID_ADDRESS,
  TEST_NON_EXISTING_ADDRESS,
  TEST_TOKEN_VOTING_PROPOSAL_ID,
  TEST_TX_HASH,
  TEST_WALLET_ADDRESS,
} from "../constants";
import { Server } from "ganache";
import {
  buildExistingTokenVotingDAO,
  buildTokenVotingDAO,
} from "../../helpers/build-daos";
import {
  mineBlock,
  mineBlockWithTimeOffset,
  restoreBlockTime,
} from "../../helpers/block-times";
import { JsonRpcProvider } from "@ethersproject/providers";
import {
  QueryTokenVotingMembers,
  QueryTokenVotingPlugin,
  QueryTokenVotingProposal,
  QueryTokenVotingProposals,
  QueryTokenVotingSettings,
} from "../../../src/tokenVoting/internal/graphql-queries";
import {
  SubgraphContractType,
  SubgraphErc20WrapperToken,
  SubgraphTokenVotingMember,
  SubgraphTokenVotingProposal,
  SubgraphTokenVotingProposalListItem,
} from "../../../src/tokenVoting/internal/types";
import { deployErc20 } from "../../helpers/deploy-erc20";
import {
  GovernanceERC20__factory,
  GovernanceWrappedERC20__factory,
  TokenVoting__factory,
} from "@aragon/osx-ethers";
import { BigNumber } from "@ethersproject/bignumber";
import {
  Context,
  PrepareInstallationStep,
  ProposalMetadata,
  ProposalStatus,
  SortDirection,
  TokenType,
} from "@aragon/sdk-client-common";

describe("Token Voting Client", () => {
  let server: Server;
  let deployment: deployContracts.Deployment;
  let repoAddr: string;
  let provider: JsonRpcProvider;

  beforeAll(async () => {
    server = await ganacheSetup.start();
    deployment = await deployContracts.deploy();

    contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
    contextParamsLocalChain.pluginSetupProcessorAddress =
      deployment.pluginSetupProcessor.address;
    contextParamsLocalChain.multisigRepoAddress =
      deployment.multisigRepo.address;
    contextParamsLocalChain.adminRepoAddress = "";
    contextParamsLocalChain.addresslistVotingRepoAddress =
      deployment.addresslistVotingRepo.address;
    contextParamsLocalChain.tokenVotingRepoAddress =
      deployment.tokenVotingRepo.address;
    contextParamsLocalChain.multisigSetupAddress =
      deployment.multisigPluginSetup.address;
    contextParamsLocalChain.adminSetupAddress = "";
    contextParamsLocalChain.addresslistVotingSetupAddress =
      deployment.addresslistVotingPluginSetup.address;
    contextParamsLocalChain.tokenVotingSetupAddress =
      deployment.tokenVotingPluginSetup.address;
    contextParamsLocalChain.ensRegistryAddress = deployment.ensRegistry.address;
    repoAddr = deployment.tokenVotingRepo.address;

    if (Array.isArray(contextParamsLocalChain.web3Providers)) {
      provider = new JsonRpcProvider(
        contextParamsLocalChain.web3Providers[0] as string,
      );
    } else {
      provider = new JsonRpcProvider(
        contextParamsLocalChain.web3Providers as any,
      );
    }
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    return restoreBlockTime(provider);
  });

  // Helpers
  async function buildDaos() {
    const daoEntries: Array<{ dao: string; plugin: string }> = [];
    daoEntries.push(await buildTokenVotingDAO(repoAddr, VotingMode.STANDARD));
    daoEntries.push(
      await buildTokenVotingDAO(repoAddr, VotingMode.EARLY_EXECUTION),
    );
    daoEntries.push(
      await buildTokenVotingDAO(repoAddr, VotingMode.VOTE_REPLACEMENT),
    );
    return daoEntries;
  }

  async function buildProposal(
    pluginAddress: string,
    client: TokenVotingClient,
  ) {
    // generate actions
    const action = client.encoding.updatePluginSettingsAction(pluginAddress, {
      votingMode: VotingMode.VOTE_REPLACEMENT,
      supportThreshold: 0.5,
      minParticipation: 0.5,
      minDuration: 7200,
    });

    const metadata: ProposalMetadata = {
      title: "Best Proposal",
      summary: "this is the sumnary",
      description: "This is a very long description",
      resources: [
        {
          name: "Website",
          url: "https://the.website",
        },
      ],
      media: {
        header: "https://no.media/media.jpeg",
        logo: "https://no.media/media.jpeg",
      },
    };

    const ipfsUri = await client.methods.pinMetadata(metadata);
    const endDate = new Date(Date.now() + 60 * 60 * 1000 + 10 * 1000);

    const proposalParams: CreateMajorityVotingProposalParams = {
      pluginAddress,
      metadataUri: ipfsUri,
      actions: [action],
      executeOnPass: false,
      endDate,
    };

    for await (const step of client.methods.createProposal(proposalParams)) {
      switch (step.key) {
        case ProposalCreationSteps.CREATING:
          expect(typeof step.txHash).toBe("string");
          expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
          break;
        case ProposalCreationSteps.DONE:
          expect(typeof step.proposalId).toBe("string");
          expect(step.proposalId).toMatch(
            /^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/,
          );
          return step.proposalId;
        default:
          throw new Error(
            "Unexpected proposal creation step: " +
              Object.keys(step).join(", "),
          );
      }
    }
    throw new Error();
  }

  async function voteProposal(
    proposalId: string,
    client: TokenVotingClient,
    voteValue: VoteValues = VoteValues.YES,
  ) {
    const voteParams: VoteProposalParams = {
      proposalId,
      vote: voteValue,
    };
    for await (const step of client.methods.voteProposal(voteParams)) {
      switch (step.key) {
        case VoteProposalStep.VOTING:
          expect(typeof step.txHash).toBe("string");
          expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
          break;
        case VoteProposalStep.DONE:
          break;
        default:
          throw new Error(
            "Unexpected vote proposal step: " + Object.keys(step).join(", "),
          );
      }
    }
  }

  describe("Client instances", () => {
    describe("Proposal Creation", () => {
      it("Should create a new proposal locally", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);

        const daoEntries = await buildDaos();

        for (const daoEntry of daoEntries) {
          const { plugin: pluginAddress } = daoEntry;
          if (!pluginAddress) {
            throw new Error("No plugin installed");
          }

          const proposalId = await buildProposal(pluginAddress, client);
          expect(typeof proposalId).toBe("string");
          expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);
        }
      });
    });

    describe("Existing Token Dao", () => {
      it("Should deploy a token day with an existing token and wrap and unwrap the token used", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new Client(ctx);
        const pluginClient = new TokenVotingClient(ctx);
        const erc20 = await deployErc20();
        const dao = await buildExistingTokenVotingDAO(
          repoAddr,
          erc20.address,
          VotingMode.STANDARD,
        );
        const balance = await erc20.balanceOf(TEST_WALLET_ADDRESS) as BigNumber;
        expect(balance.gte(BigNumber.from(0))).toBe(true);
        const signer = client.web3.getConnectedSigner();
        const pluginContract = TokenVoting__factory.connect(dao.plugin, signer);
        const tokenAddress = await pluginContract.getVotingToken();
        const wrappetTokenContract = GovernanceWrappedERC20__factory.connect(
          tokenAddress,
          signer,
        );
        const wrappedBalance = await wrappetTokenContract.balanceOf(
          TEST_WALLET_ADDRESS,
        );
        expect(wrappedBalance.eq(BigNumber.from(0))).toBe(true);
        // update allowance
        const updateAllowanceSteps = client.methods.setAllowance({
          spender: tokenAddress,
          tokenAddress: erc20.address,
          amount: balance.toBigInt(),
        });
        for await (const step of updateAllowanceSteps) {
          switch (step.key) {
            case SetAllowanceSteps.SETTING_ALLOWANCE:
              break;
            case SetAllowanceSteps.ALLOWANCE_SET:
              expect(BigNumber.from(step.allowance).eq(balance)).toBe(
                true,
              );
              break;
            default:
              throw new Error("Unrecognized state");
          }
        }
        // wrap tokens
        const wrappingSteps = pluginClient.methods.wrapTokens({
          wrappedTokenAddress: tokenAddress,
          amount: balance.toBigInt(),
        });

        for await (const step of wrappingSteps) {
          switch (step.key) {
            case WrapTokensStep.WRAPPING:
              expect(typeof step.txHash).toBe("string");
              expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
              break;
            case WrapTokensStep.DONE:
              break;
            default:
              throw new Error("Unrecognized state");
          }
        }

        const balanceAfterWrap = await erc20.balanceOf(
          TEST_WALLET_ADDRESS,
        ) as BigNumber;
        expect(balanceAfterWrap.eq(BigNumber.from(0))).toBe(true);
        const wrappedBalanceAfterWrap = await wrappetTokenContract.balanceOf(
          TEST_WALLET_ADDRESS,
        );
        expect(wrappedBalanceAfterWrap.eq(balance)).toBe(true);
        const unwrappingSteps = pluginClient.methods.unwrapTokens({
          wrappedTokenAddress: tokenAddress,
          amount: wrappedBalanceAfterWrap.toBigInt(),
        });
        for await (const step of unwrappingSteps) {
          switch (step.key) {
            case UnwrapTokensStep.UNWRAPPING:
              expect(typeof step.txHash).toBe("string");
              expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
              break;
            case UnwrapTokensStep.DONE:
              break;
            default:
              throw new Error("Unrecognized state");
          }
        }
        const balanceAfterUnwrap = await erc20.balanceOf(
          TEST_WALLET_ADDRESS,
        ) as BigNumber;
        expect(balanceAfterUnwrap.eq(balance)).toBe(true);
        const wrappedBalanceAfterunWrap = await wrappetTokenContract.balanceOf(
          TEST_WALLET_ADDRESS,
        );
        expect(wrappedBalanceAfterunWrap.eq(BigNumber.from(0))).toBe(true);
      });
    });

    describe("Can vote", () => {
      it("Should check if an user can vote in a TokenVoting proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);

        const daoEntries = await buildDaos();

        for (const daoEntry of daoEntries) {
          const { plugin: pluginAddress } = daoEntry;
          if (!pluginAddress) {
            throw new Error("No plugin installed");
          }

          const proposalId = await buildProposal(pluginAddress, client);
          expect(typeof proposalId).toBe("string");
          expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

          const params: CanVoteParams = {
            voterAddressOrEns: TEST_WALLET_ADDRESS,
            proposalId,
            vote: VoteValues.YES,
          };
          const canVote = await client.methods.canVote(params);
          expect(typeof canVote).toBe("boolean");
          expect(canVote).toBe(true);
        }
      });
    });

    describe("Vote on a proposal", () => {
      it("Should vote on a proposal locally", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);

        const daoEntries = await buildDaos();

        for (const daoEntry of daoEntries) {
          const { plugin: pluginAddress } = daoEntry;
          if (!pluginAddress) {
            throw new Error("No plugin installed");
          }

          const proposalId = await buildProposal(pluginAddress, client);
          expect(typeof proposalId).toBe("string");
          expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

          // Vote
          await voteProposal(proposalId, client);
        }
      });

      it("Should replace a vote on a proposal locally", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.VOTE_REPLACEMENT,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("string");
        expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

        // Vote
        await voteProposal(proposalId, client, VoteValues.NO);
        await mineBlock(provider);
        await voteProposal(proposalId, client, VoteValues.YES);
      });
    });

    describe("Plugin installation", () => {
      it("Should prepare the installation of tokenVoting plugin", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);
        const { dao } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.VOTE_REPLACEMENT,
        );
        const installationParams: TokenVotingPluginPrepareInstallationParams = {
          settings: {
            votingSettings: {
              supportThreshold: 0.5,
              minParticipation: 0.5,
              minDuration: 7200,
              minProposerVotingPower: BigInt(1),
              votingMode: VotingMode.STANDARD,
            },
            newToken: {
              name: "test",
              decimals: 18,
              symbol: "TST",
              balances: [
                {
                  address: TEST_WALLET_ADDRESS,
                  balance: BigInt(10),
                },
              ],
            },
          },
          daoAddressOrEns: dao,
        };
        const steps = client.methods.prepareInstallation(installationParams);
        for await (const step of steps) {
          switch (step.key) {
            case PrepareInstallationStep.PREPARING:
              expect(typeof step.txHash).toBe("string");
              expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
              break;
            case PrepareInstallationStep.DONE:
              expect(typeof step.pluginAddress).toBe("string");
              expect(step.pluginAddress).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
              expect(typeof step.pluginRepo).toBe("string");
              expect(step.pluginRepo).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
              expect(Array.isArray(step.helpers)).toBe(true);
              for (const helper of step.helpers) {
                expect(typeof helper).toBe("string");
              }
              expect(Array.isArray(step.permissions)).toBe(true);
              for (const permission of step.permissions) {
                expect(typeof permission.condition).toBe("string");
                if (permission.condition) {
                  expect(permission.condition).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
                }
                expect(typeof permission.operation).toBe("number");
                expect(typeof permission.where).toBe("string");
                expect(permission.where).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
                expect(typeof permission.who).toBe("string");
                expect(permission.who).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
              }
              expect(typeof step.versionTag.build).toBe("number");
              expect(typeof step.versionTag.release).toBe("number");
              break;
          }
        }
      });
    });

    describe("Can execute", () => {
      it("Should check if an user can execute a standard voting proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.STANDARD,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("string");
        expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

        let canExecute = await client.methods.canExecute(proposalId);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(false);

        // now approve
        await voteProposal(proposalId, client);
        // Force date past end
        await mineBlockWithTimeOffset(provider, 2 * 60 * 60);

        canExecute = await client.methods.canExecute(proposalId);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(true);
      });

      it("Should check if an user can execute an early execution proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.EARLY_EXECUTION,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("string");
        expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

        let canExecute = await client.methods.canExecute(proposalId);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(false);

        // now approve
        await voteProposal(proposalId, client);
        // No waiting

        canExecute = await client.methods.canExecute(proposalId);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(true);
      });

      it("Should check if an user can execute a vote replacement proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.VOTE_REPLACEMENT,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("string");
        expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

        let canExecute = await client.methods.canExecute(proposalId);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(false);

        // vote no
        await voteProposal(proposalId, client, VoteValues.NO);

        canExecute = await client.methods.canExecute(proposalId);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(false);

        // now approve
        await voteProposal(proposalId, client, VoteValues.YES);

        // Force date past end
        await mineBlockWithTimeOffset(provider, 2 * 60 * 60);

        canExecute = await client.methods.canExecute(proposalId);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(true);
      });
    });

    describe("Execute proposal", () => {
      it("Should execute a standard voting proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.STANDARD,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("string");
        expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

        // Vote
        await voteProposal(proposalId, client);
        // Force date past end
        await mineBlockWithTimeOffset(provider, 2 * 60 * 60);

        // Execute
        for await (
          const step of client.methods.executeProposal(
            proposalId,
          )
        ) {
          switch (step.key) {
            case ExecuteProposalStep.EXECUTING:
              expect(typeof step.txHash).toBe("string");
              expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
              break;
            case ExecuteProposalStep.DONE:
              break;
            default:
              throw new Error(
                "Unexpected execute proposal step: " +
                  Object.keys(step).join(", "),
              );
          }
        }
      });

      it("Should execute an early execution proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.EARLY_EXECUTION,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("string");
        expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

        // Vote
        await voteProposal(proposalId, client);
        // No waiting here

        // Execute
        for await (
          const step of client.methods.executeProposal(
            proposalId,
          )
        ) {
          switch (step.key) {
            case ExecuteProposalStep.EXECUTING:
              expect(typeof step.txHash).toBe("string");
              expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
              break;
            case ExecuteProposalStep.DONE:
              break;
            default:
              throw new Error(
                "Unexpected execute proposal step: " +
                  Object.keys(step).join(", "),
              );
          }
        }
      });

      it("Should execute a vote replacement proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.VOTE_REPLACEMENT,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("string");
        expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

        // Vote
        await voteProposal(proposalId, client, VoteValues.NO);
        await mineBlock(provider);
        await voteProposal(proposalId, client, VoteValues.YES);
        // Force date past end
        await mineBlockWithTimeOffset(provider, 2 * 60 * 60);

        // Execute
        for await (
          const step of client.methods.executeProposal(
            proposalId,
          )
        ) {
          switch (step.key) {
            case ExecuteProposalStep.EXECUTING:
              expect(typeof step.txHash).toBe("string");
              expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
              break;
            case ExecuteProposalStep.DONE:
              break;
            default:
              throw new Error(
                "Unexpected execute proposal step: " +
                  Object.keys(step).join(", "),
              );
          }
        }
      });
    });
    it("Should delegate tokens to another address and undelegate them afterwards", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);
      const { tokenAddress } = await buildTokenVotingDAO(
        repoAddr,
        VotingMode.VOTE_REPLACEMENT,
      );

      const delegateSteps = client.methods.delegateTokens({
        tokenAddress,
        delegatee: ADDRESS_ONE,
      });

      for await (const step of delegateSteps) {
        switch (step.key) {
          case DelegateTokensStep.DELEGATING:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case DelegateTokensStep.DONE:
            break;
          default:
            throw new Error(
              "Unexpected delegate tokens step: " +
                Object.keys(step).join(", "),
            );
        }
      }
      const signer = client.web3.getConnectedSigner();
      const erc20Contract = GovernanceERC20__factory.connect(
        tokenAddress,
        signer,
      );

      let delegatee = await client.methods.getDelegatee(tokenAddress);
      const balance = await erc20Contract.balanceOf(TEST_WALLET_ADDRESS);
      expect(delegatee).toBe(ADDRESS_ONE);
      expect(balance.eq(100)).toBe(true);

      const undelegateSteps = client.methods.undelegateTokens(
        tokenAddress,
      );

      for await (const step of undelegateSteps) {
        switch (step.key) {
          case UndelegateTokensStep.UNDELEGATING:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case UndelegateTokensStep.DONE:
            break;
          default:
            throw new Error(
              "Unexpected delegate tokens step: " +
                Object.keys(step).join(", "),
            );
        }
      }
      delegatee = await client.methods.getDelegatee(tokenAddress);
      expect(delegatee).toBe(null);
    });
    describe("Data retrieval", () => {
      it("Should get the list of members that can vote in a proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);

        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );
        const subgraphMembers: SubgraphTokenVotingMember[] = [
          {
            balance: "100",
            address: ADDRESS_ONE,
            delegatee: {
              address: ADDRESS_TWO,
            },
            votingPower: "0",
            delegators: [],
          },
          {
            address: ADDRESS_TWO,
            balance: "200",
            votingPower: "300",
            delegatee: {
              address: ADDRESS_TWO,
            },
            delegators: [
              {
                address: ADDRESS_ONE,
                balance: "100",
              },
            ],
          },
          {
            address: ADDRESS_THREE,
            balance: "300",
            votingPower: "300",
            delegatee: {
              address: ADDRESS_THREE,
            },
            delegators: [
              {
                address: ADDRESS_THREE,
                balance: "300",
              },
            ],
          },
        ];
        mockedClient.request.mockResolvedValueOnce({
          tokenVotingPlugin: {
            members: subgraphMembers,
          },
        });
        const members = await client.methods.getMembers(
          ADDRESS_ONE,
        );
        const expectedMembers: TokenVotingMember[] = [
          {
            address: ADDRESS_ONE,
            balance: BigInt(100),
            votingPower: BigInt(0),
            delegatee: ADDRESS_TWO,
            delegators: [],
          },
          {
            address: ADDRESS_TWO,
            balance: BigInt(200),
            votingPower: BigInt(300),
            delegatee: null,
            delegators: [{ address: ADDRESS_ONE, balance: BigInt(100) }],
          },
          {
            address: ADDRESS_THREE,
            balance: BigInt(300),
            votingPower: BigInt(300),
            delegatee: null,
            delegators: [],
          },
        ];

        expect(members.length).toBe(3);
        expect(members).toMatchObject(expectedMembers);

        expect(mockedClient.request).toHaveBeenCalledWith(
          QueryTokenVotingMembers,
          { address: ADDRESS_ONE, block: null },
        );
      });
      it("Should fetch the given proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);

        const ipfsMetadata = {
          title: "Title",
          summary: "Summary",
          description: "Description",
          resources: [{
            name: "Name",
            url: "URL",
          }],
          media: [{ header: "Header", logo: "Logo" }],
        };
        mockedIPFSClient.cat.mockResolvedValue(
          Buffer.from(
            JSON.stringify(ipfsMetadata),
          ),
        );
        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );

        const subgraphProposal: SubgraphTokenVotingProposal = {
          createdAt: Math.round(Date.now() / 1000).toString(),
          actions: SUBGRAPH_ACTIONS,
          supportThreshold: "1000000",
          totalVotingPower: "3000000",
          votingMode: VotingMode.EARLY_EXECUTION,
          creationBlockNumber: "40",
          executionDate: Math.round(Date.now() / 1000).toString(),
          executionBlockNumber: "50",
          executionTxHash: TEST_TX_HASH,
          earlyExecutable: false,
          plugin: {
            token: {
              decimals: 18,
              __typename: SubgraphContractType.ERC20,
              id: ADDRESS_THREE,
              name: "Test",
              symbol: "TST",
            },
          },
          minVotingPower: BigInt(5000),
          voters: [{
            voter: {
              address: ADDRESS_ONE,
            },
            voteOption: SubgraphVoteValues.YES,
            voteReplaced: false,
            votingPower: "500",
          }],
          ...SUBGRAPH_PROPOSAL_BASE,
        };

        mockedClient.request.mockResolvedValueOnce({
          tokenVotingProposal: subgraphProposal,
        });
        const proposalId = TEST_TOKEN_VOTING_PROPOSAL_ID;
        const proposal = await client.methods.getProposal(
          proposalId,
        ) as TokenVotingProposal;

        expect(proposal).not.toBe(null);

        expect(proposal.id).toBe(subgraphProposal.id);
        expect(proposal.dao.address).toBe(subgraphProposal.dao.id);
        expect(proposal.dao.name).toBe(subgraphProposal.dao.subdomain);
        expect(proposal.creatorAddress).toBe(subgraphProposal.creator);
        // check metadata
        expect(proposal.metadata.title).toBe(ipfsMetadata.title);
        expect(proposal.metadata.summary).toBe(ipfsMetadata.summary);
        expect(proposal.metadata.description).toBe(ipfsMetadata.description);
        expect(proposal.metadata.resources).toMatchObject(
          ipfsMetadata.resources,
        );
        expect(proposal.metadata.media).toMatchObject(ipfsMetadata.media);

        expect(proposal.status).toBe("Defeated");
        expect(proposal.startDate instanceof Date).toBe(true);
        expect(proposal.startDate.getTime()).toBe(
          parseInt(subgraphProposal.startDate) * 1000,
        );
        expect(proposal.endDate instanceof Date).toBe(true);
        expect(proposal.endDate.getTime()).toBe(
          parseInt(subgraphProposal.endDate) * 1000,
        );
        expect(proposal.creationDate instanceof Date).toBe(true);
        expect(proposal.creationDate.getTime()).toBe(
          parseInt(subgraphProposal.createdAt) * 1000,
        );
        expect(proposal.actions).toMatchObject(proposal.actions);
        // result
        expect(proposal.result.yes).toBe(BigInt(subgraphProposal.yes));
        expect(proposal.result.no).toBe(BigInt(subgraphProposal.no));
        expect(proposal.result.abstain).toBe(
          BigInt(subgraphProposal.abstain),
        );
        // setttings
        expect(proposal.settings.duration).toBe(
          parseInt(subgraphProposal.endDate) -
            parseInt(subgraphProposal.startDate),
        );
        expect(proposal.settings.supportThreshold).toBe(1);
        expect(proposal.settings.minParticipation).toBe(0.001666);
        // token
        expect(proposal.totalVotingWeight).toBe(
          BigInt(subgraphProposal.totalVotingPower),
        );
        expect(proposal.votes[0]).toMatchObject({
          vote: 2,
          voteReplaced: subgraphProposal.voters[0].voteReplaced,
          address: subgraphProposal.voters[0].voter.address,
        });
        expect(proposal.executionTxHash).toMatch(
          subgraphProposal.executionTxHash,
        );
        expect(proposal.executionDate?.getTime()).toBe(
          parseInt(subgraphProposal.executionDate) * 1000,
        );
        expect(proposal.executionBlockNumber).toBe(
          parseInt(subgraphProposal.executionBlockNumber),
        );

        expect(proposal.token?.address).toBe(ADDRESS_THREE);
        expect(proposal.token?.name).toBe("Test");
        expect(proposal.token?.symbol).toBe("TST");
        expect(proposal.token?.type).toBe(TokenType.ERC20);
        expect((proposal.token as Erc20TokenDetails).decimals).toBe(18);

        // check function call
        expect(mockedClient.request).lastCalledWith(
          QueryTokenVotingProposal,
          {
            proposalId: getExtendedProposalId(proposalId),
          },
        );
      });
      it("Should fetch the given proposal and fail because the proposal does not exist", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);

        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );

        mockedClient.request.mockResolvedValueOnce({
          tokenVotingProposal: null,
        });

        const proposalId = TEST_NON_EXISTING_ADDRESS + "_0x0";
        const proposal = await client.methods.getProposal(proposalId);

        expect(proposal === null).toBe(true);
        // check function calls
        expect(mockedClient.request).lastCalledWith(
          QueryTokenVotingProposal,
          {
            proposalId: getExtendedProposalId(proposalId),
          },
        );
      });
      it("Should get a list of proposals filtered by the given criteria", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);
        const limit = 5;
        const status = ProposalStatus.DEFEATED;
        const params: ProposalQueryParams = {
          limit,
          sortBy: ProposalSortBy.CREATED_AT,
          direction: SortDirection.ASC,
          status,
        };
        const ipfsMetadata = {
          title: "Title",
          summary: "Summary",
          description: "Description",
          resources: [{
            name: "Name",
            url: "URL",
          }],
          media: [{ header: "Header", logo: "Logo" }],
        };

        const defaultCatImplementation = mockedIPFSClient.cat
          .getMockImplementation();
        mockedIPFSClient.cat.mockResolvedValue(
          Buffer.from(
            JSON.stringify(ipfsMetadata),
          ),
        );

        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );

        const subgraphProposals: SubgraphTokenVotingProposalListItem[] = [
          {
            plugin: {
              token: {
                id: ADDRESS_THREE,
                symbol: "TST",
                name: "Test",
                decimals: 18,
                __typename: SubgraphContractType.ERC20,
              },
            },
            supportThreshold: "50000",
            totalVotingPower: "5000",
            minVotingPower: BigInt("50"),
            voters: [{
              voter: {
                address: ADDRESS_ONE,
              },
              voteOption: SubgraphVoteValues.YES,
              voteReplaced: false,
              votingPower: "500",
            }],
            votingMode: VotingMode.STANDARD,
            earlyExecutable: false,
            ...SUBGRAPH_PROPOSAL_BASE,
          },
          {
            plugin: {
              token: {
                id: ADDRESS_THREE,
                symbol: "TST",
                name: "Test",
                decimals: 18,
                __typename: SubgraphContractType.ERC20_WRAPPER,
                underlyingToken: {
                  id: ADDRESS_FOUR,
                  symbol: "TST",
                  name: "Test",
                  decimals: 18,
                  __typename: SubgraphContractType.ERC20,
                },
              },
            },
            supportThreshold: "50000",
            totalVotingPower: "5000",
            minVotingPower: BigInt("50"),
            voters: [{
              voter: {
                address: ADDRESS_ONE,
              },
              voteOption: SubgraphVoteValues.YES,
              voteReplaced: false,
              votingPower: "500",
            }],
            votingMode: VotingMode.STANDARD,
            earlyExecutable: false,
            ...SUBGRAPH_PROPOSAL_BASE,
          },
        ];

        mockedClient.request.mockResolvedValueOnce({
          tokenVotingProposals: subgraphProposals,
        });
        const dateGetTimeSpy = jest.spyOn(Date.prototype, "getTime");
        const now = Date.now();
        const nowFilter = Math.round(now / 1000).toString();
        dateGetTimeSpy.mockReturnValueOnce(now);
        const proposals = await client.methods.getProposals(params);
        dateGetTimeSpy.mockRestore();

        expect(Array.isArray(proposals)).toBe(true);
        expect(proposals.length).toBe(2);
        for (const [index, proposal] of proposals.entries()) {
          expect(proposal.id).toBe(subgraphProposals[index].id);
          expect(proposal.dao.address).toBe(subgraphProposals[index].dao.id);
          expect(proposal.dao.name).toBe(
            subgraphProposals[index].dao.subdomain,
          );
          expect(proposal.creatorAddress).toBe(
            subgraphProposals[index].creator,
          );
          expect(proposal.metadata.title).toBe(ipfsMetadata.title);
          expect(proposal.metadata.summary).toBe(ipfsMetadata.summary);
          expect(proposal.startDate.getTime()).toBe(
            parseInt(subgraphProposals[index].startDate) * 1000,
          );
          expect(proposal.endDate.getTime()).toBe(
            parseInt(subgraphProposals[index].endDate) * 1000,
          );
          expect(proposal.status).toBe("Defeated");
          // result
          expect(proposal.result.yes).toBe(
            BigInt(subgraphProposals[index].yes),
          );
          expect(proposal.result.no).toBe(
            BigInt(subgraphProposals[index].no),
          );
          expect(proposal.result.abstain).toBe(
            BigInt(subgraphProposals[index].abstain),
          );
          expect(proposal.token?.address).toBe(
            subgraphProposals[index].plugin.token.id,
          );
          expect(proposal.token?.name).toBe(
            subgraphProposals[index].plugin.token.name,
          );
          expect(proposal.token?.symbol).toBe(
            subgraphProposals[index].plugin.token.symbol,
          );
          if (
            subgraphProposals[index].plugin.token.__typename ===
              SubgraphContractType.ERC20
          ) {
            expect(proposal.token?.type).toBe(TokenType.ERC20);
            expect((proposal.token as Erc20TokenDetails).decimals).toBe(18);
          }
          if (
            subgraphProposals[index].plugin.token.__typename ===
              SubgraphContractType.ERC20_WRAPPER
          ) {
            expect(proposal.token?.type).toBe(TokenType.ERC20);
            expect((proposal.token as Erc20WrapperTokenDetails).decimals).toBe(
              18,
            );
            const token = subgraphProposals[index].plugin
              .token as SubgraphErc20WrapperToken;
            expect((proposal.token as Erc20WrapperTokenDetails).underlyingToken)
              .toMatchObject({
                address: token.underlyingToken.id,
                name: token.underlyingToken.name,
                symbol: token.underlyingToken.symbol,
                type: TokenType.ERC20,
              });
          }
          expect(proposal.totalVotingWeight).toBe(
            BigInt(subgraphProposals[index].totalVotingPower),
          );
          expect(proposal.votes[0]).toMatchObject({
            vote: 2,
            voteReplaced: subgraphProposals[index].voters[0].voteReplaced,
            address: subgraphProposals[index].voters[0].voter.address,
          });
        }

        expect(mockedClient.request).toHaveBeenCalledWith(
          QueryTokenVotingProposals,
          {
            where: {
              potentiallyExecutable: false,
              endDate_lt: nowFilter,
              executed: false,
            },
            skip: 0,
            limit: params.limit,
            direction: params.direction,
            sortBy: params.sortBy,
          },
        );

        mockedIPFSClient.cat.mockImplementation(defaultCatImplementation);
      });
      it("Should get a list of proposals from a specific dao", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);
        const limit = 5;
        const address = ADDRESS_ONE;
        const params: ProposalQueryParams = {
          limit,
          sortBy: ProposalSortBy.CREATED_AT,
          direction: SortDirection.ASC,
          daoAddressOrEns: address,
        };

        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );

        mockedClient.request.mockResolvedValueOnce({
          tokenVotingProposals: [],
        });

        await client.methods.getProposals(params);

        expect(mockedClient.request).toHaveBeenCalledWith(
          QueryTokenVotingProposals,
          {
            where: {
              dao: params.daoAddressOrEns,
            },
            skip: 0,
            limit: params.limit,
            direction: params.direction,
            sortBy: params.sortBy,
          },
        );
      });
      it("Should get a list of proposals from a dao that has no proposals", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);
        const limit = 5;
        const address = TEST_NON_EXISTING_ADDRESS;
        const params: ProposalQueryParams = {
          limit,
          sortBy: ProposalSortBy.CREATED_AT,
          direction: SortDirection.ASC,
          daoAddressOrEns: address,
        };
        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );

        mockedClient.request.mockResolvedValueOnce({
          tokenVotingProposals: [],
        });
        const proposals = await client.methods.getProposals(params);

        expect(Array.isArray(proposals)).toBe(true);
        expect(proposals.length === 0).toBe(true);
      });
      it("Should get a list of proposals from an invalid address", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);
        const limit = 5;
        const address = TEST_INVALID_ADDRESS;
        const params: ProposalQueryParams = {
          limit,
          sortBy: ProposalSortBy.CREATED_AT,
          direction: SortDirection.ASC,
          daoAddressOrEns: address,
        };
        await expect(() => client.methods.getProposals(params)).rejects.toThrow(
          new InvalidAddressOrEnsError(),
        );
      });
      it("Should get the settings of a plugin given a plugin instance address", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);
        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );

        mockedClient.request.mockResolvedValueOnce({
          tokenVotingPlugin: {
            minDuration: "10",
            minProposerVotingPower: "20",
            minParticipation: "300000",
            supportThreshold: "400000",
            votingMode: VotingMode.STANDARD,
          },
        });
        const pluginAddress: string = ADDRESS_ONE;
        const settings = await client.methods.getVotingSettings(pluginAddress);
        expect(settings === null).toBe(false);
        if (settings) {
          expect(settings.minDuration).toBe(10);
          expect(settings.minParticipation).toBe(0.3);
          expect(settings.supportThreshold).toBe(0.4);
          expect(settings.minProposerVotingPower).toBe(BigInt(20));
          expect(settings.votingMode).toBe(VotingMode.STANDARD);
        }
        expect(mockedClient.request).toHaveBeenCalledWith(
          QueryTokenVotingSettings,
          { address: pluginAddress, block: null },
        );
      });
      it("Should get the token details of a plugin given a plugin instance address", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);
        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );
        mockedClient.request.mockResolvedValueOnce({
          tokenVotingPlugin: {
            token: {
              id: ADDRESS_THREE,
              name: "test",
              symbol: "TST",
              __typename: SubgraphContractType.ERC20,
              decimals: 18,
            },
          },
        });

        const pluginAddress: string = ADDRESS_ONE;
        const token = await client.methods.getToken(pluginAddress);
        expect(token?.address).toBe(ADDRESS_THREE);
        expect(token?.symbol).toBe("TST");
        expect(token?.name).toBe("test");
        expect((token as Erc20TokenDetails).decimals).toBe(18);

        expect(mockedClient.request).toHaveBeenCalledWith(
          QueryTokenVotingPlugin,
          {
            address: pluginAddress,
          },
        );
      });
      it("Should get the token details of a plugin given a plugin instance address with a wrapped token", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);
        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );
        mockedClient.request.mockResolvedValueOnce({
          tokenVotingPlugin: {
            token: {
              id: ADDRESS_THREE,
              name: "Wrapped Test",
              symbol: "WTST",
              decimals: 18,
              __typename: SubgraphContractType.ERC20_WRAPPER,
              underlyingToken: {
                id: ADDRESS_TWO,
                name: "Test",
                symbol: "TST",
                decimals: 18,
              },
            },
          },
        });

        const pluginAddress: string = ADDRESS_ONE;
        const token = await client.methods.getToken(
          pluginAddress,
        ) as Erc20WrapperTokenDetails;
        expect(token.address).toBe(ADDRESS_THREE);
        expect(token.symbol).toBe("WTST");
        expect(token.name).toBe("Wrapped Test");
        expect(token.decimals).toBe(18);
        expect(token.type).toBe(TokenType.ERC20);
        expect(token.underlyingToken.address).toBe(ADDRESS_TWO);
        expect(token.underlyingToken.symbol).toBe("TST");
        expect(token.underlyingToken.name).toBe("Test");
        expect(token.underlyingToken.decimals).toBe(18);
        expect(token.underlyingToken.type).toBe(TokenType.ERC20);

        expect(mockedClient.request).toHaveBeenCalledWith(
          QueryTokenVotingPlugin,
          {
            address: pluginAddress,
          },
        );
      });
      it("Should return null token details for nonexistent plugin addresses", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);
        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );
        mockedClient.request.mockResolvedValueOnce({
          tokenVotingPlugin: null,
        });
        const pluginAddress: string = TEST_NON_EXISTING_ADDRESS;
        const token = await client.methods.getToken(pluginAddress);
        expect(token).toBe(null);
      });

      it("Should check if a ERC20 is compatible with governance and return false", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);
        const erc20Token = await deployErc20();
        expect(() =>
          client.methods.isTokenGovernanceCompatible(
            erc20Token.address,
          )
        ).rejects.toThrow();
      });
      it("Should check if ERC721 is compatible with governance and return false", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);
        const erc721Token = await deployErc721();
        expect(() =>
          client.methods.isTokenGovernanceCompatible(
            erc721Token.address,
          )
        ).rejects.toThrow();
      });
      it("Should check if GovernanceERC20 is compatible with governance and return true", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new TokenVotingClient(ctx);
        const dao = await buildTokenVotingDAO(repoAddr, VotingMode.STANDARD);
        const isCompatible = await client.methods.isTokenGovernanceCompatible(
          dao.tokenAddress,
        );
        expect(isCompatible).toBe(true);
      });
    });
  });
});
