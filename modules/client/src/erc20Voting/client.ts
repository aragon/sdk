import {
  ERC20Voting as ERC20VotingContract,
  ERC20Voting__factory,
} from "@aragon/core-contracts-ethers";
import { NoProviderError, NoSignerError } from "@aragon/sdk-common";
import { ClientCore } from "../client-common";
import { ERC20VotingContextPlugin } from "./context";
import { ERC20VotingDecoding } from "./internal/decoding";
import { ERC20VotingEncoding } from "./internal/encoding";
import { ERC20VotingEstimation } from "./internal/estimation";
import { ERC20VotingMethods } from "./internal/methods";

export class ERC20Voting extends ClientCore {
  public pluginInstance: ERC20VotingContract;
  public methods: ERC20VotingMethods;
  public estimation: ERC20VotingEstimation;
  public encoding: ERC20VotingEncoding;
  public decoding: ERC20VotingDecoding;

  constructor(context: ERC20VotingContextPlugin) {
    super(context);
    this.pluginInstance = ERC20Voting__factory.connect(
      context.pluginAddress,
      this.web3.getConnectedSigner()
    );
    this.methods = new ERC20VotingMethods(this);
    this.estimation = new ERC20VotingEstimation(this);
    this.encoding = new ERC20VotingEncoding(context.pluginAddress);
    this.decoding = ERC20VotingDecoding;
  }

  public getPluginInstanceWithSigner(): ERC20VotingContract {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    return this.pluginInstance.connect(signer);
  }

  public getPluginInstance(): ERC20VotingContract {
    const provider = this.web3.getProvider();
    if (!provider) {
      throw new NoProviderError();
    }
    return this.pluginInstance.connect(provider);
  }
}
