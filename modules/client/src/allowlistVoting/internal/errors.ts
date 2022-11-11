export class CreateVoteError extends Error {
  constructor() {
    super("Failed to create vote");
  }
}
