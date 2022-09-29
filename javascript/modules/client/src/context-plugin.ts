import { Context, ContextParams as MainContextParams } from "./context";
import { ContextState } from "./internal/interfaces/context";

type ContextPluginState = {};
export type ContextPluginParams = MainContextParams;

// State
const defaultState: ContextPluginState = {};

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
   * Generate a plugin context from a client clontext and a plugin address
   *
   * @param {Context} ctx
   * @param {string} pluginAddress
   * @return {*}  {ContextPlugin}
   * @memberof ContextPlugin
   */
  static fromContext(ctx: Context): ContextPlugin {
    const ctxPlugin = new ContextPlugin({});
    Object.assign(ctxPlugin, ctx);
    return ctxPlugin;
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
  }

  set(contextParams: Partial<ContextPluginParams>) {
    super.set(contextParams);
  }

  // DEFAULT CONTEXT STATE
  static setDefault(params: Partial<ContextPluginParams>) {
    super.setDefault(params);
  }
  static getDefault() {
    return Object.assign(super.getDefault(), defaultState);
  }
}
