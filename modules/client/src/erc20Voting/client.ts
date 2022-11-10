import {
  ERC20Voting as ERC20VotingContract,
  ERC20Voting__factory,
} from "@aragon/core-contracts-ethers";
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
    this.encoding = new ERC20VotingEncoding(this);
    this.decoding = new ERC20VotingDecoding(this);
  }

  public getConnectedPluginInstance(): ERC20VotingContract {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    return this.pluginInstance.connect(signer);
  }
}
