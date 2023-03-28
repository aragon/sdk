export class ClientError extends Error {
  public response: Response;
  constructor(res: Response) {
    super(res.statusText);
    this.name = "ClientError";
    this.response = res;
  }
}

export class InvalidResponseError extends ClientError {
  constructor(res: Response) {
    super(res);
    this.message = "Invalid response";
  }
}
export class MissingBodyeError extends ClientError {
  constructor(res: Response) {
    super(res);
    this.message = "Missing response body";
  }
}
export class BodyParseError extends ClientError {
  constructor(res: Response) {
    super(res);
    this.message = "Error parsing body";
  }
}
