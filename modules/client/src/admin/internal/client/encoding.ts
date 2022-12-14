import { ClientCore, ContextPlugin } from "../../../client-common";
import { IClientAdminEncoding } from "../../interfaces";

export class ClientAdminEncoding extends ClientCore
  implements IClientAdminEncoding {
  constructor(context: ContextPlugin) {
    super(context);
  }
}
