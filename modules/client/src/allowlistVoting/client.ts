import {
  AllowlistVoting as AllowlistVotingContract,
  AllowlistVoting__factory,
} from "@aragon/core-contracts-ethers";
import { ClientCore } from "../client-common";
import { AllowlistVotingContextPlugin } from "./context";
import { AllowlistVotingDecoding } from "./internal/decoding";
import { AllowlistVotingEncoding } from "./internal/encoding";
import { AllowlistVotingEstimation } from "./internal/estimation";
import { AllowlistVotingMethods } from "./internal/methods";

export class AllowlistVoting extends ClientCore {
  public pluginInstance: AllowlistVotingContract;
  public methods: AllowlistVotingMethods;
  public estimation: AllowlistVotingEstimation;
  public encoding: AllowlistVotingEncoding;
  public decoding: AllowlistVotingDecoding;

  constructor(context: AllowlistVotingContextPlugin) {
    super(context);
    this.pluginInstance = AllowlistVoting__factory.connect(
      context.pluginAddress,
      this.web3.getConnectedSigner()
    );
    this.methods = new AllowlistVotingMethods(this);
    this.estimation = new AllowlistVotingEstimation(this);
    this.encoding = new AllowlistVotingEncoding(context.pluginAddress);
    this.decoding = AllowlistVotingDecoding;
  }

  public getPluginInstanceWithSigner(): AllowlistVotingContract {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    return this.pluginInstance.connect(signer);
  }

  public getPluginInstance(): AllowlistVotingContract {
    const provider = this.web3.getProvider();
    if (!provider) {
      throw new Error("A web3 provider is needed");
    }
    return this.pluginInstance.connect(provider);
  }
}
