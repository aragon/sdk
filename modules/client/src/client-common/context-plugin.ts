import { Context } from "./context";
import {
  ContextPluginParams,
  ContextPluginState,
  ContextState,
} from "./interfaces/context";
// State
const defaultState: ContextPluginState = {};

export class ContextPlugin<T extends {} = {}> extends Context {
  protected state: ContextState & T = Object.assign(
    {} as T,
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
