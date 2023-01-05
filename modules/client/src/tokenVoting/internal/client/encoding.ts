import { hexToBytes, InvalidAddressError, strip0x } from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  DaoAction,
  encodeUpdatePluginSettingsAction,
  IPluginInstallItem,
  VotingSettings,
} from "../../../client-common";
import { isAddress } from "@ethersproject/address";
import {
  IMintTokenParams,
  ITokenVotingClientEncoding,
  ITokenVotingPluginInstall,
} from "../../interfaces";
import { TOKEN_VOTING_PLUGIN_ID } from "../constants";
import {
  IERC20MintableUpgradeable__factory,
} from "@aragon/core-contracts-ethers";
import {
  mintTokenParamsToContract,
  tokenVotingInitParamsToContract,
} from "../utils";
import { defaultAbiCoder } from "@ethersproject/abi";
/**
 * Encoding module the SDK TokenVoting Client
 */
export class TokenVotingClientEncoding extends ClientCore
  implements ITokenVotingClientEncoding {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(TokenVotingClientEncoding.prototype);
    Object.freeze(this);
  }
  /**
   * Computes the parameters to be given when creating the DAO,
   * so that the plugin is configured
   *
   * @param {ITokenVotingPluginInstall} params
   * @return {*}  {IPluginInstallItem}
   * @memberof TokenVotingClientEncoding
   */
  static getPluginInstallItem(
    params: ITokenVotingPluginInstall,
  ): IPluginInstallItem {
    const args = tokenVotingInitParamsToContract(params);
    const hexBytes = defaultAbiCoder.encode(
      // ["votingMode","supportThreshold", "minParticipation", "minDuration"], ["address","name","symbol"][ "receivers","amount"]
      [
        "tuple(uint8, uint64, uint64, uint64, uint256)",
        "tuple(address, string, string)",
        "tuple(address[], uint256[])",
      ],
      args,
    );
    // Strip 0x => encode in Uint8Array
    const data = hexToBytes(strip0x(hexBytes));
    return {
      id: TOKEN_VOTING_PLUGIN_ID,
      data,
    };
  }
  /**
   * Computes the parameters to be given when creating a proposal that updates the governance configuration
   *
   * @param {string} pluginAddress
   * @param {VotingSettings} params
   * @return {*}  {DaoAction}
   * @memberof TokenVotingClientEncoding
   */
  public updatePluginSettingsAction(
    pluginAddress: string,
    params: VotingSettings,
  ): DaoAction {
    if (!isAddress(pluginAddress)) {
      throw new Error("Invalid plugin address");
    }
    // TODO: check if to and value are correct
    return {
      to: pluginAddress,
      value: BigInt(0),
      data: encodeUpdatePluginSettingsAction(params),
    };
  }

  /**
   * Computes the parameters to be given when creating a proposal that mints an amount of ERC-20 tokens to an address
   *
   * @param {string} minterAddress
   * @param {IMintTokenParams} params
   * @return {*}  {DaoAction}
   * @memberof TokenVotingClientEncoding
   */
  public mintTokenAction(
    minterAddress: string,
    params: IMintTokenParams,
  ): DaoAction {
    if (!isAddress(minterAddress) || !isAddress(params.address)) {
      throw new InvalidAddressError();
    }
    const votingInterface = IERC20MintableUpgradeable__factory
      .createInterface();
    const args = mintTokenParamsToContract(params);
    // get hex bytes
    const hexBytes = votingInterface.encodeFunctionData("mint", args);
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: minterAddress,
      value: BigInt(0),
      data,
    };
  }
}
