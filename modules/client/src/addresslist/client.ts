import {
  AllowlistVoting,
  AllowlistVoting__factory,
} from "@aragon/core-contracts-ethers";
import { NoProviderError, NoSignerError } from "@aragon/sdk-common";
import { ClientCore } from "../client-common";
import { AddresslistContextPlugin } from "./context";
import { AddresslistDecoding } from "./internal/decoding";
import { AddresslistEncoding } from "./internal/encoding";
import { AddresslistEstimation } from "./internal/estimation";
import { AddresslistMethods } from "./internal/methods";

export class Addresslist extends ClientCore {
  public pluginInstance: AllowlistVoting;
  public methods: AddresslistMethods;
  public estimation: AddresslistEstimation;
  public encoding: AddresslistEncoding;
  public decoding: AddresslistDecoding;

  constructor(context: AddresslistContextPlugin) {
    super(context);
    this.pluginInstance = AllowlistVoting__factory.connect(
      context.pluginAddress,
      this.web3.getConnectedSigner()
    );
    this.methods = new AddresslistMethods(this);
    this.estimation = new AddresslistEstimation(this);
    this.encoding = new AddresslistEncoding(context.pluginAddress);
    this.decoding = AddresslistDecoding;
  }

  public getPluginInstanceWithSigner(): AllowlistVoting {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    return this.pluginInstance.connect(signer);
  }

  public getPluginInstance(): AllowlistVoting {
    const provider = this.web3.getProvider();
    if (!provider) {
      throw new NoProviderError();
    }
    return this.pluginInstance.connect(provider);
  }
}
