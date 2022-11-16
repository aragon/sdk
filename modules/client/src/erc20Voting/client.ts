import { Context } from "../client-common";
import { ERC20VotingDecoding } from "./internal/decoding";
import { ERC20VotingEncoding } from "./internal/encoding";
import { ERC20VotingEstimation } from "./internal/estimation";
import { ERC20VotingMethods } from "./internal/methods";

export class ERC20Voting {
  public methods: ERC20VotingMethods;
  public estimation: ERC20VotingEstimation;
  public encoding: ERC20VotingEncoding;
  public decoding: ERC20VotingDecoding;

  constructor(context: Context) {
    this.methods = new ERC20VotingMethods(context);
    this.estimation = new ERC20VotingEstimation(context);
    this.encoding = ERC20VotingEncoding;
    this.decoding = ERC20VotingDecoding;
  }
}
