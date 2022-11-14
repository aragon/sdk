import { Context } from "./client-common/context";
import { ClientMethods } from "./internal/client/methods";
import { ClientEncoding } from "./internal/client/encoding";
import { ClientEstimation } from "./internal/client/estimation";
import { ClientDecoding } from "./internal/client/decoding";
import { ClientCore } from "./client-common/core";

/**
 * Provider a generic client with high level methods to manage and interact with DAO's
 */
export class Client extends ClientCore {
  private privateMethods: ClientMethods;
  private privateEncoding: ClientEncoding;
  private privateDecoding: ClientDecoding;
  private privateEstimation: ClientEstimation;

  constructor(context: Context) {
    super(context);
    this.privateMethods = new ClientMethods(context);
    this.privateEncoding = new ClientEncoding();
    this.privateDecoding = new ClientDecoding(context);
    this.privateEstimation = new ClientEstimation(context);
    Object.freeze(Client.prototype);
    Object.freeze(this);
  }
  get methods(): ClientMethods {
    return this.privateMethods;
  }
  get encoding(): ClientEncoding {
    return this.privateEncoding;
  }
  get decoding(): ClientDecoding {
    return this.privateDecoding;
  }
  get estimation(): ClientEstimation {
    return this.privateEstimation;
  }
}
