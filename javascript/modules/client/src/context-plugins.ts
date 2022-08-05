import { Context, ContextParams as MainContextParams } from "./context";
import { ContextState } from "./internal/interfaces/context";

type ContextPluginState = {
  pluginAddress: string;
};
export type ContextPluginParams = MainContextParams & {
  pluginAddress: string;
};

// State
const defaultState: ContextPluginState = {
  pluginAddress: "",
};

export class ContextPlugin extends Context {
  protected state: ContextState & ContextPluginState = Object.assign(
    {},
    Context.getDefault(),
    defaultState,
  );

  // INTERNAL CONTEXT STATE

  /**
   * @param {ContextPluginParams} params The parameters for the client context
   *
   * @constructor
   */
  constructor(params: Partial<ContextPluginParams>) {
    super(params);

    this.set(params);
  }

  /**
   * Does set and parse the given context configuration object
   *
   * @method setFull
   *
   * @returns {void}
   *
   * @private
   */
  setFull(contextParams: ContextPluginParams): void {
    super.setFull(contextParams);

    if (contextParams?.pluginAddress?.length != 42) {
      throw new Error("Invalid plugin address");
    }

    this.state.pluginAddress = contextParams.pluginAddress;
  }

  set(contextParams: Partial<ContextPluginParams>) {
    super.set(contextParams);

    if (contextParams.pluginAddress) {
      this.state.pluginAddress = contextParams.pluginAddress;
    }
  }

  // GETTERS

  /**
   * Returns the plugin contract address used to interact with
   *
   * @var pluginAddress
   *
   * @returns {string}
   *
   * @public
   */
  get pluginAddress() {
    return this.state.pluginAddress || defaultState.pluginAddress;
  }

  // DEFAULT CONTEXT STATE
  static setDefault(params: Partial<ContextPluginParams>) {
    super.setDefault(params);

    if (params.pluginAddress) {
      defaultState.pluginAddress = params.pluginAddress;
    }
  }
  static getDefault() {
    return Object.assign(super.getDefault(), defaultState);
  }
}
