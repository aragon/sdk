import {
  AllowlistVoting,
  AllowlistVoting__factory,
} from "@aragon/core-contracts-ethers";
import { NoProviderError } from "@aragon/sdk-common";
import { BigNumber } from "@ethersproject/bignumber";
import { ClientCore, Context } from "../../client-common";
import {
  ICreateProposalParams,
  ISetConfigurationParams,
  IVoteParams,
} from "../interfaces";

export class AddresslistEstimation extends ClientCore {
  constructor(context: Context) {
    super(context);
  }

  /**
   * Gets a plugin instance connected with a provider for the given address
   *
   * @private
   * @param {string} addr
   * @return {*}  {AllowlistVoting}
   * @memberof AddresslistEstimation
   */
  private getPluginInstance(addr: string): AllowlistVoting {
    const provider = this.web3.getProvider();
    if (!provider) {
      throw new NoProviderError();
    }
    return AllowlistVoting__factory.connect(addr, provider);
  }

  /**
   * Returns a gas estimation for the function call to addAllowedUsers
   *
   * @param {string} pluginAddr
   * @param {string[]} _users
   * @return {*}  {Promise<bigint>}
   * @memberof AddresslistEstimation
   */
  public async addAllowedUsers(
    pluginAddr: string,
    _users: string[]
  ): Promise<bigint> {
    return (
      await this.getPluginInstance(pluginAddr).estimateGas.addAllowedUsers(
        _users
      )
    ).toBigInt();
  }

  /**
   * Returns a gas estimation for the function call to createProposal
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {Promise<bigint>}
   * @memberof AddresslistEstimation
   */
  public async createProposal(params: ICreateProposalParams): Promise<bigint> {
    return (
      await this.getPluginInstance(params.pluginAddr).estimateGas.createVote(
        params._proposalMetadata,
        params._actions.map(action => ({
          ...action,
          value: BigNumber.from(action.value),
        })),
        BigNumber.from(params._startDate),
        BigNumber.from(params._endDate),
        params._executeIfDecided,
        BigNumber.from(params._choice)
      )
    ).toBigInt();
  }

  /**
   * Returns a gas estimation for the function call to execute
   *
   * @param {string} pluginAddr
   * @param {number} _proposalId
   * @return {*}  {Promise<bigint>}
   * @memberof AddresslistEstimation
   */
  public async execute(
    pluginAddr: string,
    _proposalId: number
  ): Promise<bigint> {
    return (
      await this.getPluginInstance(pluginAddr).estimateGas.execute(_proposalId)
    ).toBigInt();
  }

  /**
   * Returns a gas estimation for the function call to removeAllowedUsers
   *
   * @param {string} pluginAddr
   * @param {string[]} _users
   * @return {*}  {Promise<bigint>}
   * @memberof AddresslistEstimation
   */
  public async removeAllowedUsers(
    pluginAddr: string,
    _users: string[]
  ): Promise<bigint> {
    return (
      await this.getPluginInstance(pluginAddr).estimateGas.removeAllowedUsers(
        _users
      )
    ).toBigInt();
  }

  /**
   * Returns a gas estimation for the function call to setConfiguration
   *
   * @param {ISetConfigurationParams} params
   * @return {*}  {Promise<bigint>}
   * @memberof AddresslistEstimation
   */
  public async setConfiguration(
    params: ISetConfigurationParams
  ): Promise<bigint> {
    return (
      await this.getPluginInstance(
        params.pluginAddr
      ).estimateGas.setConfiguration(
        BigNumber.from(params._participationRequiredPct),
        BigNumber.from(params._supportRequiredPct),
        BigNumber.from(params._minDuration)
      )
    ).toBigInt();
  }

  /**
   * Returns a gas estimation for the function call to vote
   *
   * @param {IVoteParams} params
   * @return {*}  {Promise<bigint>}
   * @memberof AddresslistEstimation
   */
  public async vote(params: IVoteParams): Promise<bigint> {
    return (
      await this.getPluginInstance(params.pluginAddr).estimateGas.vote(
        BigNumber.from(params._proposalId),
        BigNumber.from(params._choice),
        params._executesIfDecided
      )
    ).toBigInt();
  }
}
